// components/DatabaseStatus.jsx
'use client';
import { Database } from 'lucide-react';

export default function DatabaseStatus({ status = 'checking...', carsCount = 0, usingFallback = false }) {
  const isOnline = status.includes('successful');
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded shadow-lg">
      <div className="flex items-center gap-2 text-sm">
        <div className={`h-2 w-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        
        <div className="flex items-center">
          {usingFallback && <Database className="w-3.5 h-3.5 mr-1 text-yellow-600" />}
          <span className={usingFallback ? 'text-yellow-600 font-medium' : ''}>
            {usingFallback ? 'Fallback Products' : status}
          </span>
        </div>
        
        <span className="text-gray-500">({carsCount} cars loaded)</span>
      </div>
    </div>
  );
}