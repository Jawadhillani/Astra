// components/visualizations/TrendChart.jsx
'use client'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function TrendChart({ data }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data.timeSeriesData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={data.yDomain || [0, 'auto']} />
          <Tooltip />
          <Legend />
          
          {data.series.map((series, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={series.key}
              name={series.name}
              stroke={series.color || '#8884d8'}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}