require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const handleSupabaseError = (res, error, context) => {
  console.error(`Supabase error in ${context}:`, error);
  res.status(500).json({ message: 'Internal server error', details: error.message });
};

app.get('/api/companies', async (_req, res) => {
  const { data, error } = await supabase.from('companies').select('id, name').order('name', { ascending: true });
  if (error) return handleSupabaseError(res, error, 'GET /api/companies');
  res.json(data || []);
});

app.get('/api/companies/:companyId/employees', async (req, res) => {
  const { companyId } = req.params;
  const { data, error } = await supabase
    .from('employees_effective_access_mat')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true });

  if (error) return handleSupabaseError(res, error, 'GET /api/companies/:companyId/employees');
  res.json(data || []);
});

app.get('/api/overrides', async (_req, res) => {
  const { data, error } = await supabase
    .from('employee_feature_overrides')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return handleSupabaseError(res, error, 'GET /api/overrides');
  res.json(data || []);
});

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

  const { data, error } = await supabase
    .from('employee_feature_overrides')
    .upsert(payload, { onConflict: 'employee_id,feature_key' })
    .select();

  if (error) return handleSupabaseError(res, error, 'PUT /api/overrides/:employeeId/:featureKey');
  res.json(data?.[0] || payload);
});

app.delete('/api/overrides/:employeeId/:featureKey', async (req, res) => {
  const { employeeId, featureKey } = req.params;

  const { error } = await supabase
    .from('employee_feature_overrides')
    .delete()
    .match({ employee_id: employeeId, feature_key: featureKey });

  if (error) return handleSupabaseError(res, error, 'DELETE /api/overrides/:employeeId/:featureKey');
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`StructIQe backend listening on http://localhost:${PORT}`);
});
