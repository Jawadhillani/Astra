'use client'
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Database, 
  ChevronRight, 
  Search, 
  BarChart3, 
  FileSearch, 
  Shield, 
  Briefcase,
  Car as CarIcon, 
  RefreshCw, 
  Fuel, 
  Gauge, 
  Calendar, 
  Zap, 
  Award, 
  Filter, 
  Info, 
  Sliders,
  AlertCircle, 
  LayoutGrid, 
  FileText, 
  Command,
  ChevronLeft,
  ChevronDown,
  Heart,
  Star,
  Package,
  Clock,
  Menu,
  ArrowUpRight
} from 'lucide-react';
import UnsplashTest from '../components/UnsplashTest';

import CarListing from '@/components/CarListing';
import AdvancedSearch from '@/components/AdvancedSearch';
import ReviewAnalysis from '@/components/ReviewAnalysis';
import CarDetail from '@/components/CarDetail';
import ChatInterface from '@/components/ChatInterface';

// -- NEW IMPORT --
import DataHiveDashboard from '@/components/visualizations/DataHiveDashboard';

// -- CHAT COMPONENT IMPORTS --
import ChatIntegration from '@/components/ChatIntegration';

import EnhancedCherryLogo from '@/components/EnhancedCherryLogo';

// ------------------
// Dropdown component
// ------------------
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
            ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white' 
            : 'bg-black/40 backdrop-blur-sm text-gray-300 hover:bg-black/60 border border-gray-800 hover:border-violet-500/50'
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (onClick) onClick();
        }}
      >
        {title}
        <ChevronRight 
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-90' : ''
          }`} 
        />
      </button>
      
      {/* Dropdown Menu - with solid background */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg z-50 overflow-hidden">
          {/* Solid background to ensure visibility */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg border border-gray-800 rounded-md shadow-2xl"></div>

          {/* Content */}
          <div className="relative z-10 py-2 rounded-md">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// ------------------------
// Navbar with dropdowns
// ------------------------
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
      scrolled ? 'bg-black/90 backdrop-blur-lg shadow-xl border-b border-gray-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo section */}
          <div className="flex items-center">
            <EnhancedCherryLogo />
          </div>
          
          {/* Nav Links */}
          <div className="flex space-x-4">
            {/* Overview button */}
            <button
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                currentView === 'home' 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white' 
                  : 'bg-black/40 backdrop-blur-sm text-gray-300 hover:bg-black/60 border border-gray-800 hover:border-violet-500/50'
              }`}
              onClick={() => onChangeView('home')}
            >
              Overview
            </button>

            {/* Database dropdown */}
            <NavDropdown 
              title="Database" 
              isActive={currentView === 'listing'} 
              onClick={() => onChangeView('listing')}
            >
              <div className="px-1">
                <button 
                  className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                  onClick={() => onChangeView('listing')}
                >
                  <Database className="w-4 h-4 mr-2" />
                  All Records
                </button>
                <button 
                  className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                  onClick={() => onChangeView('listing')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Performance Data
                </button>
                <button 
                  className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                  onClick={() => onChangeView('listing')}
                >
                  <CarIcon className="w-4 h-4 mr-2" />
                  Vehicle Specifications
                </button>
              </div>
            </NavDropdown>

            {/* Analysis dropdown */}
            <NavDropdown 
              title="Analysis" 
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
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Data Visualization
                </button>
                <button 
                  className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-violet-800 hover:text-white rounded-md"
                  onClick={() => onChangeView('advanced-search')}
                >
                  <FileSearch className="w-4 h-4 mr-2" />
                  Technical Reports
                </button>
              </div>
            </NavDropdown>
          </div>

          {/* Mobile menu button (visible on small screens) */}
          <button className="md:hidden text-gray-300 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------------
// Main page component
// ------------------------
export default function Home() {
  const [view, setView] = useState('home');
  const [selectedCar, setSelectedCar] = useState(null);
  const [dbStatus, setDbStatus] = useState({
    checked: false,
    usingFallback: false,
    message: ''
  });
  const [loading, setLoading] = useState(true);

  // -- NEW STATE: Toggle DataHive mode in detail view
  const [useDataHive, setUseDataHive] = useState(false);
  const [hoveredCar, setHoveredCar] = useState(null);

  // Check database status on mount
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

  // Debug log whenever selectedCar changes
  useEffect(() => {
    console.log("Home - selectedCar changed:", selectedCar);
  }, [selectedCar]);

  // Handler for selecting a car in CarListing
  const handleSelectCar = (car) => {
    console.log("handleSelectCar called with:", car);
    if (!car || !car.id) {
      console.error("Invalid car object received in handleSelectCar:", car);
      return;
    }
    setSelectedCar(car);
    setView('detail');
  };

  // Sample featured vehicles for homepage
  const featuredCars = [
    {
      id: 1,
      manufacturer: "BMW",
      model: "3 Series",
      year: 2023,
      price: "$43,700",
      engine: "2.0L Turbo",
      rating: 4.8,
      body: "Sedan",
      power: "255 hp",
      acceleration: "5.6s"
    },
    {
      id: 28,
      manufacturer: "Dodge",
      model: "Dart",
      year: 2016,
      price: "$18,995",
      engine: "2.4L 4cyl 6M",
      rating: 4.2,
      body: "Sedan",
      power: "184 hp",
      acceleration: "8.2s"
    },
    {
      id: 11,
      manufacturer: "Dodge",
      model: "Avenger",
      year: 2014,
      price: "$16,495",
      engine: "2.4L 4cyl 4A",
      rating: 3.8,
      body: "Sedan",
      power: "173 hp",
      acceleration: "9.2s"
    }
  ];

  // Categories with realistic counts
  const categories = [
    { name: "Luxury Sedans", icon: <CarIcon />, count: 28, color: "from-violet-600 to-purple-800" },
    { name: "SUVs & Crossovers", icon: <Package />, count: 42, color: "from-violet-500 to-indigo-700" },
    { name: "Electric Vehicles", icon: <Zap />, count: 16, color: "from-fuchsia-600 to-purple-800" },
    { name: "Sports Cars", icon: <Gauge />, count: 23, color: "from-pink-600 to-purple-800" }
  ];

  // Car visualization style functions
  const getCarGradient = (manufacturer) => {
    const gradients = {
      "BMW": "from-blue-600 to-violet-900", 
      "Dodge": "from-red-600 to-violet-900",
      "default": "from-violet-600 to-indigo-900"
    };
    
    return gradients[manufacturer] || gradients.default;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            fill={star <= Math.floor(rating) ? "#9333EA" : "none"}
            stroke={star <= Math.floor(rating) ? "#9333EA" : "#6B7280"}
            className="w-4 h-4" 
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-300">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // -------------------------------------------
  // Home Page content (redesigned)
  // -------------------------------------------
  const HomePage = () => (
    <div className="page-transition">
      {/* Hero section with premium design */}
      <section className="relative overflow-hidden rounded-2xl mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 to-black z-10"></div>
        
        {/* Diagonal pattern overlay */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(124, 58, 237, 0.2) 25%, transparent 25%, transparent 50%, rgba(124, 58, 237, 0.2) 50%, rgba(124, 58, 237, 0.2) 75%, transparent 75%, transparent)`,
            backgroundSize: '20px 20px',
            opacity: 0.3
          }}
        ></div>

        <div className="relative z-20 py-16 px-6 md:px-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-600/20 border border-violet-600/30 text-violet-300">
              <Database className="w-3 h-3 mr-1.5" />
              Premium Automotive Database
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">
                Discover Your Dream Vehicle
              </span>
            </h1>
            
            <p className="text-xl text-violet-100 mb-8 max-w-3xl">
              Explore our collection of premium vehicles with detailed specifications, authentic reviews, and powerful comparison tools
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setView('listing')} 
                className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center shadow-lg hover:shadow-violet-500/20 transition-all"
              >
                Browse Vehicles <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <button 
                onClick={() => setView('advanced-search')} 
                className="bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-gray-800 hover:border-violet-500/50 text-gray-200 px-6 py-3 rounded-lg font-medium flex items-center transition-all"
              >
                Advanced Search <Search className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Premium models showcase */}
          <div className="mt-12 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <div 
                  key={car.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredCar(car.id)}
                  onMouseLeave={() => setHoveredCar(null)}
                  onClick={() => handleSelectCar(car)}
                >
                  {/* Animated border on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                  
                  {/* Card content */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden group-hover:border-transparent transition-colors cursor-pointer">
                    {/* Car image with gradient background */}
                    <div className={`h-44 flex items-center justify-center relative bg-gradient-to-br ${getCarGradient(car.manufacturer)}`}>
                      {/* Wishlist button */}
                      <button className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all ${hoveredCar === car.id ? 'bg-white/20 backdrop-blur-sm' : 'bg-black/40'}`}>
                        <Heart className={`w-4 h-4 ${hoveredCar === car.id ? 'text-red-400' : 'text-white/60'}`} />
                      </button>
                      
                      {/* Car visualization */}
                      <div className="relative">
                        <CarIcon className="w-24 h-24 text-white opacity-90" />
                      </div>
                      
                      {/* Key stats badges */}
                      <div className="absolute bottom-3 left-3 flex space-x-2">
                        <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white flex items-center">
                          <Gauge className="w-3 h-3 mr-1 text-violet-400" /> {car.power}
                        </div>
                        <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-green-400" /> {car.acceleration}
                        </div>
                      </div>
                    </div>
                    
                    {/* Car details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-white text-lg">{car.year} {car.manufacturer} {car.model}</h3>
                        <span className="text-lg font-bold text-violet-400">{car.price}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">{car.body} • {car.engine}</div>
                        <div>{renderStars(car.rating)}</div>
                      </div>
                      
                      {/* View details button - shows on hover */}
                      <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded flex items-center transition-colors">
                            View Details <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical pattern in the background */}
        <div className="absolute bottom-0 right-0 max-w-lg opacity-10 z-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
            <circle cx="300" cy="200" r="120" stroke="white" strokeWidth="1"/>
            <circle cx="300" cy="200" r="80" stroke="white" strokeWidth="1"/>
            <line x1="150" y1="200" x2="450" y2="200" stroke="white" strokeWidth="1"/>
            <line x1="300" y1="50" x2="300" y2="350" stroke="white" strokeWidth="1"/>
            <rect x="260" y="160" width="80" height="80" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
      </section>

      {/* Browse by Category section */}
      <section className="py-10 mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Browse by Category</h2>
          <div className="flex items-center text-violet-400 text-sm font-medium">
            <span>25,347 vehicles</span>
            <div className="w-2 h-2 rounded-full bg-violet-500 mx-2"></div>
            <span>Updated daily</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dbStatus.usingFallback && (
            <div className="col-span-full mb-4 bg-black/60 border border-yellow-600/30 rounded-lg p-4 flex items-center text-yellow-500">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>Currently displaying sample dataset. Connect to main database for complete records.</p>
            </div>
          )}

          {categories.map((category) => (
            <div 
              key={category.name} 
              className="group cursor-pointer relative"
              onClick={() => setView('listing')}
            >
              {/* Card background with animated gradient border on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 group-hover:border-transparent transition-colors">
                {/* Category icon */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform`}>
                  <div className="w-8 h-8 text-white">
                    {category.icon}
                  </div>
                </div>
                
                {/* Category details */}
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">{category.name}</h3>
                <p className="text-gray-400">{category.count} vehicles</p>
                
                {/* Show arrow on hover */}
                <div className="mt-4 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <ArrowRight className="text-violet-400 w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features section with improved visual design */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8">Premium Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-violet-600/30 transition-all p-1">
            <div className="bg-black rounded-lg p-6 h-full">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 mb-4 group-hover:shadow-lg group-hover:shadow-violet-600/20 transition-all">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-violet-300 transition-colors">Comprehensive Database</h3>
              <p className="text-gray-400">
                Access detailed specifications, high-quality images, and accurate data for thousands of vehicles dating back decades
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Complete vehicle specifications
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Performance metrics and benchmarks
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Technical specifications and data
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-violet-600/30 transition-all p-1">
            <div className="bg-black rounded-lg p-6 h-full">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 mb-4 group-hover:shadow-lg group-hover:shadow-violet-600/20 transition-all">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-violet-300 transition-colors">Advanced Analysis</h3>
              <p className="text-gray-400">
                Powerful visualization and comparison tools for in-depth technical analysis and research
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Side-by-side technical comparison
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Performance metric visualization
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Historical trend analysis
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-violet-600/30 transition-all p-1">
            <div className="bg-black rounded-lg p-6 h-full">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 mb-4 group-hover:shadow-lg group-hover:shadow-violet-600/20 transition-all">
                <FileSearch className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-violet-300 transition-colors">Expert Reviews</h3>
              <p className="text-gray-400">
                Read authentic reviews from owners and get AI-powered analysis of common pros and cons
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Owner and expert reviews
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Sentiment analysis breakdowns
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></div>
                  Common pros and cons summary
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions section */}
      <section className="bg-gradient-to-br from-violet-900/30 to-black rounded-xl border border-violet-800/20 p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6 text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setView('listing')}
            className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all group"
          >
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-full p-3 mb-3 group-hover:shadow-lg group-hover:shadow-violet-600/20 transition-all">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-white">Browse Vehicles</span>
          </button>
          
          <button
            onClick={() => setView('advanced-search')}
            className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all group"
          >
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-full p-3 mb-3 group-hover:shadow-lg group-hover:shadow-violet-600/20 transition-all">
              <Sliders className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-white">Advanced Search</span>
          </button>
          
          <button
            onClick={() => setView('advanced-search')}
            className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all group"
          >
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-full p-3 mb-3 group-hover:shadow-lg group-hover:shadow-violet-600/20 transition-all">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-white">View Reviews</span>
          </button>
          
          <button
            onClick={() => setView('advanced-search')}
            className="flex flex-col items-center justify-center p-4 bg-black/50 rounded-lg border border-gray-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all group"
          >
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-full p-3 mb-3 group-hover:shadow-lg group-hover:shadow-violet-600/20 transition-all">
              <Command className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-white">Compare Vehicles</span>
          </button>
        </div>
      </section>

      {/* Why choose us section */}
      <section className="bg-gradient-to-br from-black to-gray-900 rounded-xl border border-gray-800 p-6 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold text-white mb-3">Why Choose AutoDB</h2>
            <p className="text-gray-400 mb-6">
              The ultimate automotive database with powerful features designed for enthusiasts and buyers alike. 
              We provide the most comprehensive and accurate vehicle data available anywhere.
            </p>
            <button 
              onClick={() => setView('listing')}
              className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white py-2 px-6 rounded-lg font-medium shadow-lg transition-all transform hover:-translate-y-1"
            >
              Explore All Features
            </button>
          </div>
          <div className="md:w-1/3 flex flex-col space-y-4">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-full p-2 mr-3 mt-1">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">Premium Database</h3>
                <p className="text-sm text-gray-400">Expertly curated vehicle information updated daily</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-full p-2 mr-3 mt-1">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">Trusted Reviews</h3>
                <p className="text-sm text-gray-400">Verified owner reviews with sentiment analysis</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-full p-2 mr-3 mt-1">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">Advanced Search</h3>
                <p className="text-sm text-gray-400">Find exactly what you're looking for with precision</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // -------------------------------------------
  // Loading spinner
  // -------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-lg bg-violet-600/10 border border-violet-600/20 mb-4">
            <div className="w-8 h-8 border-t-2 border-r-2 border-violet-500 border-solid rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-pink-500 mb-2">
            Cherry Ai
          </h2>
          <p className="text-gray-400">Loading premium vehicle data...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------
  // Main return block
  // -------------------------------------------
  return (
    <main className="min-h-screen bg-black">
      {/* Navbar */}
      <Navbar currentView={view} onChangeView={setView} />

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Home */}
        {view === 'home' && <HomePage />}

        {/* Listing */}
        {view === 'listing' && (
          <div className="page-transition">
            <CarListing onSelectCar={handleSelectCar} />
          </div>
        )}

        {/* Advanced Search */}
        {view === 'advanced-search' && (
          <div className="page-transition">
            <AdvancedSearch />
          </div>
        )}

        {/* Detail View => Now toggles between DataHive or standard CarDetail */}
        {view === 'detail' && selectedCar && (
          <div className="page-transition">
            {/* Toggle button for DataHive mode */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setUseDataHive(!useDataHive)}
                className={`px-4 py-2 rounded-lg ${
                  useDataHive 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white' 
                    : 'bg-black/50 text-gray-300 border border-gray-800 hover:border-violet-500/50'
                }`}
              >
                {useDataHive ? 'Standard View' : 'DataHive View'}
              </button>
            </div>

            {/* Render either DataHive or standard CarDetail */}
            {useDataHive ? (
              <DataHiveDashboard carId={selectedCar.id} />
            ) : (
              <>
                <CarDetail car={selectedCar} onBack={() => setView('listing')} />
                {/* Add the ChatIntegration component here */}
                <ChatIntegration carId={selectedCar.id} />
              </>
            )}

            {/* "Back to listing" if user is in DataHive mode */}
            {useDataHive && (
              <button 
                onClick={() => setView('listing')}
                className="mt-6 flex items-center text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to listing
              </button>
            )}
          </div>
        )}

        {/* Analysis (ReviewAnalysis) */}
        {view === 'analysis' && selectedCar && (
          <div className="page-transition">
            <ReviewAnalysis carId={selectedCar.id} />
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-black/80 backdrop-blur-md border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <EnhancedCherryLogo size="small" />
            <p className="text-sm text-gray-400">© 2024 Cherry AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}