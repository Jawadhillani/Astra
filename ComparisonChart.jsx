// components/visualizations/ComparisonChart.jsx
'use client'
import { 
  RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function ComparisonChart({ data, entities }) {
  // Format the comparison data for RadarChart
  const formattedData = data.categories.map((category, index) => {
    const result = { category };
    
    // Add value for each entity
    entities.forEach((entity, entityIndex) => {
      result[entity.name] = data.values[entityIndex][index];
    });
    
    return result;
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} data={formattedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis domain={[0, 5]} />
          
          {entities.map((entity, index) => (
            <Radar
              key={entity.id}
              name={entity.name}
              dataKey={entity.name}
              stroke={entity.color || '#8884d8'}
              fill={entity.color || '#8884d8'}
              fillOpacity={0.6}
            />
          ))}
          
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}