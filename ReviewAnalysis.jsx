'use client';
import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';

const ReviewAnalysis = ({ carId, usingFallback = false }) => {
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reviewGenerated, setReviewGenerated] = useState(false);
  const [generatedReview, setGeneratedReview] = useState(null);
  const [apiQuotaExceeded, setApiQuotaExceeded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
          review_text: responseText.substring(0, 500) + "..."
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

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">AI Review Generator</h2>
      
      {usingFallback && (
        <div className="bg-yellow-100 text-yellow-800 rounded p-3 mb-4 flex items-center text-sm">
          <Database className="w-4 h-4 mr-2" />
          Using fallback database - some features may be limited
        </div>
      )}

      {loading ? (
        <div className="text-center p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading car data...</p>
        </div>
      ) : error ? (
        <div>
          <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
            <p className="font-medium">Error</p>
            <p className="mt-1">{error}</p>
            {usingFallback && (
              <p className="mt-2 text-sm">
                Note: You're currently using the fallback database which contains limited sample data.
              </p>
            )}
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      ) : carData ? (
        <div>
          <div className="mb-6">
            <p className="mb-1 font-medium">Generating review for:</p>
            <p className="text-lg font-bold">{carData.year} {carData.manufacturer} {carData.model}</p>
            <p className="text-sm text-gray-600">Engine: {carData.engine_info || 'N/A'}</p>
            <p className="text-sm text-gray-600">ID: {carData.id}</p>
          </div>

          {apiQuotaExceeded && (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4">
              <p className="font-medium">Note: OpenAI API quota exceeded</p>
              <p className="text-sm mt-1">
                System is generating a simulated review as the OpenAI API quota has been exceeded.
                The review will still be based on the selected car's specifications.
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleGenerateReview}
              disabled={generating}
              className={`px-4 py-2 ${generating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded flex-grow flex justify-center items-center`}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                'Generate AI Review'
              )}
            </button>
          </div>
          
          {reviewGenerated && (
            <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
              <p className="font-medium">Review successfully generated!</p>
              {generatedReview && (
                <div className="mt-3 p-3 bg-white rounded text-gray-800">
                  <p className="font-medium">{generatedReview.review_title}</p>
                  <p className="text-sm mt-1">
                    By: {generatedReview.author || "AI Assistant"}
                  </p>
                  <p className="text-sm mt-1">
                    Rating: {generatedReview.rating}/5
                  </p>
                  <p className="text-sm mt-1">
                    {generatedReview.review_text?.substring(0, 200)}...
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-600">
            <p>This will create an AI-generated review for this vehicle based on its specifications.</p>
            <p>The review will be added to the reviews section.</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          <p>Unable to load car data. Please try again later.</p>
          {usingFallback && (
            <p className="mt-2 text-sm">
              Note: You're currently using the fallback database which contains limited sample data.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewAnalysis;