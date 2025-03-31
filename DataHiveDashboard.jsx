// components/DataHiveDashboard.jsx
'use client'
import { useState, useEffect } from 'react';
  import {
    BrainCircuit, Database, Car, ChevronRight, ChevronDown,
    PieChart, MessageCircle, TrendingUp, Network, Search
  } from 'lucide-react';
  import EnhancedNeuralInterface from '../EnhancedNeuralInterface';
  import VisualizationController from './VisualizationController';

export default function DataHiveDashboard({ carId }) {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    specs: true, sentiment: true, relatives: false, timeline: false
  });
  const [knowledgeData, setKnowledgeData] = useState({
    relationships: null,
    sentiment: null,
    timeline: null,
    features: null
  });

  useEffect(() => {
    if (carId) {
      fetchCarData();
      fetchKnowledgeData();
    }
  }, [carId]);

  const fetchCarData = async () => {
    try {
      const response = await fetch(`/api/cars/${carId}`);
      if (response.ok) {
        const data = await response.json();
        setCar(data);
      }
    } catch (error) {
      console.error('Error fetching car:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeData = async () => {
    try {
      // In a real app, these would be separate API calls
      // For simplicity, we're mocking them here
      setKnowledgeData({
        relationships: await mockFetchRelationships(carId),
        sentiment: await mockFetchSentiment(carId),
        timeline: await mockFetchTimeline(carId),
        features: await mockFetchFeatures(carId)
      });
    } catch (error) {
      console.error('Error fetching knowledge data:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Tabs content rendering
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* General Specs */}
      <div className="md:col-span-2">
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold">{car.year} {car.manufacturer} {car.model}</h2>
            <div className="text-sm text-gray-400 mt-1">ID: {car.id}</div>
          </div>

          <div className="border-t border-gray-800">
            <button 
              className="flex items-center justify-between w-full px-6 py-3 text-left"
              onClick={() => toggleSection('specs')}
            >
              <span className="font-semibold">Specifications</span>
              {expandedSections.specs ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {expandedSections.specs && (
              <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-900/30 rounded-lg mr-3">
                    <Car className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Body Type</p>
                    <p>{car.body_type || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-green-900/30 rounded-lg mr-3">
                    <Search className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Engine</p>
                    <p>{car.engine_info || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-purple-900/30 rounded-lg mr-3">
                    <Gauge className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">MPG</p>
                    <p>{car.mpg || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-orange-900/30 rounded-lg mr-3">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Transmission</p>
                    <p>{car.transmission || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-800">
            <button 
              className="flex items-center justify-between w-full px-6 py-3 text-left"
              onClick={() => toggleSection('timeline')}
            >
              <span className="font-semibold">Evolution Timeline</span>
              {expandedSections.timeline ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {expandedSections.timeline && (
              <div className="px-6 pb-6">
                {knowledgeData.timeline ? (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="h-64">
                      <VisualizationController 
                        type="trend" 
                        data={knowledgeData.timeline} 
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Evolution of {car.model} over time, showing key improvements in performance, safety, and technology.
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">Timeline data not available</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-800">
            <button 
              className="flex items-center justify-between w-full px-6 py-3 text-left"
              onClick={() => toggleSection('relatives')}
            >
              <span className="font-semibold">Related Models</span>
              {expandedSections.relatives ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {expandedSections.relatives && (
              <div className="px-6 pb-6">
                {knowledgeData.relationships ? (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="h-64">
                      <VisualizationController 
                        type="relationship" 
                        data={knowledgeData.relationships} 
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Knowledge graph showing relationships with predecessor models, variants, and competitors.
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">Relationship data not available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sentiment Analysis */}
      <div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="border-b border-gray-800">
            <button 
              className="flex items-center justify-between w-full px-6 py-3 text-left"
              onClick={() => toggleSection('sentiment')}
            >
              <span className="font-semibold">Review Sentiment</span>
              {expandedSections.sentiment ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            
            {expandedSections.sentiment && (
              <div className="px-6 py-6">
                {knowledgeData.sentiment ? (
                  <div>
                    <div className="bg-gray-800 p-4 rounded-lg mb-4">
                      <div className="flex items-center mb-2">
                        <MessageCircle className="w-5 h-5 text-blue-400 mr-2" />
                        <h3 className="font-medium">Sentiment Overview</h3>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex-grow h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '68%' }}></div>
                        </div>
                        <span className="text-sm">68%</span>
                      </div>
                      <p className="text-xs text-gray-400">Positive sentiment from 178 reviews</p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium mb-3">Aspect Sentiment</h3>
                      <div className="h-64">
                        <VisualizationController 
                          type="sentiment" 
                          data={knowledgeData.sentiment} 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">Sentiment data not available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Neural Interface Tab
  const renderNeuralTab = () => (
    <div>
      <p className="text-gray-300 mb-4">
        Explore {car.year} {car.manufacturer} {car.model} using our neural interface. Ask complex questions across our automotive knowledge graph.
      </p>
      <EnhancedNeuralInterface carId={carId} />
    </div>
  );

  // Mock data functions for development
  const mockFetchRelationships = async (id) => ({
    primaryNode: {
      id: id,
      label: `${car?.year} ${car?.manufacturer} ${car?.model}`
    },
    nodes: [
      {
        id: id,
        label: `${car?.year} ${car?.manufacturer} ${car?.model}`,
        type: 'primary'
      },
      { id: 101, label: '2020 Model', type: 'predecessor' },
      { id: 102, label: 'Sport Trim', type: 'variant' },
      { id: 103, label: 'Luxury Trim', type: 'variant' },
      { id: 104, label: 'Competitor A', type: 'competitor' },
      { id: 105, label: 'Competitor B', type: 'competitor' }
    ],
    links: [
      { source: id, target: 101, type: 'predecessor' },
      { source: id, target: 102, type: 'variant' },
      { source: id, target: 103, type: 'variant' },
      { source: id, target: 104, type: 'competitor' },
      { source: id, target: 105, type: 'competitor' }
    ]
  });

  const mockFetchSentiment = async (id) => ({
    aspectData: [
      { aspect: 'Fuel Economy', positive: 82, negative: 18 },
      { aspect: 'Reliability', positive: 75, negative: 25 },
      { aspect: 'Comfort', positive: 68, negative: 32 },
      { aspect: 'Performance', positive: 70, negative: 30 },
      { aspect: 'Technology', positive: 62, negative: 38 },
      { aspect: 'Interior', positive: 65, negative: 35 },
      { aspect: 'Price Value', positive: 58, negative: 42 }
    ]
  });

  const mockFetchTimeline = async (id) => ({
    timeSeriesData: [
      { label: '2018', Safety: 3.5, Performance: 3.2, Technology: 3.0 },
      { label: '2019', Safety: 3.7, Performance: 3.4, Technology: 3.2 },
      { label: '2020', Safety: 4.0, Performance: 3.6, Technology: 3.5 },
      { label: '2021', Safety: 4.2, Performance: 3.8, Technology: 3.9 },
      { label: '2022', Safety: 4.5, Performance: 4.0, Technology: 4.2 },
      { label: '2023', Safety: 4.7, Performance: 4.2, Technology: 4.5 }
    ],
    series: [
      { key: 'Safety', name: 'Safety Rating', color: '#8884d8' },
      { key: 'Performance', name: 'Performance Rating', color: '#82ca9d' },
      { key: 'Technology', name: 'Technology Rating', color: '#ffc658' }
    ],
    yDomain: [0, 5]
  });

  const mockFetchFeatures = async (id) => ({
    categories: ['Performance', 'Comfort', 'Safety', 'Technology', 'Value'],
    entities: [
      {
        id: id,
        name: `${car?.year} ${car?.manufacturer} ${car?.model}`,
        color: '#8884d8'
      },
      {
        id: 104,
        name: 'Competitor A',
        color: '#82ca9d'
      },
      {
        id: 105,
        name: 'Competitor B',
        color: '#ffc658'
      }
    ],
    values: [
      [4.2, 3.8, 4.5, 4.0, 3.9],  // Main car
      [3.9, 4.1, 4.3, 4.2, 3.7],  // Competitor A
      [4.1, 3.5, 4.0, 4.5, 3.6]   // Competitor B
    ]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
        <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-400">Car Not Found</h2>
        <p className="text-gray-500 mt-2">The requested vehicle could not be found in our database.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 border-b border-gray-800">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'overview' 
                ? 'text-blue-500 border-blue-500' 
                : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <Database className="w-5 h-5 mr-2" />
            <span>Knowledge Overview</span>
          </button>
          
          <button
            className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'neural' 
                ? 'text-blue-500 border-blue-500' 
                : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('neural')}
          >
            <BrainCircuit className="w-5 h-5 mr-2" />
            <span>Neural Interface</span>
          </button>
          
          <button
            className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'visualization' 
                ? 'text-blue-500 border-blue-500' 
                : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('visualization')}
          >
            <Chart className="w-5 h-5 mr-2" />
            <span>Visual Knowledge</span>
          </button>
        </div>
      </div>
      
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'neural' && renderNeuralTab()}
      {activeTab === 'visualization' && (
        <div>
          <p className="text-gray-300 mb-4">
            Explore visual representations of the knowledge graph data related to this vehicle.
          </p>
          
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4">Feature Comparison</h3>
              <div className="h-80">
                <VisualizationController 
                  type="comparison"
                  data={knowledgeData.features}
                />
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4">Model Relationships</h3>
              <div className="h-80">
                <VisualizationController 
                  type="relationship"
                  data={knowledgeData.relationships}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}