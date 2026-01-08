import { useEffect, useMemo, useState } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import CompanyDashboard from '../components/CompanyDashboard';
import './Page.css';

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

const People = () => {
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
    <div className="page-container" style={{ backgroundColor: '#f3f4f6', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1>People & Companies</h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
          Manage employee access and feature overrides. Select a company to compare employee data and feature overrides.
        </p>
      </div>
      <div className="page-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: '16px', padding: '24px', backgroundColor: '#f3f4f6' }}>
        <aside style={{ width: '300px', flexShrink: 0 }}>
          <div className="table-container p-4" style={{ height: '100%', overflowY: 'auto' }}>
            <CompanySidebar
              companies={companies}
              loading={loadingCompanies}
              selectedCompanyId={selectedCompanyId}
              onSelect={handleCompanySelect}
            />
          </div>
        </aside>

        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
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
};

export default People;
