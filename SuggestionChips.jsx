'use client'
import React, { useEffect, useRef } from 'react';
import { ArrowRight, MessageSquare, Car, Zap, Search, BarChart3, ThumbsUp, Award } from 'lucide-react';

/**
 * Smart suggestion chips component with animations and context-aware icons
 * 
 * Features:
 * - Staggered entrance animations
 * - Contextual icons based on suggestion content
 * - Hover effects
 * - Accessible design
 */
const SuggestionChips = ({ suggestions, onSelect }) => {
  const containerRef = useRef(null);
  
  // Skip rendering if no suggestions
  if (!suggestions || suggestions.length === 0) return null;
  
  // Animation trigger on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Set initial opacity for container
    container.style.opacity = 1;
    
    // Get all chips inside the container
    const chips = container.querySelectorAll('.suggestion-chip');
    
    // Animate each chip with staggered delay
    chips.forEach((chip, index) => {
      // Set initial state
      chip.style.opacity = 0;
      chip.style.transform = 'translateY(10px)';
      
      // Trigger animation with staggered delay
      setTimeout(() => {
        chip.style.opacity = 1;
        chip.style.transform = 'translateY(0)';
      }, 100 + (index * 80)); // 80ms stagger between chips
    });
  }, [suggestions]);
  
  // Get context-appropriate icon based on suggestion content
  const getIconForSuggestion = (suggestion) => {
    const text = suggestion.toLowerCase();
    
    // Icon selection logic based on keywords
    if (text.includes('compare') || text.includes('vs') || text.includes('versus') || text.includes('better')) {
      return <BarChart3 size={14} />;
    } else if (text.includes('fuel') || text.includes('mpg') || text.includes('economy') || text.includes('gas')) {
      return <Zap size={14} />;
    } else if (text.includes('car') || text.includes('model') || text.includes('engine') || text.includes('vehicle')) {
      return <Car size={14} />;
    } else if (text.includes('best') || text.includes('recommend') || text.includes('top') || text.includes('good')) {
      return <Award size={14} />;
    } else if (text.includes('like') || text.includes('rating') || text.includes('review') || text.includes('opinion')) {
      return <ThumbsUp size={14} />;
    } else if (text.includes('what') || text.includes('how') || text.includes('why') || text.includes('when')) {
      return <Search size={14} />;
    }
    
    // Default icon
    return <ArrowRight size={14} />;
  };
  
  return (
    <div 
      ref={containerRef} 
      className="mt-3 flex flex-wrap gap-2 transition-opacity duration-500" 
      style={{ opacity: 0 }} // Initial state, changed by useEffect
    >
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          className="suggestion-chip bg-gray-800 hover:bg-gray-750 text-gray-200 text-xs px-3 py-1.5 rounded-full border border-gray-700 hover:border-blue-500 transition-all hover:shadow-glow flex items-center space-x-1.5"
          style={{ 
            transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            opacity: 0,
            transform: 'translateY(10px)'
          }}
          title={suggestion}
        >
          <span className="text-blue-400 flex-shrink-0">
            {getIconForSuggestion(suggestion)}
          </span>
          <span className="truncate max-w-[200px]">{suggestion}</span>
        </button>
      ))}
      
      <style jsx>{`
        .shadow-glow {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }
        
        /* Target extremely narrow screens for better wrapping */
        @media (max-width: 340px) {
          .suggestion-chip {
            margin-bottom: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default SuggestionChips;