'use client'
import { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';

export const CarComparison = ({ cars }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('price');

  useEffect(() => {
    // Fetch comparison data when cars change
    const fetchData = async () => {
      const response = await fetch(`/api/cars/compare?car_ids=${cars.map(c => c.id).join(',')}`);
      const data = await response.json();
      setComparisonData(data);
    };
    
    if (cars.length > 0) {
      fetchData();
    }
  }, [cars]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Car Comparison</h2>
      
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisonData.map(item => (
          <div key={item.car.id} className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold">
              {item.car.manufacturer} {item.car.model} ({item.car.year})
            </h3>
            
            {/* Specs */}
            <div className="mt-4 space-y-2">
              <p>Engine: {item.car.engine_info}</p>
              <p>MPG: {item.car.mpg}</p>
              <p>Body Type: {item.car.body_type}</p>
            </div>
            
            {/* Analysis */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Review Analysis</h4>
              <p>Average Rating: {item.analysis.average_rating.toFixed(1)}/5</p>
              <p>Total Reviews: {item.analysis.total_reviews}</p>
              <div className="mt-2">
                <div className="bg-green-100 rounded p-2 mb-1">
                  Positive: {item.analysis.sentiment.positive}
                </div>
                <div className="bg-red-100 rounded p-2">
                  Negative: {item.analysis.sentiment.negative}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};