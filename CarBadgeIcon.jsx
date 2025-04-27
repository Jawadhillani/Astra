'use client'
import React from 'react';

/**
 * CarBadgeIcon - A component that renders different car brand logos or stylized car illustrations
 * based on the provided manufacturer name
 */
const CarBadgeIcon = ({ manufacturer, className = '', size = 'md', fill = true }) => {
  // Determine the appropriate size class
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  }[size] || 'w-12 h-12';
  
  // Convert manufacturer to lowercase for consistent matching
  const brand = (manufacturer || '').toLowerCase();
  
  // Create the base class for all SVGs
  const baseClass = `${sizeClass} ${className} transition-transform duration-300 hover:scale-110`;
  
  // Get manufacturer-specific color gradients
  const getGradient = (mfr) => {
    const gradients = {
      'bmw': ['from-blue-600', 'to-sky-400'],
      'tesla': ['from-red-600', 'to-red-400'],
      'toyota': ['from-red-600', 'to-gray-500'],
      'honda': ['from-red-700', 'to-gray-600'],
      'ford': ['from-blue-700', 'to-blue-500'],
      'chevrolet': ['from-yellow-600', 'to-yellow-400'],
      'dodge': ['from-red-700', 'to-black'],
      'mercedes': ['from-gray-700', 'to-gray-400'],
      'audi': ['from-gray-800', 'to-gray-600'],
      'volkswagen': ['from-blue-800', 'to-blue-600'],
      'hyundai': ['from-blue-600', 'to-gray-400'],
      'kia': ['from-red-600', 'to-gray-400'],
      'nissan': ['from-red-600', 'to-gray-500'],
      'subaru': ['from-blue-700', 'to-blue-500'],
      'mazda': ['from-red-700', 'to-gray-600'],
      // Default gradient for other brands
      'default': ['from-violet-600', 'to-indigo-800']
    };
    
    return gradients[mfr] || gradients['default'];
  };
  
  // Get the gradient colors for this manufacturer
  const [fromColor, toColor] = getGradient(brand);
  
  // Render different logos based on manufacturer
  switch (brand) {
    case 'bmw':
      return (
        <div className={`relative ${baseClass} rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center`}>
          {fill && (
            <svg viewBox="0 0 24 24" fill="none" className="w-3/4 h-3/4" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="white" />
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2V22" stroke="currentColor" strokeWidth="0.5" />
              <path d="M2 12H22" stroke="currentColor" strokeWidth="0.5" />
              <path d="M12 12L21 12" stroke="currentColor" strokeWidth="0.5" />
              <path d="M12 12L12 3" stroke="currentColor" strokeWidth="0.5" />
              <path d="M12 12L3 12" stroke="currentColor" strokeWidth="0.5" />
              <path d="M12 12L12 21" stroke="currentColor" strokeWidth="0.5" />
              <path d="M4 4L11 11" stroke="currentColor" strokeWidth="0.5" />
              <path d="M4 20L11 13" stroke="currentColor" strokeWidth="0.5" />
              <path d="M20 4L13 11" stroke="currentColor" strokeWidth="0.5" />
              <path d="M20 20L13 13" stroke="currentColor" strokeWidth="0.5" />
              <path fillRule="evenodd" clipRule="evenodd" d="M12 12H22V22C22 21.9999 21.9999 22 21.9998 22C21.132 19.2868 17.9297 17.2727 14.2147 12H12V12Z" fill="#0066B1" />
              <path fillRule="evenodd" clipRule="evenodd" d="M2 12H12V2C2 2 2 11.9998 2 12Z" fill="#0066B1" />
            </svg>
          )}
        </div>
      );
      
    case 'mercedes':
      return (
        <div className={`relative ${baseClass} rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center`}>
          {fill && (
            <svg viewBox="0 0 24 24" fill="none" className="w-3/4 h-3/4" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="white" stroke="currentColor" strokeWidth="1" />
              <path d="M12 2V12L20.5 6.5" stroke="silver" strokeWidth="1.5" />
              <path d="M12 12L3.5 6.5" stroke="silver" strokeWidth="1.5" />
              <path d="M12 12V22" stroke="silver" strokeWidth="1.5" />
            </svg>
          )}
        </div>
      );
      
    case 'tesla':
      return (
        <div className={`relative ${baseClass} rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center`}>
          {fill && (
            <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M14.5 6H19.5L12 20L4.5 6H9.5L12 10.5L14.5 6Z" fill="currentColor" />
              <path d="M7.5 4H16.5V5H7.5V4Z" fill="currentColor" />
            </svg>
          )}
        </div>
      );
     
    case 'dodge':
      return (
        <div className={`relative ${baseClass} rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center`}>
          {fill && (
            <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.8333 8H3.16667C2.52233 8 2 8.52233 2 9.16667V14.8333C2 15.4777 2.52233 16 3.16667 16H20.8333C21.4777 16 22 15.4777 22 14.8333V9.16667C22 8.52233 21.4777 8 20.8333 8Z" fill="none" stroke="white" strokeWidth="1" />
              <path d="M7 10L11 10L14 14L18 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
      );
      
    case 'toyota':
      return (
        <div className={`relative ${baseClass} rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center`}>
          {fill && (
            <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="white" stroke="currentColor" strokeWidth="0.5" />
              <ellipse cx="12" cy="12" rx="5" ry="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          )}
        </div>
      );
      
    case 'ford':
      return (
        <div className={`relative ${baseClass} rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center`}>
          {fill && (
            <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="16" height="8" rx="4" fill="white" />
              <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9.5H15" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 14.5H15" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 11C7 9.89543 7.89543 9 9 9H15C16.1046 9 17 9.89543 17 11V13C17 14.1046 16.1046 15 15 15H9C7.89543 15 7 14.1046 7 13V11Z" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </div>
      );
      
    // Default car illustration (used for all other manufacturers)
    default:
      // Create a unique pseudo-random car color based on manufacturer name
      const getUniqueColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Generate a gradient pair based on the hash
        const hue1 = Math.abs(hash % 360);
        const hue2 = (hue1 + 20) % 360; // Slightly different hue for gradient
        
        return [
          `hsl(${hue1}, 70%, 50%)`,
          `hsl(${hue2}, 80%, 40%)`
        ];
      };
      
      const [color1, color2] = getUniqueColor(brand);
      
      return (
        <div className={`relative ${baseClass} rounded-lg overflow-hidden`}>
          <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
            {/* Background with gradient */}
            <defs>
              <linearGradient id={`car-gradient-${brand}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color1} />
                <stop offset="100%" stopColor={color2} />
              </linearGradient>
            </defs>
            
            <rect width="100" height="60" rx="10" fill={`url(#car-gradient-${brand})`} />
            
            {/* Car Body */}
            <path d="M15,40 L25,20 L75,20 L85,40 L15,40 Z" fill="#111" stroke="#333" strokeWidth="1" />
            
            {/* Windows */}
            <path d="M30,22 L35,40 L65,40 L70,22 Z" fill="#6ee7fc" stroke="#333" strokeWidth="0.5" />
            <line x1="50" y1="22" x2="50" y2="40" stroke="#333" strokeWidth="0.5" />
            
            {/* Wheels */}
            <circle cx="30" cy="42" r="10" fill="#111" stroke="#333" strokeWidth="1" />
            <circle cx="30" cy="42" r="5" fill="#333" stroke="#555" strokeWidth="1" />
            <circle cx="70" cy="42" r="10" fill="#111" stroke="#333" strokeWidth="1" />
            <circle cx="70" cy="42" r="5" fill="#333" stroke="#555" strokeWidth="1" />
            
            {/* Lights */}
            <path d="M15,35 L20,35 L20,30 L15,35 Z" fill="yellow" />
            <path d="M85,35 L80,35 L80,30 L85,35 Z" fill="red" />
            
            {/* Manufacturer label */}
            <text x="50" y="52" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">
              {manufacturer ? (manufacturer.length > 10 ? manufacturer.substring(0, 10) : manufacturer) : 'Car'}
            </text>
          </svg>
        </div>
      );
  }
};

export default CarBadgeIcon;