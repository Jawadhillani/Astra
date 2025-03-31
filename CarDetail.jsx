'use client';
import { 
  useState, 
  useEffect, 
  useRef 
} from 'react';
import {
  Star,
  ChevronLeft,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Calendar,
  Fuel,
  Gauge,
  Settings,
  Shield,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';

import ReviewAnalysis from './ReviewAnalysis';
// NEW IMPORT (instead of ChatInterface)
import EnhancedNeuralInterface from './EnhancedNeuralInterface';

export default function CarDetail({ car, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [refreshingReviews, setRefreshingReviews] = useState(false);

  // --- New chatState approach ---
  // "closed" | "opening" | "open" | "closing"
  const [chatState, setChatState] = useState("closed");

  // We'll store the button’s center & dimensions to animate from there
  const [buttonRect, setButtonRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  // Car validity & DB status
  const [carStatus, setCarStatus] = useState({
    valid: true,
    message: null,
    usingFallback: false,
    dbConnected: true
  });

  // Refs
  const mainContentRef = useRef(null);
  const chatButtonRef = useRef(null);

  // -- Body scroll locking when chat is NOT "closed" --
  useEffect(() => {
    if (chatState !== "closed") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [chatState]);

  // -- On mount, check if car is valid, etc. --
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car]);

  // -- Check DB status, then whether car exists --
  async function checkCarAndDatabaseStatus() {
    try {
      // 1) Check database
      const dbResponse = await fetch('/api/test-db');
      const dbData = await dbResponse.json();
      const isUsingFallback = dbData.using_fallback || false;
      const isDbConnected = dbData.status === "success";

      console.log("Database status:", dbData);

      // 2) Check if car with ID exists
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

      // Car is valid
      setCarStatus({
        valid: true,
        message: null,
        usingFallback: isUsingFallback,
        dbConnected: isDbConnected
      });

      // Fetch reviews
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

  // -- Fetch car reviews from your /api/ endpoint --
  async function fetchReviews() {
    setRefreshingReviews(true);
    try {
      const apiResponse = await fetch(`/api/cars/${car.id}/reviews`);
      if (apiResponse.ok) {
        const reviewsData = await apiResponse.json();
        console.log("Fetched reviews from API:", reviewsData);
        setReviews(reviewsData || []);
        if (reviewsData?.length >= 3) generateSummary(reviewsData);
      } else {
        console.error(`Error fetching reviews: ${apiResponse.status}`);
        // Retry once
        setTimeout(async () => {
          try {
            const retryResponse = await fetch(`/api/cars/${car.id}/reviews`);
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              console.log("Fetched reviews on retry:", retryData);
              setReviews(retryData || []);
              if (retryData?.length >= 3) generateSummary(retryData);
            } else {
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
        return;
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshingReviews(false);
    }
  }

  // -- Simple aggregator for a summary. You could use AI or advanced logic too. --
  function generateSummary(reviewData) {
    if (!reviewData || reviewData.length === 0) return;

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

  // -- Show/hide the AI review analysis panel --
  function toggleAnalysis() {
    setShowAnalysis(!showAnalysis);
    // If chat is open, close it
    if (chatState !== "closed") {
      closeChat();
    }
  }

  // -- "Genie" chat open/close with clip-path swirl effect --
  function openChat() {
    // Capture button center for clip-path origin
    if (chatButtonRef.current) {
      const rect = chatButtonRef.current.getBoundingClientRect();
      setButtonRect({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      });
    }
    // Start opening animation
    setChatState("opening");
    // Move to fully "open" after your animation duration (600ms used below)
    setTimeout(() => setChatState("open"), 600);
  }

  function closeChat() {
    setChatState("closing");
    // End-state: remove from DOM after 500ms
    setTimeout(() => setChatState("closed"), 500);
  }

  // -- Star rendering for the reviews --
  function renderStars(rating) {
    if (!rating) return null;
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  }

  // -- Database status info (fallback/connection issues) --
  function renderDatabaseStatus() {
    if (carStatus.usingFallback) {
      return (
        <div
          style={{
            background: 'linear-gradient(to right, rgba(252, 211, 77, 0.1), rgba(251, 191, 36, 0.05))',
            borderRadius: '0.5rem',
            border: '1px solid rgba(252, 211, 77, 0.3)',
            marginBottom: '1rem',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: 'rgb(252, 211, 77)'
          }}
        >
          <Database className="w-4 h-4 mr-2" />
          Using fallback database with sample data
        </div>
      );
    }
    if (!carStatus.dbConnected) {
      return (
        <div
          style={{
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '1rem',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: 'rgb(239, 68, 68)'
          }}
        >
          <Database className="w-4 h-4 mr-2" />
          Database connection issue
        </div>
      );
    }
    return null;
  }

  // -- Placeholder approach: custom color gradient based on manufacturer name --
  function getCarImage() {
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
  }

  // -- The “Genie” chat container with swirling conic-gradient & sparkles --
  function renderChatContainer() {
    if (chatState === "closed") return null;

    // For the clip-path circle origin
    const style = {
      "--origin-x": `${buttonRect.x}px`,
      "--origin-y": `${buttonRect.y}px`
    };

    return (
      <div
        className={`chat-genie-container fixed inset-0 z-50 ${chatState}`}
        style={style}
      >
        {/* Magical swirl & sparkles: purely decorative */}
        <div className="swirl-bg absolute inset-0 pointer-events-none" />
        <div className="sparkles absolute inset-0 pointer-events-none" />

        {/* Chat content area */}
        <div className="chat-content relative z-10 w-full h-full bg-black/80 backdrop-blur-md flex flex-col">
          <button
            className="absolute top-4 right-4 p-3 bg-black/30 rounded-full hover:bg-black/50 transition-colors z-50"
            onClick={closeChat}
          >
            <X className="w-6 h-6 text-white/80" />
          </button>

          <div className="pt-16 flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto h-full">
              {/* Replace ChatInterface with EnhancedNeuralInterface */}
              <EnhancedNeuralInterface carId={car.id} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -- If car is invalid or DB fails, show an error card --
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

        <div
          style={{
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <h2 className="text-xl font-bold mb-2 text-red-500">Car Not Found</h2>
          <p className="mb-4 text-red-600">
            {carStatus.message || "This car doesn't exist in the database."}
          </p>
          <p className="text-sm mt-2 text-gray-300">ID: {car?.id || 'Unknown'}</p>
          <p className="text-sm mt-4 text-gray-400">
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

  // -- Otherwise, render the car details & reviews as normal --
  return (
    <div className="relative">
      {/* Main Content */}
      <div ref={mainContentRef} className="relative">
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
        <div className="relative rounded-lg overflow-hidden mb-6">
          {/* Animated gradient border (optional subtle effect) */}
          <div 
            className="absolute inset-0 rounded-lg" 
            style={{
              background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-violet), var(--accent-purple), var(--accent-blue))',
              backgroundSize: '300% 100%',
              animation: 'borderGradientAnimation 8s ease infinite',
              opacity: '0.2',
              filter: 'blur(8px)',
              zIndex: '0'
            }}
          ></div>

          <div className="relative bg-dark-card border border-transparent rounded-lg overflow-hidden z-10">
            <div className="header bg-gradient-to-r from-gray-900 to-dark-card p-4 border-b border-gray-800/50">
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

            <div className="content p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-start">
                      <div
                        className="bg-blue-900/30 p-2 rounded-lg mr-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1))',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <Fuel className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Engine</p>
                        <p className="font-medium">{car.engine_info || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div
                        className="p-2 rounded-lg mr-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(4, 120, 87, 0.2), rgba(4, 120, 87, 0.1))',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Gauge className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fuel Economy</p>
                        <p className="font-medium">{car.mpg || 'N/A'} MPG</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div
                        className="p-2 rounded-lg mr-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.1))',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        <Settings className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Transmission</p>
                        <p className="font-medium">{car.transmission || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div
                        className="p-2 rounded-lg mr-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(202, 138, 4, 0.2), rgba(202, 138, 4, 0.1))',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        <Shield className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Body Type</p>
                        <p className="font-medium">{car.body_type || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Buttons: AI Analysis + Chat */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-800/30">
                    <button
                      onClick={toggleAnalysis}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${
                        showAnalysis
                          ? 'bg-black text-white'
                          : 'bg-gray-800 text-white hover:bg-black'
                      }`}
                    >
                      {showAnalysis ? 'Hide AI Analysis' : 'Generate AI Review'}
                    </button>

                    {/* The "Genie" chat button */}
                    <div className="relative">
                      {/* (Optional) Robot Head if chat is closed */}
                      {chatState === 'closed' && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 robot-head">
                          <div className="robot-face bg-gradient-to-b from-slate-700 to-slate-900 w-full h-full rounded-lg relative overflow-hidden border-2 border-slate-600 shadow-lg">
                            {/* Eyes */}
                            <div className="absolute top-2 left-0 right-0 flex justify-center gap-2">
                              <div className="eye w-1.5 h-1.5 rounded-full bg-cyan-400 animate-robot-eye"></div>
                              <div className="eye w-1.5 h-1.5 rounded-full bg-cyan-400 animate-robot-eye-alt"></div>
                            </div>
                            {/* Mouth (animates on hover) */}
                            <div
                              className={`mouth absolute bottom-2 left-0 right-0 mx-auto w-4 h-0.5 bg-cyan-400 rounded-full ${
                                isButtonHovered ? 'animate-robot-talk' : ''
                              }`}
                            ></div>
                          </div>
                          {/* Antenna */}
                          <div className="antenna absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-slate-600">
                            <div className="antenna-light w-1 h-1 rounded-full bg-cyan-400 absolute -top-1 left-1/2 -translate-x-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      )}

                      <button
                        ref={chatButtonRef}
                        onClick={chatState === 'closed' ? openChat : closeChat}
                        onMouseEnter={() => setIsButtonHovered(true)}
                        onMouseLeave={() => setIsButtonHovered(false)}
                        className={`relative px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${
                          chatState !== 'closed'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gradient-to-r from-gray-800 to-gray-900 text-blue-400 border border-blue-900/30 hover:border-blue-500/50 hover:from-gray-800 hover:to-gray-800'
                        } overflow-hidden z-30`}
                      >
                        {/* Subtle circuit pattern */}
                        <div className="circuit-pattern absolute inset-0 rounded-lg overflow-hidden opacity-20">
                          <div className="h-line absolute top-1/3 left-0 right-0 h-[1px] bg-cyan-400"></div>
                          <div className="h-line absolute top-2/3 left-0 right-0 h-[1px] bg-cyan-400"></div>
                          <div className="v-line absolute left-1/3 top-0 bottom-0 w-[1px] bg-cyan-400"></div>
                          <div className="v-line absolute left-2/3 top-0 bottom-0 w-[1px] bg-cyan-400"></div>
                        </div>

                        {/* Icon glow */}
                        <div className="relative mr-2 w-5 h-5 flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-purple-500 rounded-full opacity-80 animate-pulse-slow"></div>
                          <div className="absolute inset-0">
                            <div className="absolute inset-1 border border-white/20 rounded-full"></div>
                          </div>
                          <MessageCircle className="w-3 h-3 text-white relative z-10" />
                        </div>

                        <span>{chatState !== 'closed' ? 'Hide Chat' : 'Ask About This Car'}</span>

                        {/* Energy pulse on hover if chat is closed */}
                        {chatState === 'closed' && isButtonHovered && (
                          <div className="energy-pulse absolute inset-0 rounded-lg">
                            <div className="pulse absolute inset-0 rounded-lg border border-cyan-500 animate-energy-pulse"></div>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Car image placeholder */}
                <div>{getCarImage()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis panel */}
        {showAnalysis && (
          <div className="mb-6">
            <ReviewAnalysis carId={car.id} usingFallback={carStatus.usingFallback} />
          </div>
        )}

        {/* Reviews & Summary (only if AI Analysis is hidden) */}
        {!showAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reviews */}
            <div className="lg:col-span-2">
              <div className="card-with-header">
                <div className="header flex justify-between items-center">
                  <h2 className="text-xl font-bold">Reviews</h2>
                  <button
                    onClick={fetchReviews}
                    disabled={refreshingReviews}
                    className="flex items-center text-gray-300 hover:text-white text-sm bg-gray-700 px-3 py-1 rounded-lg"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-1 ${refreshingReviews ? 'animate-spin' : ''}`}
                    />
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
                        <div 
                          key={review.id} 
                          className="dynamic-card p-4 hover:bg-gray-800/30"
                        >
                          <div className="flex justify-between">
                            <h3 className="font-bold text-gray-900">
                              {review.review_title || review.title || 'Review'}
                            </h3>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            By {review.author} •{' '}
                            {new Date(review.review_date || review.date).toLocaleDateString()}
                          </p>
                          {(review.is_ai_generated || review.is_mock) && (
                            <div className="flex items-center text-xs text-blue-600 mb-2">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              AI Generated
                            </div>
                          )}
                          <p className="mt-2 text-gray-700 review-text">
                            {review.review_text || review.text}
                          </p>
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
                <div className="card-with-header">
                  <div className="header">
                    <h2 className="text-xl font-bold">Review Summary</h2>
                  </div>
                  <div className="content">
                    <div className="flex items-center mb-5">
                      <div
                        className="p-3 rounded-full mr-4"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <Star className="w-6 h-6 text-blue-600 fill-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-3xl font-bold text-gray-900">{summary.avgRating}</span>
                          <div className="flex ml-3 mt-1">
                            {renderStars(parseFloat(summary.avgRating))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Based on {summary.totalReviews} reviews
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium flex items-center text-green-700">
                            <ArrowUp className="w-4 h-4 mr-1" />
                            Positive
                          </span>
                          <span className="font-medium text-green-700">
                            {summary.positivePercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full"
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
                          <span className="font-medium text-red-700">
                            {summary.negativePercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-red-500 to-red-400 h-2.5 rounded-full"
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

      {/* Magical 'Genie' chat container */}
      {renderChatContainer()}

      {/* --- Global / Keyframe Styles --- */}
      <style jsx global>{`
        /* Subtle gradient border on car detail card */
        @keyframes borderGradientAnimation {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        /* Robot head float/eyes/mouth animations */
        @keyframes hover-float {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-4px) translateX(-50%); }
        }
        .robot-head {
          animation: hover-float 1.5s ease-in-out infinite;
        }

        @keyframes robot-eye {
          0%, 90%, 100% { opacity: 1; transform: scale(1); }
          95% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes robot-eye-alt {
          0%, 85%, 100% { opacity: 1; transform: scale(1); }
          90% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-robot-eye {
          animation: robot-eye 4s infinite;
        }
        .animate-robot-eye-alt {
          animation: robot-eye-alt 4s infinite;
        }
        @keyframes robot-talk {
          0%, 100% { height: 1px; width: 4px; }
          25% { height: 2px; width: 5px; }
          50% { height: 1px; width: 4px; }
          75% { height: 2px; width: 5px; }
        }
        .animate-robot-talk {
          animation: robot-talk 0.8s infinite;
        }

        /* Chat container with clip-path expansions 
           "genie-appear" and "genie-disappear" 
        */
        .chat-genie-container {
          --clip-duration: 500ms;
          animation-fill-mode: forwards;
          display: flex;
        }
        .chat-genie-container.opening,
        .chat-genie-container.closing {
          pointer-events: none; /* Avoid accidental clicks during anim */
        }
        .chat-genie-container.opening {
          animation: genie-appear var(--clip-duration) ease-out;
        }
        .chat-genie-container.open {
          /* Final expanded state: big circle */
          clip-path: circle(150% at var(--origin-x) var(--origin-y));
        }
        .chat-genie-container.closing {
          animation: genie-disappear 500ms ease-in forwards;
        }

        @keyframes genie-appear {
          0% {
            clip-path: circle(0% at var(--origin-x) var(--origin-y));
            opacity: 0.1;
          }
          70% {
            opacity: 1;
          }
          100% {
            clip-path: circle(150% at var(--origin-x) var(--origin-y));
            opacity: 1;
          }
        }

        @keyframes genie-disappear {
          0% {
            clip-path: circle(150% at var(--origin-x) var(--origin-y));
            opacity: 1;
          }
          100% {
            clip-path: circle(0% at var(--origin-x) var(--origin-y));
            opacity: 0;
          }
        }

        /* swirling conic-gradient background */
        .swirl-bg {
          background: conic-gradient(
            from 0deg at 50% 50%,
            rgba(216, 180, 254, 0.15),
            rgba(125, 211, 252, 0.15),
            rgba(232, 121, 249, 0.15),
            rgba(216, 180, 254, 0.15)
          );
          animation: swirl-rotate 5s linear infinite;
        }
        @keyframes swirl-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Sparkles: radial gradients that fade in/out for twinkling */
        .sparkles {
          background-image:
            radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
            radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 5px 5px, 3px 3px, 1px 1px;
          background-position: 0 0, 20px 10px, 10px 30px;
          opacity: 0.15;
          animation: sparkle-fade 2s ease-in-out infinite alternate;
        }
        @keyframes sparkle-fade {
          0% { opacity: 0.15; }
          100% { opacity: 0.4; }
        }

        /* The chat-content container – slightly blurred in final state. */
        .chat-content {
          clip-path: none; /* The parent container handles clipping. */
          backdrop-filter: blur(10px);
        }

        /* Simple “pulse” for the glowing circles */
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes energy-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        .energy-pulse .pulse {
          animation: energy-pulse 1.6s infinite;
        }
      `}</style>
    </div>
  );
}
