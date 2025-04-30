'use client';

import React, { useState, useEffect } from 'react';
import { CarSilhouettes } from './CarSilhouettes';
import { getCarImage } from '../utils/unsplash';

// Manufacturer-specific gradients and colors
const brandStyles = {
  'BMW': {
    gradient: 'from-blue-600 to-violet-900',
    accent: '#1C69D4', // BMW Blue
    logo: '/logos/bmw.svg'
  },
  'Mercedes': {
    gradient: 'from-gray-700 to-gray-900',
    accent: '#242424', // Mercedes Black
    logo: '/logos/mercedes.svg'
  },
  'Audi': {
    gradient: 'from-gray-800 to-gray-950',
    accent: '#000000', // Audi Black
    logo: '/logos/audi.svg'
  },
  'Volvo': {
    gradient: 'from-blue-800 to-gray-900',
    accent: '#003057', // Volvo Blue
    logo: '/logos/volvo.svg'
  },
  'Toyota': {
    gradient: 'from-red-600 to-red-900',
    accent: '#EB0A1E', // Toyota Red
    logo: '/logos/toyota.svg'
  },
  'Honda': {
    gradient: 'from-red-700 to-gray-900',
    accent: '#E40521', // Honda Red
    logo: '/logos/honda.svg'
  },
  'Ford': {
    gradient: 'from-blue-500 to-blue-900',
    accent: '#003478', // Ford Blue
    logo: '/logos/ford.svg'
  },
  'Chevrolet': {
    gradient: 'from-yellow-500 to-yellow-800',
    accent: '#FAB70C', // Chevy Gold
    logo: '/logos/chevrolet.svg'
  },
  'Porsche': {
    gradient: 'from-red-500 to-gray-900',
    accent: '#BC9A5C', // Porsche Gold
    logo: '/logos/porsche.svg'
  },
  'default': {
    gradient: 'from-violet-600 to-indigo-900',
    accent: '#7C3AED',
    logo: null
  }
};

const brandLogos = {
  BMW: '/logos/bmw.svg',
  Jeep: '/logos/jeep.svg',
  Volvo: '/logos/volvo.svg',
  // ...add more as needed
};

const genericCar = '/generic-car.png'; // Place a generic car image in your public folder

export default function CarImage({ car, className = '' }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getCarImage(car.manufacturer, car.model).then(url => {
      if (isMounted) {
        setImageUrl(url);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [car.manufacturer, car.model]);

  if (loading) {
    return <div className={`w-full h-48 bg-gray-200 animate-pulse ${className}`} />;
  }

  return (
    <img
      src={imageUrl}
      alt={`${car.manufacturer} ${car.model}`}
      className={`w-full h-48 object-cover ${className}`}
    />
  );
}

// Add required styles
const styles = `
@keyframes movePattern {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 40px 40px;
  }
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 