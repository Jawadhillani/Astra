// components/DatabaseStatus.jsx
'use client';
import { useEffect, useState } from 'react';

export default function DatabaseStatus() {
  const [status, setStatus] = useState('checking...');
  const [carsCount, setCarsCount] = useState(0);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const res = await fetch('/api/test-db');
        const data = await res.json();
        setStatus(data.message);
        setCarsCount(data.cars_count || 0);
      } catch (e) {
        setStatus('Offline - Using fallback data');
      }
    };
    checkDatabase();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded shadow">
      <div className="flex items-center gap-2 text-sm">
        <div className={`h-2 w-2 rounded-full ${
          status.includes('successful') ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span>{status}</span>
        <span className="text-gray-500">({carsCount} cars loaded)</span>
      </div>
    </div>
  );
}