const OverrideDataTable = ({ overrides, onToggle, loading }) => {
  return (
    <div className="table-container">
      <div className="bg-green-600 px-4 py-3">
        <h3 className="text-white font-semibold">Override Data</h3>
      </div>
      {loading ? (
        <div className="p-4 text-sm text-gray-600">Loading overrides...</div>
      ) : overrides.length === 0 ? (
        <div className="p-4 text-sm text-gray-600">No overrides found for this company.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="table-cell table-header text-green-900">Employee ID</th>
                <th className="table-cell table-header text-green-900">Feature Key</th>
                <th className="table-cell table-header text-green-900">Allow</th>
                <th className="table-cell table-header text-green-900">Created At</th>
                <th className="table-cell table-header text-green-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((item) => (
                <tr key={`${item.employee_id}-${item.feature_key}`} className="table-row">
                  <td className="table-cell">{item.employee_id}</td>
                  <td className="table-cell">{item.feature_key}</td>
                  <td className="table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.allow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.allow ? 'Allowed' : 'Denied'}
                    </span>
                  </td>
                  <td className="table-cell">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="table-cell">
                    <button
                      type="button"
                      onClick={() => onToggle(item)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                    >
                      Update
                    </button>
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

export default OverrideDataTable;
