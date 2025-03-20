'use client'
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    minYear: 2000,
    maxYear: 2023,
    minRating: 0,
  });

  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams({
        query: searchParams.query,
        min_year: searchParams.minYear,
        max_year: searchParams.maxYear,
        min_rating: searchParams.minRating,
      });

      const response = await fetch(`/api/cars/search/advanced?${queryParams}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Advanced Search</h2>
        
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by manufacturer or model..."
            className="w-full p-2 border rounded"
            value={searchParams.query}
            onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
          />
        </div>

        {/* Year Range */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Year Range</label>
          <div className="flex gap-4">
            <input
              type="number"
              className="w-24 p-2 border rounded"
              value={searchParams.minYear}
              onChange={(e) => setSearchParams(prev => ({ ...prev, minYear: parseInt(e.target.value) }))}
            />
            <span className="self-center">to</span>
            <input
              type="number"
              className="w-24 p-2 border rounded"
              value={searchParams.maxYear}
              onChange={(e) => setSearchParams(prev => ({ ...prev, maxYear: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        {/* Min Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Minimum Rating</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            className="w-24 p-2 border rounded"
            value={searchParams.minRating}
            onChange={(e) => setSearchParams(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold">
                {car.manufacturer} {car.model}
              </h3>
              <p className="text-gray-600">{car.year}</p>
              {car.engine_info && (
                <p className="text-sm text-gray-500">Engine: {car.engine_info}</p>
              )}
              {car.mpg && (
                <p className="text-sm text-gray-500">MPG: {car.mpg}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;