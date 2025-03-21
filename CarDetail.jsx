'use client'
import { useState, useEffect } from 'react';
import { Star, ChevronLeft, MessageCircle, AlertCircle, RefreshCw, Database, Calendar, Fuel, Gauge, Settings, Shield, ArrowUp, ArrowDown } from 'lucide-react';
import ReviewAnalysis from './ReviewAnalysis';
import ChatInterface from './ChatInterface';

export default function CarDetail({ car, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [refreshingReviews, setRefreshingReviews] = useState(false);
  const [carStatus, setCarStatus] = useState({
    valid: true,
    message: null,
    usingFallback: false,
    dbConnected: true
  });

  // Debug log the car object when component mounts
  useEffect(() => {
    console.log("CarDetail mounted with car:", car);
    if (car && car.id) {
      checkCarAndDatabaseStatus();
    } else {
      setLoading(false);
      setCarStatus({
        valid: false,
        message: "Invalid car data provided",
        usingFallback: false,
        dbConnected: true
      });
    }
  }, [car]);

  // Check car existence and database status
  async function checkCarAndDatabaseStatus() {
    try {
      // First check database status
      const dbResponse = await fetch('/api/test-db');
      const dbData = await dbResponse.json();
      
      const isUsingFallback = dbData.using_fallback || false;
      const isDbConnected = dbData.status === "success";
      
      console.log("Database status:", dbData);
      
      // Then check if car exists
      const carResponse = await fetch(`/api/cars/${car.id}`);
      console.log("Car fetch status:", carResponse.status);
      
      if (!carResponse.ok) {
        setCarStatus({
          valid: false,
          message: `Car with ID ${car.id} not found. Database may be using fallback data.`,
          usingFallback: isUsingFallback,
          dbConnected: isDbConnected
        });
        setLoading(false);
        return;
      }
      
      // Car exists, set status and fetch reviews
      setCarStatus({
        valid: true,
        message: null,
        usingFallback: isUsingFallback,
        dbConnected: isDbConnected
      });
      
      fetchReviews();
    } catch (err) {
      console.error('Error checking car and database status:', err);
      setCarStatus({
        valid: false,
        message: `Error checking car status: ${err.message}`,
        usingFallback: false,
        dbConnected: false
      });
      setLoading(false);
    }
  }

  async function fetchReviews() {
    setRefreshingReviews(true);
    try {
      // Always use the API endpoint instead of Supabase
      const apiResponse = await fetch(`/api/cars/${car.id}/reviews`);
      if (apiResponse.ok) {
        const reviewsData = await apiResponse.json();
        console.log("Fetched reviews from API:", reviewsData);
        setReviews(reviewsData || []);
        if (reviewsData?.length >= 3) generateSummary(reviewsData);
      } else {
        // Log the error but don't throw yet
        console.error(`Error fetching reviews: ${apiResponse.status}`);
        
        // Try a second time with a slight delay
        setTimeout(async () => {
          try {
            const retryResponse = await fetch(`/api/cars/${car.id}/reviews`);
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              console.log("Fetched reviews on retry:", retryData);
              setReviews(retryData || []);
              if (retryData?.length >= 3) generateSummary(retryData);
            } else {
              // If retry also fails, set empty reviews
              console.error(`Retry also failed: ${retryResponse.status}`);
              setReviews([]);
            }
          } catch (retryErr) {
            console.error('Error in retry fetch:', retryErr);
            setReviews([]);
          } finally {
            setLoading(false);
            setRefreshingReviews(false);
          }
        }, 1000);
        return; // Exit early as we're handling this in the setTimeout
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // If both methods fail, show empty reviews
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshingReviews(false);
    }
  }

  function generateSummary(reviewData) {
    if (!reviewData || reviewData.length === 0) return;
    
    // Simple summary generation logic
    const avgRating = reviewData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewData.length;
    const positiveCount = reviewData.filter(r => (r.rating || 0) >= 4).length;
    const negativeCount = reviewData.filter(r => (r.rating || 0) <= 2).length;
    
    setSummary({
      avgRating: avgRating.toFixed(1),
      positivePercentage: ((positiveCount / reviewData.length) * 100).toFixed(0),
      negativePercentage: ((negativeCount / reviewData.length) * 100).toFixed(0),
      totalReviews: reviewData.length
    });
  }

  // Show/Hide AI Review UI
  const toggleAnalysis = () => {
    console.log("Toggling analysis, car ID:", car.id);
    setShowAnalysis(!showAnalysis);
    if (showChat) setShowChat(false);
  };

  // Show/Hide Chat UI
  const toggleChat = () => {
    setShowChat(!showChat);
    if (showAnalysis) setShowAnalysis(false);
  };

  // Generate stars display for ratings
  const renderStars = (rating) => {
    if (!rating) return null;
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  // Display database status
  const renderDatabaseStatus = () => {
    if (carStatus.usingFallback) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4 flex items-center text-sm">
          <Database className="w-4 h-4 mr-2" />
          Using fallback database with sample data
        </div>
      );
    }
    
    if (!carStatus.dbConnected) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4 flex items-center text-sm">
          <Database className="w-4 h-4 mr-2" />
          Database connection issue
        </div>
      );
    }
    
    return null;
  };

  // Generate a car image based on manufacturer (placeholder)
  const getCarImage = () => {
    const manufacturer = car?.manufacturer?.toLowerCase() || '';
    let bgColor = 'from-blue-600 to-black';
    
    if (manufacturer.includes('tesla')) {
      bgColor = 'from-red-600 to-black';
    } else if (manufacturer.includes('bmw')) {
      bgColor = 'from-blue-600 to-black';
    } else if (manufacturer.includes('toyota')) {
      bgColor = 'from-green-600 to-black';
    } else if (manufacturer.includes('ford')) {
      bgColor = 'from-indigo-600 to-black';
    } else if (manufacturer.includes('honda')) {
      bgColor = 'from-red-600 to-blue-600';
    }
    
    return (
      <div className={`h-48 bg-gradient-to-r ${bgColor} rounded-lg flex items-center justify-center text-white`}>
        <span className="text-3xl font-bold">{car?.manufacturer}</span>
      </div>
    );
  };

  if (!carStatus.valid) {
    return (
      <div>
        <div className="mb-4">
          <button 
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to listing
          </button>
        </div>
        
        {renderDatabaseStatus()}
        
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">Car Not Found</h2>
          <p className="mb-4">{carStatus.message || "This car doesn't exist in the database."}</p>
          <p className="text-sm mt-2">ID: {car?.id || 'Unknown'}</p>
          <p className="text-sm mt-4">
            Try restarting the application or checking your database connection.
          </p>
          <button 
            onClick={checkCarAndDatabaseStatus}
            className="mt-4 btn-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to listing
        </button>
      </div>
      
      {renderDatabaseStatus()}
      
      {/* Car Info Section */}
      <div className="card-dark-header mb-6">
        <div className="header">
          <h1 className="text-2xl font-bold">
            {car.year} {car.manufacturer} {car.model}
          </h1>
          <div className="flex items-center text-gray-400 mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Year: {car.year}</span>
            <span className="mx-2">•</span>
            <span>ID: {car.id}</span>
          </div>
        </div>
        
        <div className="content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Fuel className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Engine</p>
                    <p className="font-medium">{car.engine_info || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Gauge className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fuel Economy</p>
                    <p className="font-medium">{car.mpg || 'N/A'} MPG</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-medium">{car.transmission || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Body Type</p>
                    <p className="font-medium">{car.body_type || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={toggleAnalysis}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${
                    showAnalysis 
                      ? 'bg-black text-white' 
                      : 'bg-gray-800 text-white hover:bg-black'
                  }`}
                >
                  {showAnalysis ? "Hide AI Analysis" : "Generate AI Review"}
                </button>
                
                <button
                  onClick={toggleChat}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${
                    showChat 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {showChat ? "Hide Chat" : "Ask About This Car"}
                </button>
              </div>
            </div>
            
            <div>
              {getCarImage()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Interface */}
      {showChat && (
        <div className="mb-6">
          <ChatInterface carId={car.id} />
        </div>
      )}
      
      {/* Conditionally render the ReviewAnalysis component */}
      {showAnalysis && (
        <div className="mb-6">
          <ReviewAnalysis carId={car.id} usingFallback={carStatus.usingFallback} />
        </div>
      )}
      
      {/* Reviews & Summary Section */}
      {!showAnalysis && !showChat && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="card-dark-header">
              <div className="header flex justify-between items-center">
                <h2 className="text-xl font-bold">Reviews</h2>
                <button 
                  onClick={fetchReviews} 
                  disabled={refreshingReviews}
                  className="flex items-center text-gray-300 hover:text-white text-sm bg-gray-700 px-3 py-1 rounded-lg"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${refreshingReviews ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              <div className="content">
                {loading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                          <h3 className="font-bold text-gray-900">{review.review_title || review.title || "Review"}</h3>
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">By {review.author} • {new Date(review.review_date || review.date).toLocaleDateString()}</p>
                        {(review.is_ai_generated || review.is_mock) && (
                          <div className="flex items-center text-xs text-blue-600 mb-2">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            AI Generated
                          </div>
                        )}
                        <p className="mt-2 text-gray-700 review-text">{review.review_text || review.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No reviews yet for this vehicle.</p>
                    <p className="text-sm text-gray-500">Be the first to generate an AI review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Summary Card */}
          {summary && (
            <div>
              <div className="card-dark-header">
                <div className="header">
                  <h2 className="text-xl font-bold">Review Summary</h2>
                </div>
                
                <div className="content">
                  <div className="flex items-center mb-5">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Star className="w-6 h-6 text-blue-600 fill-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold text-gray-900">{summary.avgRating}</span>
                        <div className="flex ml-3 mt-1">
                          {renderStars(parseFloat(summary.avgRating))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Based on {summary.totalReviews} reviews</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium flex items-center text-green-700">
                          <ArrowUp className="w-4 h-4 mr-1" />
                          Positive
                        </span>
                        <span className="font-medium text-green-700">{summary.positivePercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${summary.positivePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium flex items-center text-red-700">
                          <ArrowDown className="w-4 h-4 mr-1" />
                          Negative
                        </span>
                        <span className="font-medium text-red-700">{summary.negativePercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-red-500 h-2.5 rounded-full" 
                          style={{ width: `${summary.negativePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}