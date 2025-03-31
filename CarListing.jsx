'use client';

import React, { useState, useEffect } from 'react';
import {
  Database, AlertCircle, Search, Filter, Car as CarIcon, 
  RefreshCw, Fuel, Gauge, Calendar, Sliders, ChevronRight, 
  ChevronDown, BarChart3, ListFilter, LayoutGrid, List, X,
  Info, ArrowUpDown, Check
} from 'lucide-react';

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

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <Database className="mr-2" /> Vehicle Database
      </h1>

      {dbStatus.usingFallback && (
        <div className="mb-4 bg-yellow-900/30 text-yellow-300 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" /> Sample dataset active. Features may be limited.
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search cars..."
            className="pl-10 py-2 px-3 bg-dark-bg border border-dark-border rounded-md w-full"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {manufacturers.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-10 py-2 px-3 bg-dark-bg border border-dark-border rounded-md"
              value={selectedManufacturer}
              onChange={handleManufacturerChange}
            >
              <option value="">All Manufacturers</option>
              {manufacturers.map((manu) => (
                <option key={manu} value={manu}>{manu}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border border-dark-border bg-dark-bg rounded-md text-sm"
        >
          <Sliders className="inline w-4 h-4 mr-2" /> Advanced
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 bg-dark-bg border border-dark-border rounded-lg p-4">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white flex items-center">
              <ListFilter className="w-5 h-5 mr-2 text-blue-400" /> Filters
            </h2>
            <X onClick={() => setShowFilters(false)} className="cursor-pointer text-gray-400 hover:text-white" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm text-gray-300 mb-2">Sort By</h4>
              {[{ field: 'year', icon: Calendar, label: 'Year' }, { field: 'manufacturer', icon: CarIcon, label: 'Manufacturer' }, { field: 'mpg', icon: Gauge, label: 'Fuel Economy' }].map(({ field, icon: Icon, label }) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-md border mb-2 ${sortField === field ? 'border-blue-500 text-blue-400' : 'border-dark-border text-gray-400'}`}
                >
                  <span className="flex items-center"><Icon className="w-4 h-4 mr-2" />{label}</span>
                  {sortField === field && <ArrowUpDown className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />}
                </button>
              ))}
            </div>

            <div>
              <h4 className="text-sm text-gray-300 mb-2">Year Range</h4>
              <div className="flex space-x-2">
                <input type="number" className="bg-dark-bg border border-dark-border rounded-md px-3 py-2 w-full" value={yearRange[0]} onChange={e => setYearRange([parseInt(e.target.value), yearRange[1]])} />
                <input type="number" className="bg-dark-bg border border-dark-border rounded-md px-3 py-2 w-full" value={yearRange[1]} onChange={e => setYearRange([yearRange[0], parseInt(e.target.value)])} />
              </div>
            </div>

            <div>
              <h4 className="text-sm text-gray-300 mb-2">Body Type</h4>
              <div className="space-y-1">
                {bodyTypes.map(type => (
                  <label key={type} className="flex items-center text-sm text-gray-300">
                    <input
                      type="checkbox"
                      className="mr-2 text-blue-500 focus:ring-blue-400"
                      checked={selectedBodyTypes.includes(type)}
                      onChange={() => handleBodyTypeToggle(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-t-blue-400 border-gray-800 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading cars...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center p-12 border border-dark-border bg-dark-card rounded-lg">
            <CarIcon className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-white font-medium mb-2">No cars found</p>
            <p className="text-gray-400 text-sm mb-4">Try different filters or search terms.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedManufacturer('');
                setSelectedBodyTypes([]);
                setYearRange([2000, 2023]);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car, index) => (
              <div
                key={car.id}
                className={`bg-dark-surface border rounded-lg p-4 ${highlightedCard === car.id ? 'border-blue-500' : 'border-dark-border'} cursor-pointer hover:shadow-lg transition`}
                onMouseEnter={() => setHighlightedCard(car.id)}
                onMouseLeave={() => setHighlightedCard(null)}
                onClick={() => onSelectCar?.(car)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-400 font-medium">{car.manufacturer}</span>
                  <span className="text-xs text-gray-400">ID: {car.id}</span>
                </div>
                <h3 className="font-bold text-white text-lg">{car.model}</h3>
                <p className="text-sm text-gray-300">{car.year}</p>
                <div className="mt-3 text-sm text-gray-400 space-y-1">
                  {car.engine_info && <div>Engine: <span className="text-gray-200">{car.engine_info}</span></div>}
                  {car.transmission && <div>Transmission: <span className="text-gray-200">{car.transmission}</span></div>}
                  {car.mpg && <div>MPG: <span className="text-gray-200">{car.mpg}</span></div>}
                  {car.fuel_type && <div>Fuel: <span className="text-gray-200">{car.fuel_type}</span></div>}
                  {car.body_type && <div>Body: <span className="text-gray-200">{car.body_type}</span></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
