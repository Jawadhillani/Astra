'use client'
import React, { useState, useEffect } from 'react';
import { Star, AlertCircle, Database, Search, Filter, Car as CarIcon, RefreshCw, Fuel, Gauge, Calendar, Zap, Award } from 'lucide-react';

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
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [highlightedCard, setHighlightedCard] = useState(null);

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
  
  // Function to get gradient colors based on manufacturer
  const getGradient = (manufacturer = '') => {
    manufacturer = manufacturer.toLowerCase();
    
    if (manufacturer.includes('tesla')) {
      return 'from-red-800 to-violet-900';
    } else if (manufacturer.includes('bmw') || manufacturer.includes('mercedes')) {
      return 'from-blue-800 to-violet-900';
    } else if (manufacturer.includes('toyota') || manufacturer.includes('honda')) {
      return 'from-green-800 to-indigo-900';
    } else if (manufacturer.includes('ford')) {
      return 'from-indigo-800 to-blue-900';
    } else {
      return 'from-violet-800 to-indigo-900'; // Default
    }
  };

  // Car card component for grid view with hover effect
  const CarCard = ({ car, index }) => {
    const isHighlighted = highlightedCard === car.id;
    const gradient = getGradient(car.manufacturer);
    
    return (
      <div
        className={`dynamic-card cursor-pointer ${isHighlighted ? 'border-violet-500 shadow-lg shadow-violet-500/20' : ''}`}
        onClick={() => {
          if (onSelectCar) onSelectCar(car);
        }}
        onMouseEnter={() => setHighlightedCard(car.id)}
        onMouseLeave={() => setHighlightedCard(null)}
        style={{
          animationDelay: `${index * 0.05}s`
        }}
      >
        <div className={`h-40 bg-gradient-to-r ${gradient} flex items-center justify-center p-4`}>
          <CarIcon className="h-20 w-20 text-white animated-icon" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg">
            {car.manufacturer} {car.model}
          </h3>
          <p className={`text-violet-400 font-medium ${isHighlighted ? 'gradient-text' : ''}`}>{car.year}</p>
          
          {/* Car details */}
          <div className="mt-4 space-y-2">
            {car.engine_info && (
              <div className="flex items-center text-gray-400">
                <Fuel className={`h-4 w-4 mr-2 ${isHighlighted ? 'text-violet-400' : ''}`} />
                <span className="text-sm">{car.engine_info}</span>
              </div>
            )}
            
            {car.mpg && (
              <div className="flex items-center text-gray-400">
                <Gauge className={`h-4 w-4 mr-2 ${isHighlighted ? 'text-violet-400' : ''}`} />
                <span className="text-sm">{car.mpg} MPG</span>
              </div>
            )}
            
            {car.body_type && (
              <div className="flex items-center text-gray-400">
                <CarIcon className={`h-4 w-4 mr-2 ${isHighlighted ? 'text-violet-400' : ''}`} />
                <span className="text-sm">{car.body_type}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 mt-3">
            {car.body_type && (
              <span className={`inline-block ${isHighlighted ? 'badge-gradient' : 'bg-blue-900 text-blue-200'} text-xs px-2 py-1 rounded`}>
                {car.body_type}
              </span>
            )}
            
            {car.fuel_type && (
              <span className="inline-block bg-green-900 text-green-200 text-xs px-2 py-1 rounded">
                {car.fuel_type}
              </span>
            )}
            
            <span className={`inline-block ${isHighlighted ? 'bg-violet-900 text-violet-200' : 'bg-gray-800 text-gray-300'} text-xs px-2 py-1 rounded`}>
              ID: {car.id}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Car row component for list view
  const CarRow = ({ car }) => {
    const isHighlighted = highlightedCard === car.id;
    const gradient = getGradient(car.manufacturer);
    
    return (
      <div
        className={`dynamic-card cursor-pointer p-4 flex flex-wrap md:flex-nowrap gap-4 items-center ${isHighlighted ? 'border-violet-500' : ''}`}
        onClick={() => {
          if (onSelectCar) onSelectCar(car);
        }}
        onMouseEnter={() => setHighlightedCard(car.id)}
        onMouseLeave={() => setHighlightedCard(null)}
      >
        <div className={`bg-gradient-to-r ${gradient} h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center flex-shrink-0`}>
          <CarIcon className="h-8 w-8 text-white animated-icon" />
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-lg truncate">
            {car.manufacturer} {car.model}
          </h3>
          <div className="flex items-center mt-1">
            <Calendar className={`h-4 w-4 mr-1 ${isHighlighted ? 'text-violet-400' : 'text-gray-400'}`} />
            <span className={`font-medium ${isHighlighted ? 'text-violet-400' : 'text-blue-400'}`}>{car.year}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-shrink-0 w-full md:w-auto">
          {car.engine_info && (
            <div className="flex items-center text-gray-400 col-span-2 md:col-span-1">
              <Fuel className={`h-4 w-4 mr-2 flex-shrink-0 ${isHighlighted ? 'text-violet-400' : ''}`} />
              <span className="text-sm truncate">{car.engine_info}</span>
            </div>
          )}
          
          {car.mpg && (
            <div className="flex items-center text-gray-400">
              <Gauge className={`h-4 w-4 mr-2 flex-shrink-0 ${isHighlighted ? 'text-violet-400' : ''}`} />
              <span className="text-sm">{car.mpg} MPG</span>
            </div>
          )}
          
          {car.body_type && (
            <div className="flex items-center text-gray-400">
              <CarIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${isHighlighted ? 'text-violet-400' : ''}`} />
              <span className="text-sm">{car.body_type}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end flex-shrink-0 w-full md:w-auto">
          {car.fuel_type && (
            <span className={`inline-block ${isHighlighted ? 'badge-gradient' : 'bg-green-900 text-green-200'} text-xs px-2 py-1 rounded`}>
              {car.fuel_type}
            </span>
          )}
          
          <span className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
            ID: {car.id}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto page-transition">
      <div className="card-with-header mb-6">
        <div className="header bg-gradient-to-r from-violet-900 to-indigo-900">
          <h2 className="text-2xl font-bold flex items-center">
            <Award className="w-6 h-6 mr-2" /> Available Cars
          </h2>
        </div>
        
        <div className="content">
          {/* Database Status Alert */}
          {dbStatus.usingFallback && (
            <div className="alert-warning p-4 rounded-lg mb-6 flex items-center">
              <Database className="w-5 h-5 mr-3" />
              <div>
                <p className="font-medium">Using Fallback Database</p>
                <p className="text-sm">
                  Only sample car data is available. Some features may be limited.
                </p>
              </div>
            </div>
          )}
          
          {/* Search and Filter Controls */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search cars..."
                  className="w-full p-2 pl-10 bg-dark-card border border-dark-border rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              {manufacturers.length > 0 && (
                <div className="w-full md:w-auto relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="w-full md:w-64 p-2 pl-10 bg-dark-card border border-dark-border rounded-md appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
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
              
              {/* View toggle buttons with gradient border */}
              <div className="flex border border-violet-500 rounded-md overflow-hidden bg-dark-card">
                <button
                  className={`flex items-center px-3 py-2 ${view === 'grid' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white' : 'text-gray-300'}`}
                  onClick={() => setView('grid')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  className={`flex items-center px-3 py-2 ${view === 'list' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white' : 'text-gray-300'}`}
                  onClick={() => setView('list')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Car Listing Results */}
          {loading ? (
            <div className="text-center p-12">
              <div className="w-12 h-12 border-t-4 border-violet-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300">Loading vehicles...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="p-12 rounded-lg text-center border border-dark-border bg-dark-card">
              <CarIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No cars found</h3>
              <p className="text-gray-400 mb-6">No vehicles match your current search criteria.</p>
              {dbStatus.usingFallback && (
                <p className="text-sm text-yellow-500 mt-2">
                  Note: You're viewing limited sample data from the fallback database.
                </p>
              )}
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedManufacturer('');
                }}
                className="btn-primary"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                Found {cars.length} vehicle{cars.length !== 1 ? 's' : ''}
                {selectedManufacturer ? ` from ${selectedManufacturer}` : ''}
                {searchTerm ? ` matching "${searchTerm}"` : ''}
              </p>
              
              {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car, index) => (
                    <CarCard key={car.id} car={car} index={index} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {cars.map((car, index) => (
                    <CarRow key={car.id} car={car} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}