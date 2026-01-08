import UpdatedDataTable from './UpdatedDataTable';
import OverrideDataTable from './OverrideDataTable';

const CompanyDashboard = ({
  company,
  employees,
  overrides,
  loadingEmployees,
  loadingOverrides,
  onToggleOverride,
}) => {
  const employeeIds = new Set(employees.map((emp) => emp.id));
  const companyOverrides = overrides.filter((o) => employeeIds.has(o.employee_id));

  if (!company) {
    return (
      <div className="table-container p-6 text-center text-gray-600">
        Select a company to view employee data.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{company.name}</h2>
          <p className="text-sm text-gray-600">ID: {company.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpdatedDataTable employees={employees} loading={loadingEmployees} />
        <OverrideDataTable
          overrides={companyOverrides}
          loading={loadingOverrides}
          onToggle={onToggleOverride}
        />
      </div>
    </div>
  );
};

export default CompanyDashboard;
