'use client';
import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Database, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Star, Zap, Award, Car, MessageSquare } from 'lucide-react';

const ReviewAnalysis = ({ carId, usingFallback = false }) => {
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reviewGenerated, setReviewGenerated] = useState(false);
  const [generatedReview, setGeneratedReview] = useState(null);
  const [apiQuotaExceeded, setApiQuotaExceeded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showFullReview, setShowFullReview] = useState(false);
  const [animatePros, setAnimatePros] = useState(false);
  const [animateCons, setAnimateCons] = useState(false);

  // Initial load effect
  useEffect(() => {
    console.log("ReviewAnalysis mounted with carId:", carId, "usingFallback:", usingFallback);
    if (carId) {
      fetchBasicCarData();
    } else {
      setLoading(false);
      setError("No car ID provided");
    }
  }, [carId, usingFallback, retryCount]);

  // Animation effect for pros and cons after review is generated
  useEffect(() => {
    if (reviewGenerated) {
      setTimeout(() => setAnimatePros(true), 300);
      setTimeout(() => setAnimateCons(true), 600);
    }
  }, [reviewGenerated]);

  /**
   * Fetch basic car data from the backend.
   */
  const fetchBasicCarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // If we're using the fallback database, we need to be careful about fetching
      let url = `/api/cars/${carId}`;
      console.log(`Fetching car data from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // If we get a 404 or 500, we might be in fallback mode
        if (response.status === 404 || response.status === 500) {
          if (usingFallback) {
            // We're already in fallback mode, so this car just doesn't exist
            throw new Error(`Car with ID ${carId} not found in fallback database`);
          } else {
            // Try using a direct API to check database status
            const dbStatusResponse = await fetch('/api/test-db');
            const dbStatusData = await dbStatusResponse.json();
            
            if (dbStatusData.message && dbStatusData.message.includes("fallback")) {
              throw new Error(`Database is in fallback mode. This car may not exist in the fallback database.`);
            } else {
              throw new Error(`Failed to fetch car: ${response.status}`);
            }
          }
        } else {
          throw new Error(`Failed to fetch car: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log("Car data:", data);
      setCarData(data);
      
    } catch (err) {
      console.error('Error fetching car:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate an AI-based review for the current car.
   */
  const handleGenerateReview = async () => {
    if (!carData) {
      setError("No car data available");
      return;
    }

    setGenerating(true);
    setError(null);
    setReviewGenerated(false);
    setGeneratedReview(null);
    setApiQuotaExceeded(false);
    setShowFullReview(false);
    setAnimatePros(false);
    setAnimateCons(false);

    try {
      console.log(`Generating AI review for carId=${carId}`);
      
      const response = await fetch('/api/reviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car_id: carId }),
      });
      
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      if (!response.ok) {
        throw new Error(`Generate AI Review error: ${responseText}`);
      }
      
      try {
        const reviewData = JSON.parse(responseText);
        
        // Add default empty arrays for pros and cons if they don't exist
        if (!reviewData.pros) reviewData.pros = [];
        if (!reviewData.cons) reviewData.cons = [];
        
        setGeneratedReview(reviewData);
        setReviewGenerated(true);
        
        // Check if response contains information about API quota
        if (reviewData.is_mock || 
            responseText.toLowerCase().includes("quota") || 
            responseText.toLowerCase().includes("mock") ||
            (reviewData.author && reviewData.author === "AI Assistant")) {
          setApiQuotaExceeded(true);
        }
        
        console.log('Successfully generated review:', reviewData);
      } catch (parseError) {
        console.error("Error parsing review data:", parseError);
        setGeneratedReview({
          review_title: "AI Generated Review",
          review_text: responseText.substring(0, 500) + "...",
          pros: [],
          cons: []
        });
        setReviewGenerated(true);
      }
    } catch (err) {
      console.error('Error generating AI Review:', err);
      setError(err.message);
      
      // Check if error is related to API quota
      if (err.message && err.message.toLowerCase().includes("quota")) {
        setApiQuotaExceeded(true);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const toggleFullReview = () => {
    setShowFullReview(!showFullReview);
  };

  // Helper to render rating stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <div className="flex items-center">
        {Array(5).fill(0).map((_, i) => (
          <Star 
            key={i} 
            className={`w-5 h-5 ${i < fullStars ? 'text-yellow-500 fill-yellow-500' : 
              (i === fullStars && hasHalfStar ? 'text-yellow-500 fill-yellow-500 opacity-60' : 'text-gray-700')}`} 
          />
        ))}
        <span className="ml-2 text-xl font-bold gradient-text">{rating}</span>
      </div>
    );
  };

  // Get a gradient based on rating
  const getRatingGradient = (rating) => {
    if (rating >= 4.5) return "from-violet-600 to-purple-600";
    if (rating >= 4.0) return "from-blue-600 to-violet-600";
    if (rating >= 3.5) return "from-blue-600 to-blue-400";
    if (rating >= 3.0) return "from-green-600 to-blue-600";
    if (rating >= 2.0) return "from-yellow-600 to-orange-600";
    return "from-red-600 to-orange-600";
  };

  return (
    <div className="card-with-header mb-6 page-transition">
      <div className="header bg-gradient-to-r from-violet-900 to-indigo-900">
        <h2 className="text-xl font-bold flex items-center">
          <Zap className="w-5 h-5 mr-2 animated-icon" /> AI Review Generator
        </h2>
      </div>
      
      <div className="content">
        {usingFallback && (
          <div className="alert-warning p-4 rounded-lg mb-4 flex items-center text-sm">
            <Database className="w-4 h-4 mr-2" />
            Using fallback database - some features may be limited
          </div>
        )}

        {loading ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-t-4 border-violet-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading car data...</p>
          </div>
        ) : error ? (
          <div>
            <div className="alert-error p-4 rounded-lg mb-4">
              <p className="font-medium">Error</p>
              <p className="mt-1">{error}</p>
              {usingFallback && (
                <p className="mt-2 text-sm">
                  Note: You're currently using the fallback products which contains limited sample data.
                </p>
              )}
            </div>
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        ) : carData ? (
          <div>
            <div className="flex flex-wrap md:flex-nowrap gap-6 mb-6">
              <div className="w-full md:w-2/3">
                <p className="mb-1 text-gray-400">Generating review for:</p>
                <p className="text-2xl font-bold gradient-text">{carData.year} {carData.manufacturer} {carData.model}</p>
                <div className="flex flex-wrap gap-6 mt-4">
                  {carData.engine_info && (
                    <div className="flex items-start">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-900 to-blue-700 mr-3">
                        <Car className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Engine</p>
                        <p className="text-sm">{carData.engine_info}</p>
                      </div>
                    </div>
                  )}
                  {carData.mpg && (
                    <div className="flex items-start">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-violet-900 to-violet-700 mr-3">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Fuel Economy</p>
                        <p className="text-sm">{carData.mpg} MPG</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/3 flex items-center justify-center">
                <div className="bg-gradient-to-r from-violet-900 to-blue-900 p-4 rounded-lg text-center w-full">
                  <Car className="w-12 h-12 mx-auto text-white mb-2 animated-icon" />
                  <p className="text-xs text-gray-300">ID: {carData.id}</p>
                </div>
              </div>
            </div>

            {apiQuotaExceeded && (
              <div className="alert-warning p-4 rounded-lg mb-4">
                <p className="font-medium">Note: OpenAI API quota exceeded</p>
                <p className="text-sm mt-1">
                  System is generating a simulated review based on the selected car's specifications.
                </p>
              </div>
            )}

            <div className="flex gap-2 mb-6">
              <button
                onClick={handleGenerateReview}
                disabled={generating}
                className={`${generating ? 'bg-gray-600' : 'btn-gradient'} px-6 py-3 rounded-lg font-medium flex-grow flex justify-center items-center transition-all`}
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Generating AI Review...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate AI Review
                  </>
                )}
              </button>
            </div>
            
            {reviewGenerated && generatedReview && (
              <div className="dynamic-card overflow-hidden transition-all duration-500 ease-in-out">
                {/* Review Header */}
                <div className={`p-4 bg-gradient-to-r ${getRatingGradient(generatedReview.rating)}`}>
                  <h3 className="font-bold text-xl text-white">{generatedReview.review_title}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-200 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" /> 
                      By: {generatedReview.author || "AI Assistant"}
                    </p>
                    <div className="flex items-center">
                      {renderStars(generatedReview.rating)}
                    </div>
                  </div>
                </div>
                
                {/* Review Body */}
                <div className="p-6">
                  <div className="prose prose-invert max-w-none">
                    {showFullReview ? (
                      <div>
                        {generatedReview.review_text.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-300">{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-300">
                        {generatedReview.review_text?.substring(0, 250)}
                        {generatedReview.review_text?.length > 250 ? '...' : ''}
                      </p>
                    )}
                    
                    {generatedReview.review_text?.length > 250 && (
                      <button 
                        onClick={toggleFullReview} 
                        className="mt-2 text-violet-400 hover:text-violet-300 flex items-center font-medium"
                      >
                        {showFullReview 
                          ? <>Show less <ChevronUp className="w-4 h-4 ml-1" /></> 
                          : <>Read full review <ChevronDown className="w-4 h-4 ml-1" /></>}
                      </button>
                    )}
                  </div>
                  
                  {/* Pros and Cons */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pros - with animated gradient border */}
                    <div 
                      className={`relative rounded-lg transform transition-all duration-500 ease-in-out ${animatePros ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                      style={{
                        background: `
                          linear-gradient(var(--dark-surface), var(--dark-surface)) padding-box,
                          linear-gradient(to right, rgba(139, 92, 246, 0.7), rgba(76, 29, 149, 0.1)) border-box
                        `,
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box',
                        border: '1px solid transparent',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Add a subtle animated glow effect */}
                      <div className="absolute inset-0 bg-violet-900/10 rounded-lg filter blur-md opacity-30 animate-pulse"></div>
                      
                      <div className="p-5 relative z-10">
                        <h4 className="font-bold text-violet-400 flex items-center mb-4">
                          <ThumbsUp className="w-5 h-5 mr-2" />
                          Pros
                        </h4>
                        {generatedReview.pros && generatedReview.pros.length > 0 ? (
                          <ul className="space-y-2">
                            {generatedReview.pros.map((pro, index) => (
                              <li key={index} className="flex items-start text-gray-300">
                                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white text-xs mr-2 mt-0.5 flex-shrink-0">+</div>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm italic">No specific pros mentioned</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Cons - with animated gradient border */}
                    <div 
                      className={`relative rounded-lg transform transition-all duration-500 ease-in-out ${animateCons ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                      style={{
                        background: `
                          linear-gradient(var(--dark-surface), var(--dark-surface)) padding-box,
                          linear-gradient(to right, rgba(239, 68, 68, 0.7), rgba(127, 29, 29, 0.1)) border-box
                        `,
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box',
                        border: '1px solid transparent',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Add a subtle animated glow effect */}
                      <div className="absolute inset-0 bg-red-900/10 rounded-lg filter blur-md opacity-30 animate-pulse"></div>
                      
                      <div className="p-5 relative z-10">
                        <h4 className="font-bold text-red-400 flex items-center mb-4">
                          <ThumbsDown className="w-5 h-5 mr-2" />
                          Cons
                        </h4>
                        {generatedReview.cons && generatedReview.cons.length > 0 ? (
                          <ul className="space-y-2">
                            {generatedReview.cons.map((con, index) => (
                              <li key={index} className="flex items-start text-gray-300">
                                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white text-xs mr-2 mt-0.5 flex-shrink-0">-</div>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm italic">No specific cons mentioned</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-violet-900/20 px-4 py-3 bg-gradient-to-r from-gray-900 to-dark-card">
                  <p className="text-gray-400 text-sm">
                    This AI-generated review has been added to the reviews section.
                  </p>
                </div>
              </div>
            )}
            
            {!reviewGenerated && (
              <div className="mt-8 border-t border-violet-900/20 pt-4">
                <p className="text-sm text-gray-400">
                  The AI review generator creates a balanced assessment based on this vehicle's specifications.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Reviews include ratings, detailed analysis, and specific pros and cons.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="alert-warning p-4 rounded-lg">
            <p>Unable to load car data. Please try again later.</p>
            {usingFallback && (
              <p className="mt-2 text-sm">
                Note: You're currently using the fallback products which contains limited sample data.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewAnalysis;