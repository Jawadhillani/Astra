'use client'
import { useState, useEffect } from 'react';
import { Star, ChevronLeft, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ReviewAnalysis from './ReviewAnalysis';

export default function CarDetail({ car, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [refreshingReviews, setRefreshingReviews] = useState(false);

  // Debug log the car object when component mounts
  useEffect(() => {
    console.log("CarDetail mounted with car:", car);
    if (car && car.id) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [car]);

  async function fetchReviews() {
    setRefreshingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('car_id', car.id)
        .order('review_date', { ascending: false });
      
      if (error) throw error;
      console.log("Fetched reviews:", data);
      setReviews(data || []);
      if (data?.length >= 3) generateSummary(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
      setRefreshingReviews(false);
    }
  }

  function generateSummary(reviewData) {
    // Simple summary generation logic
    const avgRating = reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length;
    const positiveCount = reviewData.filter(r => r.rating >= 4).length;
    const negativeCount = reviewData.filter(r => r.rating <= 2).length;
    
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
  };

  // Generate stars display for ratings
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div>
      <div className="mb-4">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to listing
        </button>
      </div>
      
      {/* Car Info Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {car.year} {car.manufacturer} {car.model}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-gray-700"><strong>Body Type:</strong> {car.body_type}</p>
            <p className="text-gray-700"><strong>Engine:</strong> {car.engine_info}</p>
            <p className="text-gray-700"><strong>Transmission:</strong> {car.transmission}</p>
          </div>
          <div>
            <p className="text-gray-700"><strong>Fuel Type:</strong> {car.fuel_type}</p>
            <p className="text-gray-700"><strong>MPG:</strong> {car.mpg}</p>
          </div>
        </div>

        {/* AI Review Button */}
        <div className="mt-6">
          <button
            onClick={toggleAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAnalysis ? "Hide AI Analysis" : "Generate AI Review"}
          </button>
        </div>
      </div>
      
      {/* Conditionally render the ReviewAnalysis component */}
      {showAnalysis && (
        <div>
          <ReviewAnalysis carId={car.id} />
          <div className="mb-6 text-center">
            <button
              onClick={() => {
                setShowAnalysis(false);
                fetchReviews();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center mx-auto"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to reviews
            </button>
          </div>
        </div>
      )}
      
      {/* Reviews & Summary Section */}
      {!showAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reviews</h2>
              <button 
                onClick={fetchReviews} 
                disabled={refreshingReviews}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshingReviews ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="bg-white p-4 rounded shadow">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded shadow">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{review.review_title}</h3>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">By {review.author} • {new Date(review.review_date).toLocaleDateString()}</p>
                    {review.is_ai_generated && (
                      <div className="flex items-center text-xs text-blue-600 mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        AI Generated
                      </div>
                    )}
                    <p className="mt-2">{review.review_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-4 rounded shadow">
                <p>No reviews yet for this vehicle.</p>
              </div>
            )}
          </div>
          
          {/* Summary Card */}
          {summary && (
            <div>
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              <div className="bg-white p-4 rounded shadow">
                <div className="flex items-center mb-3">
                  <span className="text-2xl font-bold">{summary.avgRating}</span>
                  <div className="flex ml-2">
                    {renderStars(parseFloat(summary.avgRating))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">Based on {summary.totalReviews} reviews</p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Positive</span>
                    <span>{summary.positivePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${summary.positivePercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-1 mt-2">
                    <span>Negative</span>
                    <span>{summary.negativePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${summary.negativePercentage}%` }}
                    ></div>
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