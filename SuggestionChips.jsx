'use client'
import React from 'react';
import { Cpu, MessageSquare, Car, ArrowRight, Zap } from 'lucide-react';

const SuggestionChips = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;
  
  // Get a suitable icon based on the suggestion content
  const getIcon = (suggestion) => {
    const text = suggestion.toLowerCase();
    
    if (text.includes('compare') || text.includes('vs')) return <ArrowRight size={14} />;
    if (text.includes('fuel') || text.includes('mpg') || text.includes('economy')) return <Zap size={14} />;
    if (text.includes('car') || text.includes('model') || text.includes('engine')) return <Car size={14} />;
    // Default icon
    return <Cpu size={14} />;
  };
  
  return (
    <div className="mt-3 flex flex-wrap gap-2 suggestion-container animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          className="suggestion-chip bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 text-xs px-3 py-1.5 rounded-full border border-gray-700 hover:border-blue-500 transition-all hover:shadow-glow flex items-center space-x-1.5"
          style={{ animationDelay: `${0.2 + idx * 0.1}s`, opacity: 0, transform: 'translateY(10px)' }}
        >
          <span className="text-blue-400 flex-shrink-0">
            {getIcon(suggestion)}
          </span>
          <span className="truncate max-w-[150px]">{suggestion}</span>
        </button>
      ))}
      
      <style jsx>{`
        .suggestion-container {
          animation-fill-mode: forwards;
        }
        
        .suggestion-chip {
          animation: chipAppear 0.5s ease forwards;
          animation-fill-mode: forwards;
        }
        
        @keyframes chipAppear {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SuggestionChips;