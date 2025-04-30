'use client'
import { useState, useEffect } from 'react';
import InteractiveProductCard from './InteractiveProductCard';

/**
 * Container that manages multiple product cards in the chat
 * Features:
 * - Detects products mentioned in AI responses
 * - Displays interactive product cards
 * - Handles adding/removing cards
 * - Manages layout and positioning
 */
const ProductCardContainer = ({ 
  message,
  carData = [],
  onCompare,
  onViewDetails,
  className = ""
}) => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // Extract potential products from message content using carData as reference
    if (message && carData && carData.length > 0) {
      extractProductsFromMessage(message, carData);
    }
  }, [message, carData]);
  
  // Extract products mentioned in the message
  const extractProductsFromMessage = (message, carData) => {
    // Skip if not an AI message or no cars available
    if (message.sender !== 'ai' || !carData || carData.length === 0) {
      return;
    }
    
    const text = message.text || '';
    const foundProducts = [];
    
    // Look for car mentions in the message
    carData.forEach(car => {
      const manufacturer = car.manufacturer || '';
      const model = car.model || '';
      
      // Check if this car is mentioned in the message
      if (manufacturer && model && 
          text.toLowerCase().includes(manufacturer.toLowerCase()) && 
          text.toLowerCase().includes(model.toLowerCase())) {
        
        // Add to found products if not already present
        if (!foundProducts.some(p => p.id === car.id)) {
          foundProducts.push({
            id: car.id,
            manufacturer: car.manufacturer,
            model: car.model,
            year: car.year,
            engine_info: car.engine_info,
            transmission: car.transmission,
            mpg: car.mpg,
            body_type: car.body_type,
            fuel_type: car.fuel_type,
            rating: 4.5, // Mock rating
            reviews: 24, // Mock review count
            // Generate a description if none exists
            description: car.description || `The ${car.year} ${car.manufacturer} ${car.model} features a ${car.engine_info} engine, ${car.transmission} transmission, and gets approximately ${car.mpg} MPG.`
          });
        }
      }
    });
    
    // Update state with found products
    if (foundProducts.length > 0) {
      setProducts(prevProducts => {
        // Combine with existing products but avoid duplicates
        const newProducts = [...prevProducts];
        foundProducts.forEach(product => {
          if (!newProducts.some(p => p.id === product.id)) {
            newProducts.push(product);
          }
        });
        return newProducts;
      });
    }
  };
  
  // Handle removing a product card
  const handleRemoveProduct = (productId) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };
  
  // No products, no render
  if (products.length === 0) {
    return null;
  }
  
  return (
    <div className={`mt-4 space-y-4 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 flex items-center">
        <span className="flex-1 border-t border-gray-700"></span>
        <span className="px-2">Mentioned Products</span>
        <span className="flex-1 border-t border-gray-700"></span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all">
        {products.map(product => (
          <InteractiveProductCard
            key={product.id}
            product={product}
            onClose={() => handleRemoveProduct(product.id)}
            onCompare={() => onCompare && onCompare(product)}
            onViewDetails={() => onViewDetails && onViewDetails(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCardContainer;