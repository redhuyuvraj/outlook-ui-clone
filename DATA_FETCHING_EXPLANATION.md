# Data Fetching Flow Explanation

This document explains how data flows through your application, from the frontend to the backend to Supabase database.

## 📍 Overview

Your app has **two main data flows**:
1. **Authentication Flow** - Login/logout
2. **Company/Employee Data Flow** - Fetching companies, employees, and overrides

---

## 🔐 1. Authentication Data Fetching

### **Location:** `src/contexts/AuthContext.jsx`

### **Flow:**

#### **A. Sign In (Lines 36-51)**
```javascript
const signIn = async (email, password) => {
  // 1. Frontend sends POST request to backend
  const response = await fetch('http://localhost:3001/api/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  // 2. Backend processes and returns data
  const data = await response.json();
  
  // 3. If successful, store in React state AND localStorage
  if (data.success) {
    setUser(data.user);           // Store in React state
    setAccess(data.access);        // Store access level
    localStorage.setItem('user', JSON.stringify(data.user));  // Persist to browser storage
    localStorage.setItem('access', data.access);
    localStorage.setItem('session', JSON.stringify(data.session));
  }
  return data;
};
```

**What happens:**
- User enters email/password → `SignIn.jsx` calls `signIn()`
- `signIn()` sends POST to `http://localhost:3001/api/signin`
- Backend (`backend/server.js` lines 45-120) handles authentication
- Backend queries Supabase Auth API
- Response stored in React state + localStorage (for persistence)

#### **B. Check Existing Session (Lines 12-34)**
```javascript
useEffect(() => {
  const checkAuth = () => {
    // Check if user data exists in browser storage
    const storedUser = localStorage.getItem('user');
    const storedSession = localStorage.getItem('session');
    
    if (storedUser && storedSession) {
      const session = JSON.parse(storedSession);
      const expiresAt = new Date(session.expires_at);
      
      // Check if session is still valid
      if (now < expiresAt) {
        setUser(JSON.parse(storedUser));  // Restore user from storage
        setAccess(storedAccess);
      } else {
        // Session expired, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('access');
        localStorage.removeItem('session');
      }
    }
    setLoading(false);
  };
  checkAuth();
}, []);
```

**What happens:**
- On app load, checks localStorage for saved session
- If valid session exists → restore user state
- If expired → clear storage and show login page

---

## 🏢 2. Company/Employee Data Fetching

### **Location:** `src/pages/People.jsx`

### **Helper Function (Lines 8-18)**
```javascript
const API_BASE = 'http://localhost:3001';

const fetchJson = async (path, options = {}) => {
  // Makes HTTP request to backend API
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  
  // Handle errors
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  
  // Return parsed JSON
  return res.json();
};
```

**This is a reusable function** that:
- Prepends `http://localhost:3001` to all API paths
- Sets JSON headers
- Handles errors
- Returns parsed JSON data

---

### **A. Fetch Companies (Lines 35-51)**

**When:** Component first loads (empty dependency array `[]`)

```javascript
useEffect(() => {
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);  // Show loading spinner
      
      // Fetch from backend API
      const data = await fetchJson('/api/companies');
      // This calls: GET http://localhost:3001/api/companies
      
      setCompanies(data);  // Store in React state
      
      // Auto-select first company if available
      if (data.length) {
        setSelectedCompanyId((current) => current || data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoadingCompanies(false);  // Hide loading spinner
    }
  };
  loadCompanies();
}, []);  // Empty array = run once on mount
```

**Flow:**
1. Component mounts → `useEffect` runs
2. Calls `fetchJson('/api/companies')`
3. Backend (`server.js` lines 141-153) queries Supabase `companies` table
4. Returns array: `[{id: "...", name: "Company Name"}, ...]`
5. Stores in `companies` state
6. Auto-selects first company

---

### **B. Fetch Employees & Overrides (Lines 53-74)**

**When:** When a company is selected (`selectedCompanyId` changes)

```javascript
useEffect(() => {
  if (!selectedCompanyId) return;  // Don't fetch if no company selected
  
  const loadData = async () => {
    try {
      setError('');
      setLoadingEmployees(true);
      setLoadingOverrides(true);
      
      // Fetch BOTH in parallel using Promise.all
      const [employeesData, overridesData] = await Promise.all([
        fetchJson(`/api/companies/${selectedCompanyId}/employees`),
        // GET http://localhost:3001/api/companies/{id}/employees
        
        fetchJson('/api/overrides'),
        // GET http://localhost:3001/api/overrides
      ]);
      
      // Store both datasets
      setEmployees(employeesData);
      setOverrides(overridesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoadingEmployees(false);
      setLoadingOverrides(false);
    }
  };
  loadData();
}, [selectedCompanyId]);  // Re-run when company selection changes
```

