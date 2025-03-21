'use client'
import React, { useState, useEffect } from 'react';
// Remove the supabase import
import { Star, AlertCircle, Database } from 'lucide-react';

export default function CarListing({ onSelectCar }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [dbStatus, setDbStatus] = useState({
    checked: false,
    usingFallback: false,
    message: ''
  });

  // First check database status
  useEffect(() => {
    async function checkDatabaseStatus() {
      try {
        const response = await fetch('/api/test-db');
        const data = await response.json();
        
        setDbStatus({
          checked: true,
          usingFallback: data.using_fallback || false,
          message: data.message || ''
        });
        
        console.log("Database status:", data);
      } catch (err) {
        console.error("Failed to check database status:", err);
        setDbStatus({
          checked: true,
          usingFallback: true,
          message: 'Unable to check database status'
        });
      }
    }
    
    checkDatabaseStatus();
  }, []);

  // Fetch manufacturers for filter dropdown
  useEffect(() => {
    async function fetchManufacturers() {
      try {
        // Use the API endpoint for manufacturers
        // If your API doesn't have a specific manufacturers endpoint, extract them from cars
        const response = await fetch('/api/cars');
        
        if (!response.ok) {
          console.error("Failed to fetch cars for manufacturers:", response.status);
          return;
        }
        
        const carsData = await response.json();
        
        if (Array.isArray(carsData) && carsData.length > 0) {
          // Extract unique manufacturers from the cars data
          const uniqueManufacturers = [...new Set(
            carsData
              .map(car => car.manufacturer)
              .filter(Boolean) // Remove null/undefined values
          )];
          
          setManufacturers(uniqueManufacturers);
          console.log("Extracted manufacturers:", uniqueManufacturers);
        }
      } catch (error) {
        console.error("Error fetching manufacturers:", error);
        // Just continue without manufacturers filter
      }
    }
    
    fetchManufacturers();
  }, []);

  // Fetch cars
  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      
      try {
        // Always use the API to get cars
        let url = '/api/cars';
        
        // Add query parameters for filtering
        const params = new URLSearchParams();
        if (selectedManufacturer) params.set('manufacturer', selectedManufacturer);
        if (searchTerm) params.set('query', searchTerm);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        console.log("Fetching cars from:", url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch cars: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched cars:", data);
        setCars(data || []);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setCars([]);
      } finally {
        setLoading(false);
      }
    }
    
    // Only fetch cars after we know the database status
    if (dbStatus.checked) {
      fetchCars();
    }
  }, [searchTerm, selectedManufacturer, dbStatus.checked]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleManufacturerChange = (e) => {
    setSelectedManufacturer(e.target.value);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Available Cars</h2>
      
      {/* Database Status Alert */}
      {dbStatus.usingFallback && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          <div>
            <p className="font-medium">Using Fallback Database</p>
            <p className="text-sm">
              Only sample car data is available. Some features may be limited.
            </p>
          </div>
        </div>
      )}
      
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search cars..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {manufacturers.length > 0 && (
            <div className="w-full md:w-auto">
              <select
                className="w-full p-2 border rounded"
                value={selectedManufacturer}
                onChange={handleManufacturerChange}
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Car Listing */}
      {loading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading cars...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">No cars found matching your criteria.</p>
          {dbStatus.usingFallback && (
            <p className="text-sm text-yellow-600 mt-2">
              Note: You're viewing limited sample data from the fallback database.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <div
              key={car.id}
              className="p-4 border rounded-lg cursor-pointer bg-white hover:shadow-md transition-shadow"
              onClick={() => {
                if (onSelectCar) onSelectCar(car);
              }}
            >
              <h3 className="font-semibold text-lg text-gray-900">
                {car.manufacturer} {car.model}
              </h3>
              <p className="text-sm text-gray-700">{car.year}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {car.id}</p>
              
              {car.body_type && (
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-2 mr-2">
                  {car.body_type}
                </span>
              )}
              
              {car.fuel_type && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                  {car.fuel_type}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}