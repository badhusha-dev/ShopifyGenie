export default function SalesDashboardCards({ summary, todaySales }) {
  const cards = [
    {
      title: 'Total Revenue',
      value: `$${summary?.total_revenue?.toFixed(2) || '0.00'}`,
      subtitle: `${summary?.total_sales || 0} total sales`,
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      title: 'Total Sales',
      value: summary?.total_sales || 0,
      subtitle: `${summary?.total_items_sold || 0} items sold`,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      title: "Today's Sales",
      value: todaySales?.sales_count || 0,
      subtitle: `$${todaySales?.revenue?.toFixed(2) || '0.00'} revenue`,
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      title: 'Estimated Profit',
      value: `$${summary?.profit?.toFixed(2) || '0.00'}`,
      subtitle: '30% margin',
      color: 'bg-amber-50 border-amber-200 text-amber-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} border-2 p-6 rounded-lg`}
        >
          <h3 className="text-sm font-medium opacity-80 mb-2">{card.title}</h3>
          <p className="text-3xl font-bold mb-1">{card.value}</p>
          <p className="text-sm opacity-70">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
