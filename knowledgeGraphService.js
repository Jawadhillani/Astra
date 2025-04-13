// utils/knowledgeGraphService.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Data fetching functions
export async function getCarRelationships(carId) {
  try {
    // Fetch direct relationships
    const { data: relationships, error } = await supabase
      .from('car_relationships')
      .select(`
        id,
        relationship_type,
        relationship_strength,
        metadata,
        target_cars:target_car_id(id, manufacturer, model, year, body_type)
      `)
      .eq('source_car_id', carId);
      
    if (error) throw error;
    
    // Format for visualization
    return relationships.map(rel => ({
      id: rel.target_cars.id,
      label: `${rel.target_cars.year} ${rel.target_cars.manufacturer} ${rel.target_cars.model}`,
      type: rel.relationship_type,
      strength: rel.relationship_strength,
      metadata: rel.metadata
    }));
  } catch (error) {
    console.error('Error fetching car relationships:', error);
    return [];
  }
}

export async function getCarFeatures(carIds) {
  try {
    // Get features for multiple cars for comparison
    const { data: features, error } = await supabase
      .from('car_features')
      .select('*')
      .in('car_id', carIds);
      
    if (error) throw error;
    
    // Group features by car and category
    const result = {};
    carIds.forEach(id => {
      result[id] = {};
      
      // Get features for this car
      const carFeatures = features.filter(f => f.car_id === id);
      
      // Group by category
      const categories = [...new Set(carFeatures.map(f => f.category))];
      categories.forEach(category => {
        result[id][category] = carFeatures
          .filter(f => f.category === category)
          .reduce((acc, feat) => {
            acc[feat.feature_name] = feat.feature_rating || feat.feature_value;
            return acc;
          }, {});
      });
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching car features:', error);
    return {};
  }
}

export async function getCarTimeline(carId) {
  try {
    // Get timeline events
    const { data: events, error } = await supabase
      .from('car_timeline')
      .select('*')
      .eq('car_id', carId)
      .order('year', { ascending: true });
      
    if (error) throw error;
    
    return events;
  } catch (error) {
    console.error('Error fetching car timeline:', error);
    return [];
  }
}

export async function getReviewSentiment(carId) {
  try {
    // Get sentiment analysis
    const { data: sentiment, error } = await supabase
      .from('review_analysis')
      .select('*')
      .eq('car_id', carId);
      
    if (error) throw error;
    
    // Format for visualization
    return sentiment.map(item => ({
      aspect: item.aspect,
      positive: Math.round((item.positive_count / (item.positive_count + item.negative_count + item.neutral_count)) * 100) || 0,
      negative: Math.round((item.negative_count / (item.positive_count + item.negative_count + item.neutral_count)) * 100) || 0,
      neutral: Math.round((item.neutral_count / (item.positive_count + item.negative_count + item.neutral_count)) * 100) || 0,
      key_terms: {
        positive: item.key_positive_terms || [],
        negative: item.key_negative_terms || []
      }
    }));
  } catch (error) {
    console.error('Error fetching review sentiment:', error);
    return [];
  }
}

// Visualization determination function
export function determineVisualizationType(query) {
    // Check if query is a valid string
    if (!query || typeof query !== 'string') {
      console.error('Invalid query provided to determineVisualizationType:', query);
      return null;
    }
    
    // Convert query to lowercase once for case-insensitive matching
    const lowerQuery = query.toLowerCase();
    
    // More sophisticated pattern matching
    const patterns = {
      comparison: [
        /compare .* (with|to|against) .*/i,
        /difference between .* and .*/i,
        /how does .* stack up .*/i,
        /versus|vs/i,
        /(better|worse) than/i
      ],
      trend: [
        /evolution of .*/i,
        /changes over time .*/i,
        /history of .*/i,
        /how has .* changed/i,
        /timeline/i,
        /development/i
      ],
      sentiment: [
        /what do (people|owners|users|customers) think/i,
        /reviews/i,
        /sentiment/i,
        /opinion/i,
        /like|dislike/i,
        /positive|negative/i,
        /feedback/i
      ],
      relationship: [
        /related to/i,
        /connections between/i,
        /relationship with/i,
        /similar (to|models)/i,
        /family tree/i,
        /predecessors|successors/i
      ]
    };
    
    // Check each pattern category
    for (const [type, typePatterns] of Object.entries(patterns)) {
      if (typePatterns.some(pattern => pattern.test(lowerQuery))) {
        return type;
      }
    }
    
    // Check for specific feature inquiries
    const featureTerms = [
      'performance', 'safety', 'reliability', 'comfort', 
      'fuel economy', 'technology', 'value', 'styling'
    ];
    
    if (featureTerms.some(term => lowerQuery.includes(term))) {
      // If asking about specific features, determine whether to use
      // comparison or trend visualization based on context
      if (lowerQuery.includes('compare') || lowerQuery.includes('other')) {
        return 'comparison';
      } else if (lowerQuery.includes('history') || lowerQuery.includes('improved')) {
        return 'trend';
      } else {
        return 'sentiment'; // Default to sentiment for feature inquiries
      }
    }
    
    return null;
  }

// Generate visualization data function
export async function generateVisualizationData(type, carData) {
  switch (type) {
    case 'comparison':
      // Find similar cars to compare with
      const relationships = await getCarRelationships(carData.id);
      const competitors = relationships
        .filter(rel => rel.type === 'competitor')
        .slice(0, 2); // Limit to 2 competitors
      
      const carIds = [carData.id, ...competitors.map(c => c.id)];
      const features = await getCarFeatures(carIds);
      
      // Categories to compare (could be dynamically determined)
      const categories = ['Performance', 'Comfort', 'Safety', 'Technology', 'Value'];
      
      // Generate comparison data
      return {
        categories,
        entities: [
          {
            id: carData.id,
            name: `${carData.year} ${carData.manufacturer} ${carData.model}`,
            color: '#8884d8'
          },
          ...competitors.map((comp, index) => ({
            id: comp.id,
            name: comp.label,
            color: index === 0 ? '#82ca9d' : '#ffc658'
          }))
        ],
        values: [
          categories.map(cat => features[carData.id][cat]?.overall || Math.random() * 2 + 3),
          ...competitors.map(comp => 
            categories.map(cat => features[comp.id][cat]?.overall || Math.random() * 2 + 3)
          )
        ]
      };

    case 'trend':
      // Get timeline data
      const timelineData = await getCarTimeline(carData.id);
      
      // Generate time series data
      const years = [...new Set(timelineData.map(item => item.year))].sort();
      
      return {
        timeSeriesData: years.map(year => {
          const yearEvents = timelineData.filter(item => item.year === year);
          return {
            label: year.toString(),
            Safety: yearEvents.find(e => e.event_type === 'safety')?.significance_score || null,
            Performance: yearEvents.find(e => e.event_type === 'performance')?.significance_score || null,
            Technology: yearEvents.find(e => e.event_type === 'technology')?.significance_score || null,
          };
        }),
        series: [
          { key: 'Safety', name: 'Safety Rating', color: '#8884d8' },
          { key: 'Performance', name: 'Performance Rating', color: '#82ca9d' },
          { key: 'Technology', name: 'Technology Rating', color: '#ffc658' }
        ],
        yDomain: [0, 5]
      };

    case 'sentiment':
      // Get sentiment data
      const sentimentData = await getReviewSentiment(carData.id);
      
      return {
        aspectData: sentimentData
          .sort((a, b) => (b.positive + b.negative) - (a.positive + a.negative))
          .slice(0, 7) // Top 7 most mentioned aspects
      };

    case 'relationship':
      // Get relationships
      const allRelationships = await getCarRelationships(carData.id);
      
      return {
        primaryNode: {
          id: carData.id,
          label: `${carData.year} ${carData.manufacturer} ${carData.model}`
        },
        nodes: [
          {
            id: carData.id,
            label: `${carData.year} ${carData.manufacturer} ${carData.model}`,
            type: 'primary'
          },
          ...allRelationships.map(rel => ({
            id: rel.id,
            label: rel.label,
            type: rel.type
          }))
        ],
        links: allRelationships.map(rel => ({
          source: carData.id,
          target: rel.id,
          type: rel.type,
          strength: rel.strength
        }))
      };

    default:
      return {};
  }
}