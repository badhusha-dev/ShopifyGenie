import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Last 7 Days Sales</h2>
        <p className="text-gray-500 text-center py-8">No chart data available</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: item.count,
    revenue: parseFloat(item.revenue)
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Last 7 Days Sales</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sales"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Sales Count"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#10B981"
            strokeWidth={2}
            name="Revenue ($)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
