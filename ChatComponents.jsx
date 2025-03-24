// components/ChatComponents.jsx
import React from 'react';
import { Car, Fuel, Gauge, Star, Shield, Calendar } from 'lucide-react';

// Component for displaying car specifications in a visually appealing way
export const SpecificationCard = ({ car }) => {
  if (!car) return null;
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-transparent mb-2" style={{
      background: `linear-gradient(var(--dark-card), var(--dark-card)) padding-box,
                 linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3)) border-box`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-3 py-2 border-b border-gray-700">
        <h3 className="font-medium text-white flex items-center">
          <Car className="w-4 h-4 mr-2" />
          {car.year} {car.manufacturer} {car.model}
        </h3>
      </div>
      
      <div className="p-3 grid grid-cols-2 gap-3">
        {car.engine_info && (
          <div className="flex items-start">
            <div className="p-1.5 rounded-md mr-2" style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1))',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Fuel className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Engine</p>
              <p className="text-sm">{car.engine_info}</p>
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
              <p className="text-sm">{car.mpg} MPG</p>
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
              <p className="text-sm">{car.body_type}</p>
            </div>
          </div>
        )}
        
        {car.year && (
          <div className="flex items-start">
            <div className="p-1.5 rounded-md mr-2" style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.1))',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Year</p>
              <p className="text-sm">{car.year}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for displaying review ratings visually
export const RatingCard = ({ rating, reviewCount }) => {
  const stars = [];
  
  // Create filled and empty stars based on rating
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500 opacity-60" />);
    } else {
      stars.push(<Star key={i} className="w-5 h-5 text-gray-600" />);
    }
  }
  
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-transparent mb-2" style={{
      background: `linear-gradient(var(--dark-card), var(--dark-card)) padding-box,
                 linear-gradient(to right, rgba(234, 179, 8, 0.3), rgba(245, 158, 11, 0.3)) border-box`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">{stars}</div>
        <div className="text-xl font-bold text-yellow-500">{rating.toFixed(1)}</div>
      </div>
      <p className="text-sm text-gray-400 mt-1">Based on {reviewCount} owner {reviewCount === 1 ? 'review' : 'reviews'}</p>
    </div>
  );
};

// Component for pros and cons list
export const ProsConsCard = ({ pros, cons }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-transparent mb-2" style={{
      background: `linear-gradient(var(--dark-card), var(--dark-card)) padding-box,
                 linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3)) border-box`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }}>
      <div className="p-3">
        {pros && pros.length > 0 && (
          <div className="mb-2">
            <h4 className="text-sm font-medium text-green-500 mb-1">Pros:</h4>
            <ul className="pl-5 space-y-1">
              {pros.map((pro, idx) => (
                <li key={idx} className="text-sm text-gray-300 list-disc">{pro}</li>
              ))}
            </ul>
          </div>
        )}
        
        {cons && cons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-500 mb-1">Cons:</h4>
            <ul className="pl-5 space-y-1">
              {cons.map((con, idx) => (
                <li key={idx} className="text-sm text-gray-300 list-disc">{con}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for category scores
export const CategoryScoresCard = ({ scores }) => {
  if (!scores || Object.keys(scores).length === 0) return null;
  
  // Format category names
  const formatCategoryName = (name) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Sort categories by score (highest first)
  const sortedCategories = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([category, score]) => ({
      name: formatCategoryName(category),
      score
    }));
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-transparent mb-2" style={{
      background: `linear-gradient(var(--dark-card), var(--dark-card)) padding-box,
                 linear-gradient(to right, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3)) border-box`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-3 py-2 border-b border-gray-700">
        <h3 className="font-medium text-white">Category Ratings</h3>
      </div>
      
      <div className="p-3">
        <div className="space-y-3">
          {sortedCategories.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">{category.name}</span>
                <span className="text-sm font-medium text-gray-300">{category.score}/5</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" 
                  style={{ width: `${(category.score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component for sentiment analysis
export const SentimentCard = ({ sentiment }) => {
  if (!sentiment) return null;
  
  const total = sentiment.positive + sentiment.negative + sentiment.neutral;
  if (total === 0) return null;
  
  const positivePercent = Math.round((sentiment.positive / total) * 100);
  const negativePercent = Math.round((sentiment.negative / total) * 100);
  const neutralPercent = 100 - positivePercent - negativePercent;
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-transparent mb-2" style={{
      background: `linear-gradient(var(--dark-card), var(--dark-card)) padding-box,
                 linear-gradient(to right, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3)) border-box`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-3 py-2 border-b border-gray-700">
        <h3 className="font-medium text-white">Review Sentiment</h3>
      </div>
      
      <div className="p-3">
        <div className="flex h-6 w-full rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full" 
            style={{ width: `${positivePercent}%` }}
            title={`Positive: ${positivePercent}%`}
          ></div>
          <div 
            className="bg-gray-500 h-full" 
            style={{ width: `${neutralPercent}%` }}
            title={`Neutral: ${neutralPercent}%`}
          ></div>
          <div 
            className="bg-red-500 h-full" 
            style={{ width: `${negativePercent}%` }}
            title={`Negative: ${negativePercent}%`}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Positive: {positivePercent}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
            <span>Neutral: {neutralPercent}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Negative: {negativePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};