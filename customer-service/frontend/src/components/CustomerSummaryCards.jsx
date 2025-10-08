export default function CustomerSummaryCards({ analytics, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Customers',
      value: analytics?.total_customers || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Customers',
      value: analytics?.active_customers || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Inactive Customers',
      value: analytics?.inactive_customers || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} p-6 rounded-lg shadow-md`}>
          <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
          <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
