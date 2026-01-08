const CompanySidebar = ({ companies, selectedCompanyId, onSelect, loading }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Companies</h2>
        {loading && <span className="text-xs text-gray-500">Loading...</span>}
      </div>
      <div className="space-y-2">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`sidebar-item ${
              company.id === selectedCompanyId ? 'active' : ''
            }`}
            onClick={() => onSelect(company.id)}
          >
            <div className="text-sm font-medium">{company.name}</div>
            <div className="text-xs text-gray-600">ID: {company.id}</div>
          </div>
        ))}
        {!companies.length && !loading && (
          <p className="text-sm text-gray-500">No companies found.</p>
        )}
      </div>
    </div>
  );
};

export default CompanySidebar;