**Flow:**
1. User clicks company → `selectedCompanyId` changes
2. `useEffect` detects change → triggers `loadData()`
3. **Two parallel requests** (faster than sequential):
   - Employees: `GET /api/companies/{id}/employees`
   - Overrides: `GET /api/overrides`
4. Backend queries Supabase:
   - `employees_effective_access_mat` table (filtered by company_id)
   - `employee_feature_overrides` table (all overrides)
5. Both datasets stored in React state
6. Tables update automatically (React re-renders)

---

### **C. Update Override (Lines 76-94)**

**When:** User clicks "Update" button on an override

```javascript
const handleToggleOverride = async (row) => {
  if (!selectedCompanyId) return;
  
  try {
    setError('');
    const nextAllow = !row.allow;  // Toggle: true → false, false → true
    
    // Update override in database
    await fetchJson(`/api/overrides/${row.employee_id}/${row.feature_key}`, {
      method: 'PUT',  // HTTP PUT request
      body: JSON.stringify({ allow: nextAllow }),
    });
    // PUT http://localhost:3001/api/overrides/{employeeId}/{featureKey}
    // Body: {"allow": true/false}
    
    // After update, refresh BOTH tables
    const [employeesData, overridesData] = await Promise.all([
      fetchJson(`/api/companies/${selectedCompanyId}/employees`),
      fetchJson('/api/overrides'),
    ]);
    
    // Update state → React re-renders tables
    setEmployees(employeesData);
    setOverrides(overridesData);
  } catch (err) {
    setError(err.message || 'Failed to update override');
  }
};
```

**Flow:**
1. User clicks "Update" → `handleToggleOverride(row)` called
2. Sends PUT request to update override in database
3. Backend (`server.js` lines 189-215) upserts to Supabase
4. **After update**, fetches fresh data for both tables
5. State updates → tables refresh automatically

---

## 🖥️ 3. Backend API Endpoints

### **Location:** `backend/server.js`

### **A. Companies Endpoint (Lines 141-153)**
```javascript
app.get('/api/companies', async (_req, res) => {
  try {
    // Query Supabase companies table
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')           // Only get id and name columns
      .order('name', { ascending: true });
    
    if (error) return handleSupabaseError(res, error, 'GET /api/companies');
    res.json(data || []);  // Send JSON response
  } catch (err) {
    handleSupabaseError(res, err, 'GET /api/companies (unexpected)');
  }
});
```

**What it does:**
- Receives GET request from frontend
- Queries Supabase `companies` table
- Returns JSON array: `[{id: "...", name: "..."}, ...]`

---

### **B. Employees Endpoint (Lines 156-171)**
```javascript
app.get('/api/companies/:companyId/employees', async (req, res) => {
  const { companyId } = req.params;  // Extract from URL: /api/companies/123/employees
  
  try {
    // Query Supabase view/table
    const { data, error } = await supabase
      .from('employees_effective_access_mat')  // Materialized view
      .select('*')                              // Get all columns
      .eq('company_id', companyId)              // Filter by company
      .order('name', { ascending: true });
    
    if (error) return handleSupabaseError(res, error, 'GET /api/companies/:companyId/employees');
    res.json(data || []);
  } catch (err) {
    handleSupabaseError(res, err, 'GET /api/companies/:companyId/employees (unexpected)');
  }
});
```

**What it does:**
- Receives GET request with company ID in URL
- Queries Supabase `employees_effective_access_mat` view
- Filters by `company_id`
- Returns all employee data with effective access info

---

### **C. Overrides Endpoint (Lines 174-186)**
```javascript
app.get('/api/overrides', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('employee_feature_overrides')
      .select('*')
      .order('created_at', { ascending: false });  // Newest first
    
    if (error) return handleSupabaseError(res, error, 'GET /api/overrides');
    res.json(data || []);
  } catch (err) {
    handleSupabaseError(res, err, 'GET /api/overrides (unexpected)');
  }
});
```

