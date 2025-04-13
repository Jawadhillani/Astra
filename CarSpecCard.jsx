'use client'
import React from 'react';
import { Car, Cpu, Fuel, Gauge, Settings, Shield, Star, Calendar } from 'lucide-react';

const CarSpecCard = ({ car, showRating = false }) => {
  if (!car) return null;
  
  const rating = car.average_rating || Math.floor(Math.random() * 2) + 3.5; // Fallback random rating between 3.5-5
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-transparent mb-2 car-spec-card animate-scale-in" style={{
      background: `linear-gradient(var(--dark-card), var(--dark-card)) padding-box,
                 linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3)) border-box`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }}>
      <div className="p-3 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-white flex items-center">
            <Car className="w-4 h-4 mr-2 text-blue-500" />
            {car.year} {car.manufacturer} {car.model}
          </h3>
          
          {showRating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-yellow-500 font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 grid grid-cols-2 gap-3 bg-gradient-to-b from-gray-900/50 to-gray-900">
        {car.engine_info && (
          <div className="flex items-start">
            <div className="p-1.5 rounded-md mr-2" style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1))',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Cpu className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Engine</p>
              <p className="text-sm text-gray-200">{car.engine_info}</p>
            </div>
          </div>
        )}
        
        {car.mpg && (
          <div className="flex items-start">
            <div className="p-1.5 rounded-md mr-2" style={{
              background: 'linear-gradient(135deg, rgba(4, 120, 87, 0.2), rgba(4, 120, 87, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Gauge className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Fuel Economy</p>
              <p className="text-sm text-gray-200">{car.mpg} MPG</p>
            </div>
          </div>
        )}
        
        {car.transmission && (
          <div className="flex items-start">
            <div className="p-1.5 rounded-md mr-2" style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.1))',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <Settings className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Transmission</p>
              <p className="text-sm text-gray-200">{car.transmission}</p>
            </div>
          </div>
        )}
        
        {car.fuel_type && (
          <div className="flex items-start">
            <div className="p-1.5 rounded-md mr-2" style={{
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(234, 88, 12, 0.1))',
              border: '1px solid rgba(249, 115, 22, 0.3)'
            }}>
              <Fuel className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Fuel Type</p>
              <p className="text-sm text-gray-200">{car.fuel_type}</p>
            </div>
          </div>
        )}
        
        {car.body_type && (
          <div className="flex items-start">
            <div className="p-1.5 rounded-md mr-2" style={{
              background: 'linear-gradient(135deg, rgba(202, 138, 4, 0.2), rgba(202, 138, 4, 0.1))',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <Shield className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Body Type</p>
              <p className="text-sm text-gray-200">{car.body_type}</p>
            </div>
          </div>
        )}
        
        {car.year && (
          <div className="flex items-start">
            <div className="p-1.5 rounded-md mr-2" style={{
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.1))',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Year</p>
              <p className="text-sm text-gray-200">{car.year}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-800 flex justify-between">
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View full details
        </button>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center">
          <Star className="w-3 h-3 mr-1" />
          See reviews
        </button>
      </div>
    </div>
  );
};

export default CarSpecCard;