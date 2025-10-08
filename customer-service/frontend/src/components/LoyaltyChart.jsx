import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function LoyaltyChart({ analytics, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const distribution = analytics?.loyalty_distribution || {};
  
  const data = [
    { name: 'Bronze', value: distribution.Bronze || 0, color: '#92400e' },
    { name: 'Silver', value: distribution.Silver || 0, color: '#9ca3af' },
    { name: 'Gold', value: distribution.Gold || 0, color: '#eab308' },
    { name: 'Platinum', value: distribution.Platinum || 0, color: '#9333ea' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Loyalty Tier Distribution</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No customer data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Loyalty Tier Distribution</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((tier) => (
          <div key={tier.name} className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div 
                className="w-4 h-4 rounded mr-2" 
                style={{ backgroundColor: tier.color }}
              ></div>
              <span className="font-semibold">{tier.name}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: tier.color }}>
              {tier.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
