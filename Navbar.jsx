'use client'
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Car, Search, Settings, BarChart3 } from 'lucide-react';

// Dropdown with proper background
const NavDropdown = ({ title, isActive, onClick, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`px-4 py-2 rounded-md transition-all duration-300 flex items-center ${
          isActive 
            ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white' 
            : 'bg-dark-surface text-gray-300 hover:bg-gray-800'
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (onClick) onClick();
        }}
      >
        {title}
        <ChevronDown 
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>
      
      {/* Dropdown Menu - with solid background */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg z-50 overflow-hidden">
          {/* Solid background to ensure visibility */}
          <div className="absolute inset-0 bg-dark-card opacity-95 backdrop-blur-lg border border-violet-900/30 rounded-md shadow-2xl"></div>
          
          {/* Content */}
          <div className="relative z-10 py-2 rounded-md">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Navbar with dropdown menus
const Navbar = ({ currentView, onChangeView }) => {
  const [scrolled, setScrolled] = useState(false);
  
  // Detect scroll for adding shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-xl' : ''
    }`}>
      {/* Solid background that's always visible */}
      <div className="absolute inset-0 bg-dark-bg bg-opacity-95 backdrop-filter backdrop-blur-lg border-b border-violet-900/30"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            className={`px-4 py-2 rounded-md transition-all duration-300 ${
              currentView === 'home' 
                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white' 
                : 'bg-dark-surface text-gray-300 hover:bg-gray-800'
            }`}
            onClick={() => onChangeView('home')}
          >
            Home
          </button>
          
          {/* Car Dropdown */}
          <NavDropdown 
            title="Cars" 
            isActive={currentView === 'listing'} 
            onClick={() => onChangeView('listing')}
          >
            <div className="px-1">
              <button 
                className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                onClick={() => onChangeView('listing')}
              >
                <Car className="w-4 h-4 mr-2" />
                All Vehicles
              </button>
              <button 
                className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                onClick={() => onChangeView('listing')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Popular Models
              </button>
              <button 
                className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                onClick={() => onChangeView('listing')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Compare Cars
              </button>
            </div>
          </NavDropdown>
          
          {/* Search Dropdown */}
          <NavDropdown 
            title="Search" 
            isActive={currentView === 'advanced-search'} 
            onClick={() => onChangeView('advanced-search')}
          >
            <div className="px-1">
              <button 
                className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                onClick={() => onChangeView('advanced-search')}
              >
                <Search className="w-4 h-4 mr-2" />
                Advanced Search
              </button>
              <button 
                className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                onClick={() => onChangeView('advanced-search')}
              >
                <Car className="w-4 h-4 mr-2" />
                Search by Make
              </button>
              <button 
                className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                onClick={() => onChangeView('advanced-search')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Search by Features
              </button>
            </div>
          </NavDropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;