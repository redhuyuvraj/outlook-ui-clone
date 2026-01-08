import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Allow requests from local frontends (Vite, etc.)
app.use(
  cors({
    origin: [
      'http://localhost:5173', // main Outlook UI clone (Vite default)
      'http://localhost:3000', // common React dev port
      'http://localhost:5174', // optional second Vite instance
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
  })
);

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Shared Supabase error helper (reused by multiple routes)
const handleSupabaseError = (res, error, context) => {
  console.error(`Supabase error in ${context}:`, error);
  res.status(500).json({ message: 'Internal server error', details: error.message });
};

// -------------------------
// Auth endpoints
// -------------------------

// Sign in endpoint
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    const session = data.session;
    const user = data.user;

    if (!session || !user) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    // Validate user id
    const userId = user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Missing user ID' });
    }

    // Link employee to auth (call RPC)
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } }
    });
    try {
      const { error: linkError } = await userSupabase.rpc('link_employee_to_auth');
      if (linkError) {
        console.warn('Link employee failed:', linkError);
        // Don't fail login if already linked
      }
    } catch (err) {
      console.warn('Link employee error:', err);
    }

    // Get effective access
    const { data: access, error: accessError } = await userSupabase
      .from('effective_access')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Access query result:', { data: access, error: accessError, userId });

    // Temporarily allow login even if no access, for debugging
    // if (accessError || !access) {
    //   return res.status(403).json({ success: false, message: 'No access assigned. Contact admin.' });
    // }

    // Assume access has role/position
    const role = (access && access.position) || 'employee'; // Default to employee if no access
    // Set expires_at for session
    const expiresIn = session.expires_in || 3600; // Default 1 hour
    session.expires_at = new Date(Date.now() + expiresIn * 1000).toISOString();
    res.json({
      success: true,
      session,
      user: { id: userId, email: user.email },
      access: role,
      message: 'Login successful (access check disabled for debugging).',
    });
  } catch (err) {
    console.error('Sign in error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// -------------------------
// StructIQe data endpoints
// (migrated from development/backend/server.js)
// -------------------------

// List companies
app.get('/api/companies', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) return handleSupabaseError(res, error, 'GET /api/companies');
    res.json(data || []);
  } catch (err) {
    handleSupabaseError(res, err, 'GET /api/companies (unexpected)');
  }
});

// Employees for a given company (with effective access info)
app.get('/api/companies/:companyId/employees', async (req, res) => {
  const { companyId } = req.params;

  try {
    const { data, error } = await supabase
      .from('employees_effective_access_mat')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) return handleSupabaseError(res, error, 'GET /api/companies/:companyId/employees');
    res.json(data || []);
  } catch (err) {
    handleSupabaseError(res, err, 'GET /api/companies/:companyId/employees (unexpected)');
  }
});

// All overrides
app.get('/api/overrides', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('employee_feature_overrides')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return handleSupabaseError(res, error, 'GET /api/overrides');
    res.json(data || []);
  } catch (err) {
    handleSupabaseError(res, err, 'GET /api/overrides (unexpected)');
  }
});

// Upsert / toggle a single override
app.put('/api/overrides/:employeeId/:featureKey', async (req, res) => {
  const { employeeId, featureKey } = req.params;
  const { allow } = req.body;

  if (typeof allow !== 'boolean') {
    return res.status(400).json({ message: 'Request body must include boolean allow' });
  }

  const payload = {
    employee_id: employeeId,
    feature_key: featureKey,
    allow,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('employee_feature_overrides')
      .upsert(payload, { onConflict: 'employee_id,feature_key' })
      .select();

    if (error) return handleSupabaseError(res, error, 'PUT /api/overrides/:employeeId/:featureKey');
    res.json(data?.[0] || payload);
  } catch (err) {
    handleSupabaseError(res, err, 'PUT /api/overrides/:employeeId/:featureKey (unexpected)');
  }
});

// Delete an override
app.delete('/api/overrides/:employeeId/:featureKey', async (req, res) => {
  const { employeeId, featureKey } = req.params;

  try {
    const { error } = await supabase
      .from('employee_feature_overrides')
      .delete()
      .match({ employee_id: employeeId, feature_key: featureKey });

    if (error) return handleSupabaseError(res, error, 'DELETE /api/overrides/:employeeId/:featureKey');
    res.json({ success: true });
  } catch (err) {
    handleSupabaseError(res, err, 'DELETE /api/overrides/:employeeId/:featureKey (unexpected)');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});