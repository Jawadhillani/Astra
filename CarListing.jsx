'use client';

import React, { useState, useEffect } from 'react';
import {
  Database, AlertCircle, Search, Filter, 
  RefreshCw, Fuel, Gauge, Calendar, Sliders, ChevronRight, 
  ChevronDown, BarChart3, ListFilter, LayoutGrid, List, X,
  Info, ArrowUpDown, Check, Heart, Star, Settings, Eye
} from 'lucide-react';

// Import our car image components
import CarImage from './CarImage';
import { preloadCarImages } from './CarImageService';

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
  const [view, setView] = useState('grid');
  const [highlightedCard, setHighlightedCard] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('year');
  const [sortDirection, setSortDirection] = useState('desc');
  const [yearRange, setYearRange] = useState([2000, 2023]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState([]);
  const [hoveredCar, setHoveredCar] = useState(null);

  const bodyTypes = ['Sedan', 'SUV', 'Pickup', 'Coupe', 'Hatchback', 'Convertible', 'Wagon'];

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
      } catch (err) {
        setDbStatus({
          checked: true,
          usingFallback: true,
          message: 'Unable to check database status'
        });
      }
    }
    checkDatabaseStatus();
  }, []);

  useEffect(() => {
    async function fetchManufacturers() {
      try {
        const response = await fetch('/api/cars');
        if (!response.ok) return;
        const carsData = await response.json();
        const uniqueManufacturers = [...new Set(carsData.map(car => car.manufacturer).filter(Boolean))];
        setManufacturers(uniqueManufacturers);
      } catch {}
    }
    fetchManufacturers();
  }, []);

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        let url = '/api/cars';
        const params = new URLSearchParams();
        if (selectedManufacturer) params.set('manufacturer', selectedManufacturer);
        if (searchTerm) params.set('query', searchTerm);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const data = await response.json();
        let sortedData = sortCars(data, sortField, sortDirection);
        let filteredData = sortedData;

        if (selectedBodyTypes.length > 0) {
          filteredData = filteredData.filter(car => selectedBodyTypes.includes(car.body_type));
        }

        filteredData = filteredData.filter(car => car.year >= yearRange[0] && car.year <= yearRange[1]);
        
        // Preload images for better performance
        preloadCarImages(filteredData);
        
        setCars(filteredData || []);
      } catch {
        setCars([]);
      } finally {
        setLoading(false);
      }
    }
    if (dbStatus.checked) fetchCars();
  }, [searchTerm, selectedManufacturer, dbStatus.checked, sortField, sortDirection, selectedBodyTypes, yearRange]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleManufacturerChange = (e) => setSelectedManufacturer(e.target.value);
  const handleBodyTypeToggle = (type) => setSelectedBodyTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const sortCars = (array, field, direction) => [...array].sort((a, b) => {
    let aVal = a[field], bVal = b[field];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  // Generate car style based on manufacturer
  const getCarStyle = (manufacturer, model) => {
    const styles = {
      'BMW': {
        bg: 'from-blue-600 to-violet-900',
        accent: 'text-blue-400'
      },
      'Dodge': {
        bg: 'from-red-600 to-violet-900',
        accent: 'text-red-400'
      }
    };
    
    return styles[manufacturer] || { bg: 'from-violet-600 to-indigo-900', accent: 'text-violet-400' };
  };

  // Render star ratings
  const renderStars = (manufacturer) => {
    // Use manufacturer to determine a mock rating
    const ratings = {
      'BMW': 4.7,
      'Dodge': 4.2
    };
    
    const rating = ratings[manufacturer] || 4.0;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            fill={star <= Math.floor(rating) ? "#9333EA" : "none"}
            stroke={star <= Math.floor(rating) ? "#9333EA" : "#6B7280"}
            className="w-3 h-3" 
          />
        ))}
        <span className="ml-1 text-xs font-medium text-gray-300">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="text-white">
      {/* Page header with gradient background */}
      <div className="relative mb-8 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 to-black"></div>
        
        {/* Diagonal pattern overlay */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(124, 58, 237, 0.2) 25%, transparent 25%, transparent 50%, rgba(124, 58, 237, 0.2) 50%, rgba(124, 58, 237, 0.2) 75%, transparent 75%, transparent)`,
            backgroundSize: '20px 20px',
            opacity: 0.3
          }}
        ></div>
        
        <div className="relative z-10 px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
                <Database className="mr-3 h-6 w-6 text-violet-400" /> Premium Vehicle Database
              </h1>
              <p className="text-gray-300 max-w-2xl">
                Explore our comprehensive collection of vehicles with detailed specifications and performance metrics
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setView('grid')} 
                className={`p-2 rounded-lg ${view === 'grid' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-black/40 text-gray-300 border border-gray-800 hover:border-violet-500/50'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setView('list')} 
                className={`p-2 rounded-lg ${view === 'list' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-black/40 text-gray-300 border border-gray-800 hover:border-violet-500/50'}`}
                title="List View"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search box */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by manufacturer, model, or specs..."
            className="block w-full pl-12 pr-4 py-3 bg-black/40 border border-gray-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500 rounded-lg text-white placeholder-gray-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Manufacturer filter */}
        {manufacturers.length > 0 && (
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-500" />
            </div>
            <select
              className="appearance-none block w-full pl-12 pr-10 py-3 bg-black/40 border border-gray-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500 rounded-lg text-white"
              value={selectedManufacturer}
              onChange={handleManufacturerChange}
            >
              <option value="">All Manufacturers</option>
              {manufacturers.map((manu) => (
                <option key={manu} value={manu} className="bg-gray-900">{manu}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        )}

        {/* Advanced filters button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white px-5 py-3 rounded-lg font-medium flex items-center transition-all shadow-lg"
        >
          <Sliders className="h-5 w-5 mr-2" /> 
          {showFilters ? 'Hide Filters' : 'Advanced Filters'}
        </button>
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="mb-8 bg-black/60 border border-gray-800 rounded-xl p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-medium text-white flex items-center">
              <ListFilter className="w-5 h-5 mr-2 text-violet-400" /> Advanced Filters
            </h2>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sort options */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Sort By</h3>
              {[
                { field: 'year', icon: Calendar, label: 'Year' }, 
                { field: 'manufacturer', icon: Database, label: 'Manufacturer' }, 
                { field: 'mpg', icon: Gauge, label: 'Fuel Economy' }
              ].map(({ field, icon: Icon, label }) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-lg mb-2 border ${
                    sortField === field 
                      ? 'border-violet-500 bg-violet-900/20' 
                      : 'border-gray-800 bg-black/40 hover:border-violet-500/50'
                  } transition-colors`}
                >
                  <span className="flex items-center text-white">
                    <Icon className="w-4 h-4 mr-2 text-violet-400" />{label}
                  </span>
                  {sortField === field && (
                    <ArrowUpDown className={`w-4 h-4 text-violet-400 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Year range filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Year Range</h3>
              <div className="flex space-x-4">
                <div className="w-full">
                  <label className="text-xs text-gray-500 mb-1 block">From</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-black/40 border border-gray-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500 rounded-lg text-white" 
                    value={yearRange[0]} 
                    onChange={e => setYearRange([parseInt(e.target.value), yearRange[1]])} 
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs text-gray-500 mb-1 block">To</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-black/40 border border-gray-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500 rounded-lg text-white" 
                    value={yearRange[1]} 
                    onChange={e => setYearRange([yearRange[0], parseInt(e.target.value)])} 
                  />
                </div>
              </div>
            </div>

            {/* Body type filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Body Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {bodyTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <div className={`w-5 h-5 flex items-center justify-center rounded border ${
                      selectedBodyTypes.includes(type) 
                        ? 'bg-violet-600 border-violet-500' 
                        : 'border-gray-700 bg-black/40'
                    }`}>
                      {selectedBodyTypes.includes(type) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-gray-300 text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-t-2 border-r-2 border-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading vehicles...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center p-12 bg-black/40 border border-gray-800 rounded-xl">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-violet-900/20 border border-violet-500/20 mb-4">
            <Database className="w-8 h-8 text-violet-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No vehicles found</h2>
          <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedManufacturer('');
              setSelectedBodyTypes([]);
              setYearRange([2000, 2023]);
            }}
            className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-6 text-sm text-gray-400">
            Found {cars.length} vehicles matching your criteria
          </div>
          
          {/* Grid view */}
          {view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, index) => (
                <div
                  key={car.id}
                  className="relative group cursor-pointer car-entry-staggered"
                  style={{ '--car-index': index }}
                  onMouseEnter={() => setHoveredCar(car.id)}
                  onMouseLeave={() => setHoveredCar(null)}
                  onClick={() => onSelectCar?.(car)}
                >
                  {/* Animated border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                  
                  {/* Car card */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 group-hover:border-transparent rounded-xl overflow-hidden transition-all duration-300">
                    {/* Car image area with gradient */}
                    <div className={`h-48 relative overflow-hidden bg-gradient-to-br ${getCarStyle(car.manufacturer).bg}`}>
                      {/* Manufacturer tag */}
                      <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white">
                        {car.manufacturer}
                      </div>
                      
                      {/* Favorite button */}
                      <button className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors">
                        <Heart className="w-4 h-4 text-white/70 hover:text-red-400" />
                      </button>
                      
                      {/* Car image - USING OUR NEW COMPONENT */}
                      <CarImage 
                        car={car} 
                        view={hoveredCar === car.id ? 'detailed' : 'card'} 
                        className="w-full h-full"
                      />
                      
                      {/* Year badge */}
                      <div className="absolute bottom-3 right-3 z-10 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white">
                        {car.year}
                      </div>
                    </div>
                    
                    {/* Car details */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-white text-lg">{car.model}</h3>
                        <span className="text-xs text-gray-500">ID: {car.id}</span>
                      </div>
                      
                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3">
                        {car.engine_info && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Settings className="w-3 h-3 mr-1 text-violet-400" /> {car.engine_info}
                          </div>
                        )}
                        {car.transmission && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Settings className="w-3 h-3 mr-1 text-violet-400" /> {car.transmission}
                          </div>
                        )}
                        {car.body_type && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Settings className="w-3 h-3 mr-1 text-violet-400" /> {car.body_type}
                          </div>
                        )}
                        {car.mpg && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Fuel className="w-3 h-3 mr-1 text-violet-400" /> {car.mpg} MPG
                          </div>
                        )}
                        {car.fuel_type && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Fuel className="w-3 h-3 mr-1 text-violet-400" /> {car.fuel_type}
                          </div>
                        )}
                      </div>
                      
                      {/* Rating and view button */}
                      <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                        <div>{renderStars(car.manufacturer)}</div>
                        <button className="text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded flex items-center transition-colors opacity-0 group-hover:opacity-100">
                          <Eye className="w-3 h-3 mr-1" /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* List view */}
          {view === 'list' && (
            <div className="space-y-3">
              {cars.map((car, index) => (
                <div
                  key={car.id}
                  className="relative group cursor-pointer car-entry-staggered"
                  style={{ '--car-index': index }}
                  onMouseEnter={() => setHoveredCar(car.id)}
                  onMouseLeave={() => setHoveredCar(null)}
                  onClick={() => onSelectCar?.(car)}
                >
                  {/* Animated border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 group-hover:border-transparent rounded-lg overflow-hidden transition-all duration-300">
                    <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                      {/* Left: Car image */}
                      <div className="md:w-1/4 flex items-center">
                        <div className="h-16 w-16 mr-3">
                          <CarImage 
                            car={car} 
                            view="card" 
                            size="sm"
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{car.manufacturer} {car.model}</h3>
                          <p className="text-sm text-gray-400">{car.year} • ID: {car.id}</p>
                        </div>
                      </div>
                      
                      {/* Middle: Specs */}
                      <div className="md:w-2/4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {car.engine_info && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Settings className="w-4 h-4 mr-1 text-violet-400" /> {car.engine_info}
                          </div>
                        )}
                        {car.body_type && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Settings className="w-4 h-4 mr-1 text-violet-400" /> {car.body_type}
                          </div>
                        )}
                        {car.mpg && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Fuel className="w-4 h-4 mr-1 text-violet-400" /> {car.mpg} MPG
                          </div>
                        )}
                      </div>
                      
                      {/* Right: Actions */}
                      <div className="md:w-1/4 flex justify-end items-center space-x-3 w-full md:w-auto">
                        <div>{renderStars(car.manufacturer)}</div>
                        <button className="text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded flex items-center transition-colors">
                          <Eye className="w-3 h-3 mr-1" /> Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Add animation styles */}
      <style jsx>{`
        @keyframes carEntry {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .car-entry-staggered {
          opacity: 0;
          animation: carEntry 0.5s ease-out forwards;
          animation-delay: calc(var(--car-index, 0) * 0.1s);
        }
      `}</style>
    </div>
  );
}