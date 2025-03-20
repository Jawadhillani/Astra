'use client'
import { useState, useEffect } from 'react';
import CarListing from '@/components/CarListing';
import AdvancedSearch from '@/components/AdvancedSearch';
import ReviewAnalysis from '@/components/ReviewAnalysis';
import CarDetail from '@/components/CarDetail';

export default function Home() {
  const [view, setView] = useState('listing');
  const [selectedCar, setSelectedCar] = useState(null);

  // Debug log when selectedCar changes
  useEffect(() => {
    console.log("Home - selectedCar changed:", selectedCar);
  }, [selectedCar]);

  const handleSelectCar = (car) => {
    console.log("handleSelectCar called with:", car);
    
    // Validate car object
    if (!car || !car.id) {
      console.error("Invalid car object received in handleSelectCar:", car);
      return;
    }
    
    setSelectedCar(car);
    setView('detail');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation / Hero Section */}
      <div className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded ${view === 'listing' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setView('listing')}
            >
              Car Listing
            </button>
            <button
              className={`px-4 py-2 rounded ${view === 'advanced-search' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setView('advanced-search')}
            >
              Advanced Search
            </button>
          </div>
        </div>
      </div>

      {/* Content Area with Debug Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Debug State Display */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <p>Current View: {view}</p>
          <p>Selected Car ID: {selectedCar?.id || 'none'}</p>
        </div>

        {view === 'listing' && (
          <CarListing onSelectCar={handleSelectCar} />
        )}
        {view === 'advanced-search' && <AdvancedSearch />}
        {view === 'detail' && selectedCar && (
          <CarDetail car={selectedCar} onBack={() => setView('listing')} />
        )}
        {view === 'analysis' && selectedCar && (
          <ReviewAnalysis carId={selectedCar.id} />
        )}
      </div>
    </main>
  );
}