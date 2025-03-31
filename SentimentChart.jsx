// components/visualizations/SentimentChart.jsx
'use client'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

export default function SentimentChart({ data }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.aspectData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="aspect" type="category" width={80} />
          <Tooltip />
          <Legend />
          <Bar dataKey="positive" name="Positive Mentions" stackId="a" fill="#82ca9d">
            {data.aspectData.map((entry, index) => (
              <Cell key={`cell-positive-${index}`} fill="#82ca9d" />
            ))}
          </Bar>
          <Bar dataKey="negative" name="Negative Mentions" stackId="a" fill="#ff7979">
            {data.aspectData.map((entry, index) => (
              <Cell key={`cell-negative-${index}`} fill="#ff7979" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}