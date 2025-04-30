'use client';

import { useEffect, useState } from 'react';
import { testUnsplashAccess } from '../utils/unsplash';

export default function UnsplashTest() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    testUnsplashAccess().then(isValid => {
      setStatus(isValid ? 'Access Valid ✅' : 'Access Invalid ❌');
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg">
      Unsplash API: {status}
    </div>
  );
} 