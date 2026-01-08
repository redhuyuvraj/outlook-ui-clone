import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import CompanyDashboard from './components/CompanyDashboard';

// Unified backend now runs from outlook-ui-clone-main/backend/server.js on port 3001
const API_BASE = 'http://localhost:3001';

const fetchJson = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  return res.json();
};

function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingOverrides, setLoadingOverrides] = useState(false);
  const [error, setError] = useState('');

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await fetchJson('/api/companies');
        setCompanies(data);
        if (data.length) {
          setSelectedCompanyId((current) => current || data[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load companies');
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) return;
    const loadData = async () => {
      try {
        setError('');
        setLoadingEmployees(true);
        setLoadingOverrides(true);
        const [employeesData, overridesData] = await Promise.all([
          fetchJson(`/api/companies/${selectedCompanyId}/employees`),
          fetchJson('/api/overrides'),
        ]);
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
  }, [selectedCompanyId]);

  const handleToggleOverride = async (row) => {
    if (!selectedCompanyId) return;
    try {
      setError('');
      const nextAllow = !row.allow;
      await fetchJson(`/api/overrides/${row.employee_id}/${row.feature_key}`, {
        method: 'PUT',
        body: JSON.stringify({ allow: nextAllow }),
      });
      const [employeesData, overridesData] = await Promise.all([
        fetchJson(`/api/companies/${selectedCompanyId}/employees`),
        fetchJson('/api/overrides'),
      ]);
      setEmployees(employeesData);
      setOverrides(overridesData);
    } catch (err) {
      setError(err.message || 'Failed to update override');
    }
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompanyId(companyId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">StructIQe</h1>
          <p className="text-sm text-gray-600">
            Compare employee feature overrides with effective access permissions
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <aside className="md:col-span-1 table-container p-4">
          <Sidebar
            companies={companies}
            loading={loadingCompanies}
            selectedCompanyId={selectedCompanyId}
            onSelect={handleCompanySelect}
          />
        </aside>

        <main className="md:col-span-3">
          {error ? (
            <div className="mb-4 text-red-700 bg-red-100 border border-red-200 px-4 py-3 rounded">
              {error}
            </div>
          ) : null}

          <CompanyDashboard
            company={selectedCompany}
            employees={employees}
            overrides={overrides}
            loadingEmployees={loadingEmployees}
            loadingOverrides={loadingOverrides}
            onToggleOverride={handleToggleOverride}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
