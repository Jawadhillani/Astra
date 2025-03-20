'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';

export default function CarListing({ onSelectCar }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');

  useEffect(() => {
    async function fetchManufacturers() {
      const { data, error } = await supabase
        .from('cars')
        .select('manufacturer')
        .order('manufacturer')
        .not('manufacturer', 'is', null);
      
      if (!error && data) {
        const uniqueManufacturers = [...new Set(data.map(car => car.manufacturer))];
        setManufacturers(uniqueManufacturers);
      }
    }
    fetchManufacturers();
  }, []);

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      let query = supabase.from('cars').select('*');
      if (selectedManufacturer) query = query.eq('manufacturer', selectedManufacturer);
      if (searchTerm) query = query.or(`model.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%`);
      query = query.order('year', { ascending: false }).limit(20);
      const { data, error } = await query;
      if (!error && data) {
        setCars(data);
        if (selectedCar && !data.find(car => car.id === selectedCar.id)) setSelectedCar(null);
      } else {
        console.error('Error fetching cars:', error);
      }
      setLoading(false);
    }
    fetchCars();
  }, [searchTerm, selectedManufacturer]);

  const getAverageRating = (carId) => {
    if (!selectedCar || selectedCar.id !== carId) return null;
    // Calculation logic (if available)
    return null;
  };

  if (selectedCar) {
    // Optionally, you might show a detail view directly.
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Available Cars</h2>
      {loading ? (
        <p className="text-center">Loading cars...</p>
      ) : cars.length === 0 ? (
        <p className="text-center">No cars found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cars.map((car) => (
            <div
              key={car.id}
              className="p-4 border rounded-lg cursor-pointer"
              onClick={() => {
                setSelectedCar(car);
                if (onSelectCar) onSelectCar(car); // Pass the full car object.
              }}
            >
              <h3 className="font-semibold text-lg text-gray-900">{car.manufacturer} {car.model}</h3>
              <p className="text-sm text-gray-700">{car.year}</p>
              {getAverageRating(car.id) && (
                <div className="flex items-center bg-amber-100 px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                  <span className="font-medium text-gray-800">{getAverageRating(car.id)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