**What it does:**
- Returns ALL overrides (not filtered by company)
- Frontend filters by company in `CompanyDashboard.jsx` (line 13)

---

### **D. Update Override Endpoint (Lines 189-215)**
```javascript
app.put('/api/overrides/:employeeId/:featureKey', async (req, res) => {
  const { employeeId, featureKey } = req.params;  // From URL
  const { allow } = req.body;                       // From request body
  
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
    // Upsert = Insert if new, Update if exists
    const { data, error } = await supabase
      .from('employee_feature_overrides')
      .upsert(payload, { onConflict: 'employee_id,feature_key' })  // Conflict on composite key
      .select();
    
    if (error) return handleSupabaseError(res, error, 'PUT /api/overrides/:employeeId/:featureKey');
    res.json(data?.[0] || payload);
  } catch (err) {
    handleSupabaseError(res, err, 'PUT /api/overrides/:employeeId/:featureKey (unexpected)');
  }
});
```

**What it does:**
- Receives PUT request with employee ID and feature key in URL
- Gets `allow` boolean from request body
- Upserts (insert or update) to Supabase
- Returns updated override data

---

## 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  People.jsx Component                                    │  │
│  │                                                           │  │
│  │  1. Component mounts                                     │  │
│  │     ↓                                                     │  │
│  │  2. useEffect runs → fetchJson('/api/companies')         │  │
│  │     ↓                                                     │  │
│  │  3. User selects company                                 │  │
│  │     ↓                                                     │  │
│  │  4. useEffect runs → fetchJson('/api/companies/{id}/...')│  │
│  │     ↓                                                     │  │
│  │  5. User clicks "Update"                                  │  │
│  │     ↓                                                     │  │
│  │  6. fetchJson('/api/overrides/{id}/{key}', PUT)          │  │
│  │     ↓                                                     │  │
│  │  7. Refresh data → fetchJson('/api/companies/{id}/...')  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│                    HTTP Requests                                │
│                    (fetch API)                                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                         │
│                    Port: 3001                                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  server.js                                                │  │
│  │                                                           │  │
│  │  GET  /api/companies                                      │  │
│  │  GET  /api/companies/:id/employees                        │  │
│  │  GET  /api/overrides                                      │  │
│  │  PUT  /api/overrides/:empId/:featureKey                   │  │
│  │                                                           │  │
│  │  Each endpoint:                                          │  │
│  │  1. Receives HTTP request                                │  │
│  │  2. Queries Supabase                                     │  │
│  │  3. Returns JSON response                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│                    Supabase Client                              │
│                    (createClient)                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                            │
│                                                                 │
│  Tables:                                                        │
│  • companies                                                    │
│  • employees_effective_access_mat (view)                       │
│  • employee_feature_overrides                                   │
│  • effective_access                                             │
│                                                                 │
│  Auth:                                                          │
│  • Supabase Auth API (for login)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Key Concepts

### **1. React State Management**
- `useState` stores data in component memory
- When state changes → React re-renders component
- Example: `setCompanies(data)` → sidebar updates automatically

### **2. useEffect Hook**
- Runs code when component mounts or dependencies change
- Empty array `[]` = run once on mount
- `[selectedCompanyId]` = run when `selectedCompanyId` changes

### **3. Async/Await**
- `async` function can use `await` to wait for promises
- `fetch()` returns a Promise → `await` waits for response
- `res.json()` returns a Promise → `await` waits for parsed JSON

### **4. Promise.all()**
- Runs multiple async operations in parallel
- Faster than sequential `await` calls
- Example: Fetch employees AND overrides simultaneously

### **5. Error Handling**
- `try/catch` blocks catch errors
- Errors stored in `error` state → displayed to user
- Backend errors returned as JSON with status codes

---

## 🎯 Summary

**Frontend (`People.jsx`):**
- Uses `fetchJson()` helper to call backend APIs
- Stores data in React state (`useState`)
- Automatically re-fetches when company selection changes
- Refreshes data after updates

**Backend (`server.js`):**
- Express.js server on port 3001
- Receives HTTP requests
- Queries Supabase database
- Returns JSON responses

**Database (Supabase):**
- PostgreSQL database hosted on Supabase
- Tables: `companies`, `employees_effective_access_mat`, `employee_feature_overrides`
- Auth API for user authentication

**Flow:** Frontend → HTTP Request → Backend → Supabase → Database → Backend → JSON Response → Frontend → React State → UI Update
