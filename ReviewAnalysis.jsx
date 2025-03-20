'use client';
import { useState, useEffect } from 'react';

const ReviewAnalysis = ({ carId }) => {
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reviewGenerated, setReviewGenerated] = useState(false);
  const [generatedReview, setGeneratedReview] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  // Initial load effect
  useEffect(() => {
    console.log("ReviewAnalysis mounted with carId:", carId);
    if (carId) {
      fetchBasicCarData();
    } else {
      setLoading(false);
      setError("No car ID provided");
    }
  }, [carId]);

  /**
   * Fetch basic car data from the backend.
   */
  const fetchBasicCarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/cars/${carId}`;
      console.log(`Fetching car data from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch car: ${response.status}`);
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
   * Test the API endpoint directly
   */
  const testDirectAPI = async () => {
    try {
      console.log("Testing direct API call...");
      const response = await fetch("/api/test/generate-review/1");
      const data = await response.json();
      console.log("Direct API response:", data);
      alert("Direct API test successful! Check console for details.");
    } catch (e) {
      console.error("Direct API test failed:", e);
      alert("Direct API test failed: " + e.message);
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
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">AI Review Generator</h2>

      {loading ? (
        <div className="text-center p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading car data...</p>
        </div>
      ) : error ? (
        <div>
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchBasicCarData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : carData ? (
        <div>
          <div className="mb-6">
            <p className="mb-1 font-medium">Generating review for:</p>
            <p className="text-lg font-bold">{carData.year} {carData.manufacturer} {carData.model}</p>
            <p className="text-sm text-gray-600">Engine: {carData.engine_info}</p>
          </div>

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
            
            <button
              onClick={testDirectAPI}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test API
            </button>
          </div>
          
          {reviewGenerated && (
            <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
              <p className="font-medium">Review successfully generated!</p>
              {generatedReview && (
                <div className="mt-3 p-3 bg-white rounded text-gray-800">
                  <p className="font-medium">{generatedReview.review_title}</p>
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
        </div>
      )}
    </div>
  );
};

export default ReviewAnalysis;