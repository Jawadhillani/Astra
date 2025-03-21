'use client'
import { useState, useEffect, useRef } from 'react';
import { Car, ChevronRight, Search, BarChart3, Shield, Bookmark, Star, Zap, Settings, ChevronDown } from 'lucide-react';
import CarListing from '@/components/CarListing';
import AdvancedSearch from '@/components/AdvancedSearch';
import ReviewAnalysis from '@/components/ReviewAnalysis';
import CarDetail from '@/components/CarDetail';
import ChatInterface from '@/components/ChatInterface';

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
          <div className="absolute inset-0 bg-dark-card opacity-95 backdrop-blur-lg border border-dark-border rounded-md shadow-2xl"></div>
          
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
      <div className="absolute inset-0 bg-dark-bg border-b border-dark-border"></div>
      
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

export default function Home() {
  const [view, setView] = useState('home');
  const [selectedCar, setSelectedCar] = useState(null);
  const [dbStatus, setDbStatus] = useState({
    checked: false,
    usingFallback: false,
    message: ''
  });
  const [loading, setLoading] = useState(true);

  // Check database status
  useEffect(() => {
    async function checkDbStatus() {
      try {
        const response = await fetch('/api/test-db');
        if (response.ok) {
          const data = await response.json();
          setDbStatus({
            checked: true,
            usingFallback: data.using_fallback || false,
            message: data.message || ''
          });
        }
      } catch (err) {
        console.error("Failed to check database status:", err);
        setDbStatus({
          checked: true,
          usingFallback: true,
          message: 'Unable to check database status'
        });
      } finally {
        // Simulate loading to show animation
        setTimeout(() => setLoading(false), 800);
      }
    }
    
    checkDbStatus();
  }, []);

  // Debug log when selectedCar changes
  useEffect(() => {
    console.log("Home - selectedCar changed:", selectedCar);
  }, [selectedCar]);

  const handleSelectCar = (car) => {
    console.log("handleSelectCar called with:", car);
    
    // Validate car object
    if (!car || !car.id) {
      console.error("Invalid car object received in handleSelectCar:", car);
      return;
    }
    
    setSelectedCar(car);
    setView('detail');
  };

  // Homepage component
  const HomePage = () => (
    <div className="page-transition">
      {/* Hero section with animated gradient */}
      <div className="animated-gradient text-white py-16 px-4 sm:px-6 rounded-lg shadow-xl mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 neon-text">
            Find Your Perfect Vehicle
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Browse our collection of premium vehicles with detailed specifications and authentic reviews
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => setView('listing')} 
              className="btn-primary flex items-center"
            >
              Browse Cars <ChevronRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => setView('advanced-search')} 
              className="btn-outline flex items-center"
            >
              Advanced Search <Search className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="dynamic-card p-6 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-full flex items-center justify-center mb-4">
            <Car className="h-8 w-8 animated-icon" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Extensive Vehicle Database</h3>
          <p className="text-gray-400">Access detailed information on a wide range of vehicles with comprehensive specifications</p>
        </div>
        
        <div className="dynamic-card p-6 flex flex-col items-center text-center violet-glow">
          <div className="h-16 w-16 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 animated-icon" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Performance Comparison</h3>
          <p className="text-gray-400">Compare different vehicles side by side based on their specifications and reviews</p>
        </div>
        
        <div className="dynamic-card p-6 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 animated-icon" />
          </div>
          <h3 className="text-xl font-semibold mb-2">AI-Generated Reviews</h3>
          <p className="text-gray-400">Get intelligent analysis and insights about vehicles based on their features and user experiences</p>
        </div>
      </div>

      {/* Featured cars section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">Featured Vehicles</h2>
          <button 
            onClick={() => setView('listing')}
            className="text-violet-400 hover:text-violet-300 flex items-center"
          >
            View all <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder featured cars */}
          {dbStatus.usingFallback && (
            <div className="col-span-full alert-warning p-4 rounded-lg mb-4">
              <p className="font-medium">
                Using sample data. Connect to database for real car listings.
              </p>
            </div>
          )}
          
          <div 
            className="card-with-header cursor-pointer"
            onClick={() => setView('listing')}
          >
            <div className="header bg-gradient-to-r from-blue-900 to-violet-900">
              <h3 className="font-bold flex items-center">
                <Star className="mr-2 h-5 w-5" /> Luxury Sedans
              </h3>
            </div>
            <div className="content">
              <div className="h-40 bg-gradient-to-r from-blue-900 to-violet-800 flex items-center justify-center">
                <Car className="h-20 w-20 text-white animated-icon" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <span className="badge-gradient">Premium</span>
                  <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs">High MPG</span>
                </div>
                <Bookmark className="h-5 w-5 text-violet-400 animated-icon" />
              </div>
            </div>
          </div>
          
          <div 
            className="card-with-header cursor-pointer"
            onClick={() => setView('listing')}
          >
            <div className="header bg-gradient-to-r from-purple-900 to-violet-900">
              <h3 className="font-bold flex items-center">
                <Zap className="mr-2 h-5 w-5" /> SUVs & Crossovers
              </h3>
            </div>
            <div className="content">
              <div className="h-40 bg-gradient-to-r from-purple-900 to-violet-800 flex items-center justify-center">
                <Car className="h-20 w-20 text-white animated-icon" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <span className="badge-gradient">Family</span>
                  <span className="px-2 py-1 bg-purple-900 text-purple-200 rounded text-xs">AWD</span>
                </div>
                <Bookmark className="h-5 w-5 text-purple-400 animated-icon" />
              </div>
            </div>
          </div>
          
          <div 
            className="card-with-header cursor-pointer"
            onClick={() => setView('listing')}
          >
            <div className="header bg-gradient-to-r from-indigo-900 to-violet-900">
              <h3 className="font-bold flex items-center">
                <Settings className="mr-2 h-5 w-5" /> Electric Vehicles
              </h3>
            </div>
            <div className="content">
              <div className="h-40 bg-gradient-to-r from-indigo-900 to-blue-800 flex items-center justify-center">
                <Car className="h-20 w-20 text-white animated-icon" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <span className="badge-gradient">Electric</span>
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">Tech</span>
                </div>
                <Bookmark className="h-5 w-5 text-indigo-400 animated-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-violet-500 border-solid rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Car Explorer</h2>
          <p className="text-gray-400">Loading amazing vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Using the dropdown navbar */}
      <Navbar currentView={view} onChangeView={setView} />

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && <HomePage />}
        
        {view === 'listing' && (
          <div className="page-transition">
            <CarListing onSelectCar={handleSelectCar} />
          </div>
        )}
        
        {view === 'advanced-search' && (
          <div className="page-transition">
            <AdvancedSearch />
          </div>
        )}
        
        {view === 'detail' && selectedCar && (
          <div className="page-transition">
            <CarDetail car={selectedCar} onBack={() => setView('listing')} />
          </div>
        )}
        
        {view === 'analysis' && selectedCar && (
          <div className="page-transition">
            <ReviewAnalysis carId={selectedCar.id} />
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-dark-card to-dark-surface py-8 mt-12 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 gradient-text">Car Explorer</h3>
              <p className="text-gray-400">Your comprehensive resource for automotive information and reviews.</p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setView('home')} className="text-gray-400 hover:text-violet-400 transition-colors">Home</button></li>
                <li><button onClick={() => setView('listing')} className="text-gray-400 hover:text-violet-400 transition-colors">Car Listing</button></li>
                <li><button onClick={() => setView('advanced-search')} className="text-gray-400 hover:text-violet-400 transition-colors">Advanced Search</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Vehicle Categories</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setView('listing')} className="text-gray-400 hover:text-violet-400 transition-colors">Sedans</button></li>
                <li><button onClick={() => setView('listing')} className="text-gray-400 hover:text-violet-400 transition-colors">SUVs</button></li>
                <li><button onClick={() => setView('listing')} className="text-gray-400 hover:text-violet-400 transition-colors">Electric</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Database Status</h4>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${dbStatus.usingFallback ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'}`}>
                {dbStatus.usingFallback ? 'Using Sample Data' : 'Live Database'}
              </div>
              <p className="text-gray-400 text-sm mt-2">{dbStatus.message}</p>
            </div>
          </div>
          <div className="border-t border-dark-border mt-8 pt-6 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Car Explorer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}