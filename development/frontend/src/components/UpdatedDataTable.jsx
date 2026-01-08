const UpdatedDataTable = ({ employees, loading }) => {
  return (
    <div className="table-container">
      <div className="bg-blue-600 px-4 py-3">
        <h3 className="text-white font-semibold">Updated Data</h3>
      </div>
      {loading ? (
        <div className="p-4 text-sm text-gray-600">Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="p-4 text-sm text-gray-600">No employees found for this company.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="table-cell table-header text-blue-900">Employee ID</th>
                <th className="table-cell table-header text-blue-900">Company ID</th>
                <th className="table-cell table-header text-blue-900">Name</th>
                <th className="table-cell table-header text-blue-900">Email</th>
                <th className="table-cell table-header text-blue-900">Eff PA</th>
                <th className="table-cell table-header text-blue-900">Eff CA</th>
                <th className="table-cell table-header text-blue-900">Eff SA</th>
                <th className="table-cell table-header text-blue-900">Access by Module</th>
                <th className="table-cell table-header text-blue-900">Access by Software</th>
                <th className="table-cell table-header text-blue-900">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="table-row">
                  <td className="table-cell">{emp.id}</td>
                  <td className="table-cell">{emp.company_id}</td>
                  <td className="table-cell">{emp.name}</td>
                  <td className="table-cell">{emp.email}</td>
                  <td className="table-cell">{emp.eff_pa_enabled ? 'Yes' : 'No'}</td>
                  <td className="table-cell">{emp.eff_ca_enabled ? 'Yes' : 'No'}</td>
                  <td className="table-cell">{emp.eff_sa_enabled ? 'Yes' : 'No'}</td>
                  <td className="table-cell">
                    <pre className="text-xs whitespace-pre-wrap break-words">
                      {emp.access_by_module ? JSON.stringify(emp.access_by_module, null, 2) : '—'}
                    </pre>
                  </td>
                  <td className="table-cell">
                    <pre className="text-xs whitespace-pre-wrap break-words">
                      {emp.access_by_software ? JSON.stringify(emp.access_by_software, null, 2) : '—'}
                    </pre>
                  </td>
                  <td className="table-cell">
                    {emp.updated_at ? new Date(emp.updated_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UpdatedDataTable;
