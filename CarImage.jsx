'use client'
import React, { useState, useEffect } from 'react';
import { getCarImageUrl } from './CarImageService';
import CarBadgeIcon from './CarBadgeIcon';
import CarIllustration from './CarIllustration';

/**
 * CarImage component that displays a car image from multiple sources with fallbacks
 * 
 * @param {Object} props
 * @param {Object} props.car - The car object with manufacturer, model, year, etc.
 * @param {string} props.view - The view type: 'detailed', 'card', or 'badge'
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onLoad - Callback when image loads
 * @param {function} props.onError - Callback when image fails to load
 */
const CarImage = ({ 
  car, 
  view = 'card', 
  size = 'md',
  className = '', 
  onLoad,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [placeholderType, setPlaceholderType] = useState('badge'); // 'badge' or 'illustration'
  
  // Toggle between badge and illustration on hover/click
  const togglePlaceholder = () => {
    setPlaceholderType(placeholderType === 'badge' ? 'illustration' : 'badge');
  };
  
  // Get the appropriate size class
  const getSizeClass = () => {
    const sizeClasses = {
      sm: 'h-16 w-16',
      md: view === 'detailed' ? 'h-64 w-full' : 'h-32 w-32',
      lg: view === 'detailed' ? 'h-80 w-full' : 'h-48 w-48',
      xl: 'h-96 w-full'
    };
    return sizeClasses[size] || 'h-32 w-32';
  };
  
  // Fetch the car image when the component mounts or car changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      if (!car || !car.manufacturer || !car.model) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Get the image URL from our service
        const url = await getCarImageUrl(car);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading car image:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          if (onError) onError(error);
        }
      }
    };
    
    fetchImage();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [car, onError]);
  
  // Handle successful image load
  const handleImageLoad = () => {
    if (onLoad) onLoad();
  };
  
  // Handle image error
  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(new Error('Failed to load car image'));
  };

  // While loading, show a placeholder based on the car make
  if (isLoading) {
    return (
      <div className={`${getSizeClass()} ${className} flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden animate-pulse`}>
        <CarBadgeIcon 
          manufacturer={car?.manufacturer || 'unknown'} 
          size={size} 
          className="opacity-50"
        />
      </div>
    );
  }
  
  // If there's an error or no car image available, show custom illustration
  if (hasError || !imageUrl) {
    return (
      <div 
        className={`${getSizeClass()} ${className} flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden transition-all duration-300`}
        onClick={togglePlaceholder}
      >
        {placeholderType === 'badge' ? (
          <CarBadgeIcon 
            manufacturer={car?.manufacturer || 'unknown'} 
            size={size} 
            className="car-badge-hover" 
          />
        ) : (
          <CarIllustration 
            bodyType={car?.body_type || 'sedan'} 
            manufacturer={car?.manufacturer || 'unknown'} 
            model={car?.model || ''} 
            year={car?.year || new Date().getFullYear()}
            size={size}
            className="car-float" 
          />
        )}
      </div>
    );
  }
  
  // If we have a valid image URL, show the image
  return (
    <div className={`${getSizeClass()} ${className} bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden relative group`}>
      <img
        src={imageUrl}
        alt={`${car.year} ${car.manufacturer} ${car.model}`}
        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {/* Badge overlay on hover for quick identification */}
      {view === 'detailed' && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CarBadgeIcon 
            manufacturer={car.manufacturer} 
            size="sm" 
            className="shadow-lg" 
          />
        </div>
      )}
    </div>
  );
};

export default CarImage;