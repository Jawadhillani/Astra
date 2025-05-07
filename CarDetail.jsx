'use client';
import {
  useState,
  useEffect,
  useRef
} from 'react';
import { createClient } from '@supabase/supabase-js'; // Add Supabase import
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

// Import our custom car visualization components
import CarBadgeIcon from './CarBadgeIcon';
import CarIllustration from './CarIllustration';

// Initialize the Supabase client once (make sure env vars are correctly set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CarDetail({ car, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [refreshingReviews, setRefreshingReviews] = useState(false);
  const [expanded3DView, setExpanded3DView] = useState(false);

  // --- Chat state approach ---
  // "closed" | "opening" | "open" | "closing"
  const [chatState, setChatState] = useState("closed");

  // We'll store the button's center & dimensions to animate from there
  const [buttonRect, setButtonRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  // Car validity & DB status
  const [carStatus, setCarStatus] = useState({
    exists: true,
    message: null,
    usingFallback: false,
    dbConnected: true // Assume true initially, check below
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

  // -- On mount, check if car is valid and fetch data using Supabase --
  useEffect(() => {
    console.log("CarDetail mounted with car:", car);
    if (car && car.id) {
      // Start async data fetching
      fetchCarDetailsAndReviews();
    } else {
      setLoading(false);
      setCarStatus({
        exists: false,
        message: "Invalid car data provided (No car ID).",
        usingFallback: false,
        dbConnected: true
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car]); // Re-run if car object changes (unlikely but good practice)

  // Combined fetch function using Supabase
  async function fetchCarDetailsAndReviews() {
    setLoading(true);
    setCarStatus({ ...carStatus, dbConnected: true, message: null }); // Assume connected at start of fetch

    try {
      // First check products status
      const response = await fetch('/api/status');
      const dbData = await response.json();
      console.log("Products status:", dbData);

      if (!dbData.status === 'successful') {
        setCarStatus({
          exists: false,
          message: `Car with ID ${car.id} not found. Products may be using fallback data.`
        });
        return;
      }

      // Then check if car exists
      const carResponse = await fetch(`/api/cars/${car.id}`);
      if (!carResponse.ok) {
        setCarStatus({
          exists: false,
          message: `Car with ID ${car.id} not found in the products.`
        });
      } else {
        setCarStatus({ exists: true });
      }

      // 3) Fetch reviews for this car using Supabase
      await fetchReviewsSupabase(car.id); // Call the new Supabase fetch reviews function

    } catch (err) {
      console.error('Unexpected error during data fetch:', err);
      setCarStatus({
        exists: false,
        message: `An unexpected error occurred: ${err.message}`,
        usingFallback: false,
        dbConnected: false
      });
      setReviews([]); // Clear reviews on error
    } finally {
      setLoading(false);
      setRefreshingReviews(false); // Ensure refreshing state is reset
    }
  }


  // -- Fetch car reviews using Supabase client --
  async function fetchReviewsSupabase(carId) {
      setRefreshingReviews(true);
      try {
          const { data: reviewsData, error: reviewsError } = await supabase
              .from('reviews')
              .select('*')
              .eq('car_id', carId); // Filter reviews by car_id

          if (reviewsError) {
              console.error(`Supabase fetch reviews error for car ID ${carId}:`, reviewsError);
              // Set reviews to empty and potentially show an error related to fetching reviews
              setReviews([]);
              // Optionally update carStatus message more specifically for review fetching error
              // setCarStatus(prev => ({ ...prev, message: prev.message + " Failed to load reviews." }));
          } else {
              console.log("Fetched reviews from Supabase:", reviewsData);
              setReviews(reviewsData || []);
              if (reviewsData?.length >= 3) {
                  generateSummary(reviewsData);
              } else {
                  setSummary(null); // Clear summary if not enough reviews
              }
          }
      } catch (err) {
          console.error('Unexpected error fetching reviews from Supabase:', err);
          setReviews([]);
      } finally {
          setRefreshingReviews(false);
      }
  }


  // -- Removed the old fetchReviews function that used the /api/ endpoint --
  // async function fetchReviews() { ... }


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
    // Note: Generating the AI review is likely still a backend API call.
    // The ReviewAnalysis component (not provided) probably handles that fetch.
    // If errors occur ONLY when clicking "Generate AI Review", the issue is likely in the backend /api/reviews/generate endpoint.
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
    if (rating === undefined || rating === null) return null; // Handle undefined/null ratings
    const roundedRating = Math.round(rating); // Round to the nearest whole star
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < roundedRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  }

  // -- Products status info (fallback/connection issues) --
  function renderProductStatus() {
    if (!carStatus.exists) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4 flex items-center text-sm">
          <Database className="w-4 h-4 mr-2" />
          Using fallback products with sample data
        </div>
      );
    }
    return null;
  }


  // -- The "Genie" chat container with swirling conic-gradient & sparkles --
  function renderChatContainer() {
    if (chatState === "closed") return null;

    // For the clip-path circle origin
    const style = {
      "--origin-x": `${buttonRect.x}px`,
      "--origin-y": `${buttonRect.y}px`
    };

    // Assuming EnhancedNeuralInterface is the same as ChatInterface from uploaded files
    const EnhancedNeuralInterface = require('./ChatInterface').default;


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
              {/* Neural Interface */}
              {/* Pass the Supabase client or ensure ChatInterface initializes its own */}
              <EnhancedNeuralInterface carId={car.id} supabase={supabase} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -- Interactive car view toggle --
  function toggleExpandedView() {
    setExpanded3DView(!expanded3DView);
  }

  // -- Render the car visualization with our new components --
  function renderCarVisualization() {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="transition-all duration-500 scale-125">
          <CarIllustration
            bodyType={car.body_type || 'sedan'}
            manufacturer={car.manufacturer}
            model={car.model}
            year={car.year}
            size="xl"
            className="animate-float"
          />
        </div>
      </div>
    );
  }

  // -- If car is invalid or DB fails, show an error card --
  // Use the message in carStatus to determine what went wrong
  if (!carStatus.exists) {
    return (
      <div className="text-white"> {/* Ensure text is visible */}
        <div className="mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to listing
          </button>
        </div>

        {renderProductStatus()} {/* This will now show the specific message */}

        <div
          style={{
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Car</h2> {/* More generic title */}
          <p className="mb-4 text-red-300"> {/* text-red-600 was too dark */}
            {carStatus.message || "An unexpected error occurred while loading car details."}
          </p>
          {car?.id && <p className="text-sm mt-2 text-gray-300">Attempted Car ID: {car.id}</p>} {/* Show ID if available */}
          <button
            onClick={fetchCarDetailsAndReviews} // Retry the combined fetch
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry Loading Car
          </button>
        </div>
      </div>
    );
  }


  // -- Otherwise, render the car details & reviews as normal --
  return (
    <div className="relative text-white"> {/* Ensure text is visible */}
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

        {renderProductStatus()} {/* This will now show the specific message */}

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

                {/* Car image placeholder - REPLACED WITH OUR CUSTOM CAR ILLUSTRATION */}
                <div className="h-48 relative overflow-hidden rounded-lg">
                  {renderCarVisualization()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis panel */}
        {showAnalysis && (
          <div className="mb-6">
             {/* Assuming ReviewAnalysis component handles its own data fetching or generation */}
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
                    onClick={() => fetchReviewsSupabase(car.id)} // Call the Supabase fetch function
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
                      <p className="text-gray-400">Loading reviews...</p> {/* text-gray-600 was too dark */}
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                         <div
                          key={review.id}
                          className="dynamic-card p-4 hover:bg-gray-800/30 border border-gray-800 rounded-lg" // Added border/rounded for card appearance
                        >
                          <div className="flex justify-between items-start"> {/* Aligned items-start */}
                            <h3 className="font-bold text-white text-lg leading-tight">{review.review_title || review.title || 'Review'}</h3> {/* text-gray-900 too dark, added text-lg/leading */}
                            <div className="flex-shrink-0 flex ml-4">{renderStars(review.rating)}</div> {/* Added flex-shrink and margin */}
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            By {review.author} •{' '}
                            {new Date(review.review_date || review.date).toLocaleDateString()}
                          </p>
                          {(review.is_ai_generated || review.is_mock) && (
                            <div className="flex items-center text-xs text-blue-400 mb-2"> {/* text-blue-600 too dark */}
                              <AlertCircle className="w-3 h-3 mr-1" />
                              AI Generated
                            </div>
                          )}
                          <p className="mt-2 text-gray-300 review-text"> {/* text-gray-700 too dark */}
                            {review.review_text || review.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-black/40 border border-gray-800 p-8 rounded-lg text-center"> {/* Adjusted background/border */}
                      <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" /> {/* text-gray-300 too light */}
                      <p className="text-gray-300 mb-2">No reviews yet for this vehicle.</p> {/* text-gray-600 too dark */}
                      <p className="text-sm text-gray-400">Be the first to generate an AI review!</p>
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
                        <Star className="w-6 h-6 text-blue-500 fill-blue-500" /> {/* text-blue-600 too dark */}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-3xl font-bold text-white">{summary.avgRating}</span> {/* text-gray-900 too dark */}
                          <div className="flex ml-3 mt-1">
                            {renderStars(parseFloat(summary.avgRating))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400"> {/* text-gray-600 too dark */}
                          Based on {summary.totalReviews} reviews
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium flex items-center text-green-500"> {/* text-green-700 too dark */}
                            <ArrowUp className="w-4 h-4 mr-1" />
                            Positive
                          </span>
                          <span className="font-medium text-green-500"> {/* text-green-700 too dark */}
                            {summary.positivePercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5"> {/* bg-gray-200 too light */}
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full"
                            style={{ width: `${summary.positivePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium flex items-center text-red-500"> {/* text-red-700 too dark */}
                            <ArrowDown className="w-4 h-4 mr-1" />
                            Negative
                          </span>
                          <span className="font-medium text-red-500"> {/* text-red-700 too dark */}
                            {summary.negativePercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5"> {/* bg-gray-200 too light */}
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
         /* Define CSS variables for dark theme colors if they aren't already */
        :root {
           --dark-card: #1f2937; /* Example gray-800 equivalent */
           --accent-blue: #3b82f6; /* Example blue-500 equivalent */
           --accent-violet: #8b5cf6; /* Example violet-500 equivalent */
           --accent-purple: #a78bfa; /* Example purple-400 equivalent */
        }

        /* Subtle gradient border on car detail card */
        @keyframes borderGradientAnimation {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        /* Animation for the car illustration */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
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
          0%, 100% { height: 0.5px; width: 16px; } /* Adjusted size based on w-4 h-0.5 */
          25% { height: 1px; width: 20px; } /* Adjusted size */
          50% { height: 0.5px; width: 16px; } /* Adjusted size */
          75% { height: 1px; width: 20px; } /* Adjusted size */
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

        /* Simple "pulse" for the glowing circles */
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

         /* Review card styles */
        .dynamic-card {
            /* Remove background/border from here as they are now in the element style */
            transition: background-color 0.2s ease-in-out;
        }

      `}</style>
    </div>
  );
}