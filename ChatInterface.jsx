'use client'
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Car, 
  Zap, 
  Shield, 
  Star,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Info,
  BarChart3,
  Mic,
  Volume2,
  Sparkles,
  MessageSquare,
  Activity,
  Gauge,
  Calendar,
  Award,
  Settings,
  Clock,
  Cpu,
  RefreshCw
} from 'lucide-react';

// Enhanced visual components for the chat
import CarBadgeIcon from './CarBadgeIcon';
import CarIllustration from './CarIllustration';

/**
 * Enhanced Dynamic Typing Indicator with particle effects
 */
const DynamicTypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="neu-glass-bg backdrop-blur-md rounded-2xl py-3 px-5 flex items-center space-x-3 border border-violet-600/30 shadow-xl">
        {/* Brain core with energy animations */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white relative z-10" />
          
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 rounded-full border border-violet-500 animate-ping-slow opacity-60"></div>
          
          {/* Orbital particle system */}
          <div className="typing-particle-system">
            <div className="typing-particle p1"></div>
            <div className="typing-particle p2"></div>
            <div className="typing-particle p3"></div>
          </div>
        </div>
        
        {/* Animated text */}
        <div className="text-sm text-gray-300 font-medium">
          <span className="text-violet-400">AI</span> is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">thinking</span>
          <span className="inline-flex ml-1">
            <span className="animate-typing-dot">.</span>
            <span className="animate-typing-dot animation-delay-100">.</span>
            <span className="animate-typing-dot animation-delay-200">.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Voice Input Visualizer with reactive audio waves
 */
const VoiceInputVisualizer = ({ isListening, audioLevel = 0 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !isListening) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    
    const bars = 28;
    const barWidth = canvas.width / bars;
    
    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw visualization bars
      for (let i = 0; i < bars; i++) {
        const height = Math.max(
          5,
          Math.sin(i / bars * Math.PI) * audioLevel * canvas.height * 0.6 + 
          Math.random() * audioLevel * 15
        );
        
        const hue = 270;
        const lightness = 50 + Math.sin(i / bars * Math.PI) * 20;
        
        ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;
        
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y + 2);
        ctx.lineTo(x, y + height - 2);
        ctx.arcTo(x, y + height, x + 2, y + height, 2);
        ctx.lineTo(x + barWidth - 2, y + height);
        ctx.arcTo(x + barWidth, y + height, x + barWidth, y + height - 2, 2);
        ctx.lineTo(x + barWidth, y + 2);
        ctx.arcTo(x + barWidth, y, x + barWidth - 2, y, 2);
        ctx.lineTo(x + 2, y);
        ctx.arcTo(x, y, x, y + 2, 2);
        ctx.fill();
      }
      
      animationFrame = requestAnimationFrame(renderFrame);
    };
    
    renderFrame();
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isListening, audioLevel]);
  
  return (
    <div className={`
      fixed bottom-20 left-1/2 transform -translate-x-1/2 
      p-6 bg-neu-glass border border-violet-600/30 rounded-2xl
      transition-all duration-300 shadow-gl
      ${isListening ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
    `}>
      <div className="text-center mb-3">
        <p className="text-violet-300 font-medium">Listening to your question...</p>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={320} 
        height={80} 
        className="rounded-lg"
      />
      
      <div className="mt-3 flex justify-center">
        <button className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/**
 * Interactive Feature Comparison Card - Replacing the sentiment analysis component
 * This provides more useful visual comparison of car features
 */
const FeatureComparisonCard = ({ carData, comparisonData = null }) => {
  if (!carData) return null;
  
  // Default comparison data if none provided
  const comparison = comparisonData || {
    performance: {
      value: 4.2,
      average: 3.8,
      description: "Above segment average"
    },
    comfort: {
      value: 3.9,
      average: 4.1,
      description: "Slightly below average"
    },
    reliability: {
      value: 4.0,
      average: 3.7,
      description: "Better than average"
    },
    technology: {
      value: 3.6,
      average: 3.9,
      description: "Needs improvement"
    },
    value: {
      value: 4.1,
      average: 3.7,
      description: "Excellent value proposition"
    }
  };

  return (
    <div className="bg-neu-glass backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/20 to-violet-600/20 mr-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
          Feature Performance Analysis
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(comparison).map(([feature, data]) => (
          <div key={feature}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-300 capitalize flex items-center">
                {getFeatureIcon(feature)}
                {feature}
              </span>
              <div className="flex space-x-3">
                <span className="text-xs text-gray-400">
                  Segment Avg: <span className="text-gray-300">{data.average.toFixed(1)}</span>
                </span>
                <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                  {data.value.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              {/* Segment average marker */}
              <div className="absolute h-full w-1 bg-gray-400 z-10" 
                  style={{ left: `${(data.average / 5) * 100}%` }}></div>
              
              {/* Value bar with gradient */}
              <div 
                className={`h-full rounded-full ${getBarGradient(data.value, data.average)}`} 
                style={{ width: `${(data.value / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{data.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get appropriate icon for each feature
function getFeatureIcon(feature) {
  const icons = {
    performance: <Zap className="w-4 h-4 mr-1 text-yellow-400" />,
    comfort: <Shield className="w-4 h-4 mr-1 text-blue-400" />,
    reliability: <Award className="w-4 h-4 mr-1 text-green-400" />,
    technology: <Cpu className="w-4 h-4 mr-1 text-violet-400" />,
    value: <Star className="w-4 h-4 mr-1 text-pink-400" />
  };
  
  return icons[feature] || null;
}

// Helper function to get appropriate gradient for performance bar
function getBarGradient(value, average) {
  if (value >= average + 0.5) {
    return "bg-gradient-to-r from-green-500 to-emerald-400"; // Much better
  } else if (value >= average) {
    return "bg-gradient-to-r from-blue-500 to-cyan-400"; // Better
  } else if (value >= average - 0.5) {
    return "bg-gradient-to-r from-yellow-500 to-amber-400"; // Slightly worse
  } else {
    return "bg-gradient-to-r from-red-500 to-orange-400"; // Worse
  }
}

/**
 * Interactive Car Feature Card showing key highlights
 */
const CarFeatureHighlightsCard = ({ carData }) => {
  if (!carData) return null;
  
  const features = [
    {
      title: "Engine & Performance",
      value: carData.engine_info || "2.4L 4cyl 6M",
      icon: <Gauge className="w-5 h-5 text-blue-400" />,
      description: "The engine provides adequate power for most driving situations while maintaining decent fuel economy."
    },
    {
      title: "Technology & Convenience",
      value: "UConnect Infotainment",
      icon: <Cpu className="w-5 h-5 text-violet-400" />,
      description: "Features a 8.4-inch touchscreen, Bluetooth, voice control, and available navigation system."
    },
    {
      title: "Safety Features",
      value: "NHTSA 5-Star Rating",
      icon: <Shield className="w-5 h-5 text-green-400" />,
      description: "Includes 10 airbags, stability control, and available blind-spot monitoring."
    }
  ];

  return (
    <div className="bg-neu-glass backdrop-blur-md rounded-xl p-4 border border-violet-500/20">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 mr-3">
          <Award className="w-5 h-5 text-violet-400" />
        </div>
        <h3 className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
          Key Vehicle Highlights
        </h3>
      </div>

      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="feature-card p-3 rounded-lg bg-gray-800/50 border-l-4 border-violet-500 hover:bg-gray-800/80 transition-all">
            <div className="flex justify-between mb-1">
              <span className="text-gray-200 font-medium flex items-center">
                {feature.icon}
                <span className="ml-1">{feature.title}</span>
              </span>
              <span className="text-sm font-medium text-violet-300">
                {feature.value}
              </span>
            </div>
            <p className="text-xs text-gray-400 ml-6">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Owner Insights Card - A new component to replace sentiment analysis 
 * with more useful owner feedback visualization
 */
const OwnerInsightsCard = ({ ownerData = null }) => {
  // Default data if none provided
  const insights = ownerData || {
    averageOwnership: "3.2 years",
    ownerSatisfaction: 87,
    topPraises: ["Fuel Economy", "Comfortable Ride", "Value for Money"],
    topCritiques: ["Underpowered Engine", "Mediocre Tech Features"],
    recommendationRate: 84,
    ownerQuote: "Great reliable daily driver that won't break the bank."
  };

  return (
    <div className="bg-neu-glass backdrop-blur-md rounded-xl p-4 border border-green-500/20">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-600/20 to-emerald-600/20 mr-3">
          <MessageSquare className="w-5 h-5 text-green-400" />
        </div>
        <h3 className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
          Owner Insights
        </h3>
      </div>

      <div className="space-y-4">
        {/* Owner satisfaction meter */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-300">Owner Satisfaction</span>
            <span className="text-sm font-medium text-green-400">{insights.ownerSatisfaction}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" 
              style={{ width: `${insights.ownerSatisfaction}%` }}
            ></div>
          </div>
        </div>

        {/* Ownership details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-lg bg-gray-800/50">
            <div className="text-xs text-gray-400">Avg. Ownership</div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-gray-200">{insights.averageOwnership}</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-gray-800/50">
            <div className="text-xs text-gray-400">Would Recommend</div>
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-gray-200">{insights.recommendationRate}%</span>
            </div>
          </div>
        </div>

        {/* Top feedback */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Award className="w-4 h-4 mr-1 text-green-400" />
              Most Praised
            </div>
            <ul className="space-y-1">
              {insights.topPraises.map((praise, index) => (
                <li key={index} className="text-xs text-gray-400 flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                  {praise}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <ThumbsDown className="w-4 h-4 mr-1 text-red-400" />
              Common Critiques
            </div>
            <ul className="space-y-1">
              {insights.topCritiques.map((critique, index) => (
                <li key={index} className="text-xs text-gray-400 flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                  {critique}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Owner quote */}
        <div className="italic text-gray-400 text-sm border-l-4 border-gray-600 pl-3 py-1">
          "{insights.ownerQuote}"
        </div>
      </div>
    </div>
  );
};

/**
 * Smart suggestion chips with animations and context-aware icons
 */
const EnhancedSuggestionChips = ({ suggestions, onSelect }) => {
  // Skip rendering if no suggestions
  if (!suggestions || suggestions.length === 0) return null;
  const containerRef = useRef(null);
  
  // Animation trigger on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Set initial opacity for container
    container.style.opacity = 1;
    
    // Get all chips inside the container
    const chips = container.querySelectorAll('.suggestion-chip');
    
    // Animate each chip with staggered delay
    chips.forEach((chip, index) => {
      // Set initial state
      chip.style.opacity = 0;
      chip.style.transform = 'translateY(10px)';
      
      // Trigger animation with staggered delay
      setTimeout(() => {
        chip.style.opacity = 1;
        chip.style.transform = 'translateY(0)';
      }, 100 + (index * 80)); // 80ms stagger between chips
    });
  }, [suggestions]);
  
  // Get context-appropriate icon based on suggestion content
  const getIconForSuggestion = (suggestion) => {
    const text = suggestion.toLowerCase();
    
    if (text.includes('compare') || text.includes('vs')) return <BarChart3 size={14} />;
    if (text.includes('fuel') || text.includes('mpg')) return <Zap size={14} />;
    if (text.includes('car') || text.includes('model')) return <Car size={14} />;
    if (text.includes('best') || text.includes('recommend')) return <Award size={14} />;
    if (text.includes('rating') || text.includes('review')) return <Star size={14} />;
    if (text.includes('what') || text.includes('how')) return <HelpCircle size={14} />;
    
    return <Sparkles size={14} />;
  };
  
  return (
    <div 
      ref={containerRef} 
      className="mt-3 flex flex-wrap gap-2 transition-opacity duration-500" 
      style={{ opacity: 0 }} // Initial state, changed by useEffect
    >
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          className="suggestion-chip neu-glass-bg backdrop-blur-sm hover:bg-gray-750 text-gray-200 text-xs px-3 py-1.5 rounded-full border border-violet-500/20 hover:border-violet-500/50 transition-all hover:shadow-glow flex items-center space-x-1.5"
          style={{ 
            transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            opacity: 0,
            transform: 'translateY(10px)'
          }}
          title={suggestion}
        >
          <span className="text-blue-400 flex-shrink-0">
            {getIconForSuggestion(suggestion)}
          </span>
          <span className="truncate max-w-[200px]">{suggestion}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * Enhanced ChatInterface with dynamic visuals, RGB effects, and interactive components
 */
const EnhancedChatInterface = ({ 
  carId, 
  voiceEnabled = false, 
  onSpeakResponse = null,
  listening = false,
  onVoiceToggle = null
}) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [carData, setCarData] = useState(null);
  const [typingEffect, setTypingEffect] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [fullResponseText, setFullResponseText] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [errorState, setErrorState] = useState({
    hasError: false,
    retryCount: 0
  });
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Mouse position for RGB effects
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Track mouse position for RGB effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!chatContainerRef.current) return;
      const rect = chatContainerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize with welcome message only on first load
  useEffect(() => {
    // Only create welcome message if this is the first load
    if (isFirstLoad) {
      // Create welcome message with smart suggestions based on context
      const initialMessage = { 
        text: getWelcomeMessage(carId ? true : false),
        sender: 'ai',
        suggestions: getInitialSuggestions()
      };
      
      setMessages([initialMessage]);
      // Mark that we've shown the welcome message
      setIsFirstLoad(false);
    }
    
    // After loading welcome message, fetch car data
    if (carId) {
      fetchCarData();
    }
    
    // Focus input field on load
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, [carId, isFirstLoad]);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTypingText]);

  // Typing effect animation
  useEffect(() => {
    if (typingEffect && fullResponseText) {
      if (currentTypingText.length < fullResponseText.length) {
        // Calculate how many characters to add per tick
        // Increase this number for faster typing
        const charsToAdd = 5;
        
        const timeout = setTimeout(() => {
          const nextEnd = Math.min(currentTypingText.length + charsToAdd, fullResponseText.length);
          setCurrentTypingText(fullResponseText.substring(0, nextEnd));
        }, 10);
        return () => clearTimeout(timeout);
      } else {
        setTypingEffect(false);
        // Update the last message with the complete text
        const newMessages = [...messages];
        newMessages[newMessages.length - 1].text = fullResponseText;
        setMessages(newMessages);
        setFullResponseText('');
        setCurrentTypingText('');
        
        // Speak the response if voice is enabled
        if (voiceEnabled && onSpeakResponse) {
          onSpeakResponse(fullResponseText);
        }
      }
    }
  }, [typingEffect, currentTypingText, fullResponseText, messages, voiceEnabled, onSpeakResponse]);

  // Fetch car data when component mounts
  const fetchCarData = async () => {
    if (!carId) return;

    try {
      const response = await fetch(`/api/cars/${carId}`);
      if (response.ok) {
        const data = await response.json();
        setCarData(data);
        
        // Update welcome message with car-specific text
        updateWelcomeMessageWithCarInfo(data);
      } else {
        console.error(`Error fetching car data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching car data:', error);
    }
  };

  // Update welcome message after car data is loaded
  const updateWelcomeMessageWithCarInfo = (car) => {
    if (!car || messages.length === 0) return;
    
    const newMessages = [...messages];
    newMessages[0].text = `Hello! I'm your automotive expert. What would you like to know about the ${car.year} ${car.manufacturer} ${car.model}?`;
    
    // Add car-specific suggestions
    newMessages[0].suggestions = getCarSpecificSuggestions(car);
    
    setMessages(newMessages);
  };

  // Generate welcome message based on context
  const getWelcomeMessage = (hasCarContext) => {
    if (hasCarContext) {
      return "Hello! I'm your automotive expert. What would you like to know about this vehicle?";
    } else {
      return "Hello! I'm your automotive expert assistant. How can I help you with your vehicle questions today?";
    }
  };

  // Get initial suggestion chips
  const getInitialSuggestions = () => {
    return [
      "What are the most reliable cars?", 
      "Compare SUVs and sedans", 
      "Best cars for fuel economy", 
      "What features should I look for?", 
      "Latest car safety technologies"
    ];
  };

  // Get car-specific suggestion chips
  const getCarSpecificSuggestions = (car) => {
    if (!car) return getInitialSuggestions();
    
    return [
      `What's the fuel economy of the ${car.model}?`, 
      `Tell me about the ${car.model}'s performance`, 
      `How reliable is the ${car.year} ${car.manufacturer}?`, 
      `What are owners saying about the ${car.model}?`, 
      `Compare to similar ${car.body_type || 'vehicles'}`
    ];
  };

  // Handle sending a message
  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const currentUserMessage = { text: messageText, sender: 'user' };
    
    // Check if this will be the first real AI response
    const isFirstAiResponse = messages.length === 1;

    // Add user message to chat immediately
    setMessages(prev => [...prev, currentUserMessage]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false); // Hide suggestions while loading response

    try {
      // Prepare conversation history for context (excluding the initial welcome)
      const messageHistory = messages
        .filter(m => m.sender !== 'ai' || m.text !== getWelcomeMessage(!!carId)) // Filter out initial welcome
        .map(m => m.text) // Just send the text content
        .filter(text => text && text.trim().length > 0);

      // Make request to your backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          car_id: carId || null, // Ensure car_id is null if not provided
          history: messageHistory // Send as simple array of strings
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();

      // Validate response data
      if (!data || typeof data.response !== 'string') {
        throw new Error('Invalid response format from API');
      }

      // Construct the basic AI response
      const aiResponse = {
        text: data.response,
        sender: 'ai',
        components: [], // Initialize empty components array
        suggestions: [] // Initialize empty suggestions
      };

      // Conditionally add components ONLY for the first AI response
      if (isFirstAiResponse) {
        // Add car illustration if available
        if (data.car_data) {
          aiResponse.components.push({
            type: 'specification',
            data: data.car_data
          });
        } else if (carData) {
          aiResponse.components.push({
            type: 'specification',
            data: carData
          });
        }

        // Add analysis components if analysis data exists
        if (data.analysis) {
          // Add car feature highlights
          if (carData) {
            aiResponse.components.push({
              type: 'feature_highlights',
              data: carData
            });
          }

          // Add owner insights
          aiResponse.components.push({
            type: 'owner_insights',
            data: data.owner_insights_data || null
          });

          // Add feature comparison only if relevant
          if (messageText.toLowerCase().includes('compare') ||
              messageText.toLowerCase().includes('vs') ||
              messageText.toLowerCase().includes('difference')) {
            aiResponse.components.push({
              type: 'feature_comparison',
              data: data.comparison_data || carData
            });
          }
        }
      }

      // Generate follow-up suggestions
      aiResponse.suggestions = data.suggestions || [
        `What are common issues with the ${carData?.model || 'this car'}?`,
        `How does it compare to competitors?`,
        `What's the reliability like?`,
        `Tell me about the interior features`,
        `What's the resale value like?`
      ];

      // Start typing animation effect
      setFullResponseText(data.response);
      setCurrentTypingText('');
      setTypingEffect(true);

      // Add the AI response with empty text for typing effect
      setMessages(prev => [...prev, { ...aiResponse, text: '' }]);

      // Reset error state
      setErrorState({ hasError: false, retryCount: 0 });

    } catch (error) {
      console.error('Chat error:', error);

      // Handle error state
      const currentRetryCount = errorState.retryCount;
      setErrorState({ hasError: true, retryCount: currentRetryCount + 1 });

      // Show user-friendly error message
      setMessages(prev => [...prev, {
        text: `I apologize, but I'm having trouble processing your request. Please try again in a moment.`,
        sender: 'ai',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle click on suggestion button
  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  // Render message components based on their type
  const renderMessageComponents = (components) => {
    if (!components || components.length === 0) return null;
    
    return (
      <div className="space-y-4 mt-4">
        {components.map((component, index) => {
          const componentKey = `${component.type}-${index}`;
          
          switch (component.type) {
            case 'specification':
              return (
                <div key={componentKey} className="mb-2 max-w-md mx-auto transform hover:scale-105 transition-transform">
                  <div className="flex justify-center">
                    <CarIllustration
                      bodyType={component.data.body_type || 'sedan'}
                      manufacturer={component.data.manufacturer}
                      model={component.data.model}
                      year={component.data.year}
                      size="lg"
                      className="animate-float"
                    />
                  </div>
                </div>
              );
            case 'feature_highlights':
              return <CarFeatureHighlightsCard key={componentKey} carData={component.data} />;
            case 'owner_insights':
              return <OwnerInsightsCard key={componentKey} ownerData={component.data} />;
            case 'feature_comparison':
              return <FeatureComparisonCard key={componentKey} carData={component.data} />;
            default:
              return null;
          }
        })}
      </div>
    );
  };

  // Dynamic glow effect style based on mouse position
  const getGlowStyle = () => {
    if (!chatContainerRef.current) return {};
    
    const rect = chatContainerRef.current.getBoundingClientRect();
    const x = mousePos.x;
    const y = mousePos.y;
    
    return {
      background: `
        radial-gradient(
          800px circle at ${x}px ${y}px,
          rgba(139, 92, 246, 0.06),
          transparent 40%
        )
      `
    };
  };

  return (
    <div 
      ref={chatContainerRef}
      className="bg-neu-dark h-full flex flex-col overflow-hidden relative border border-gray-800 rounded-xl chat-container"
    >
      {/* RGB corner glows */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-tl-xl blur-xl bg-gradient-to-br from-blue-600/20 via-violet-600/20 to-purple-600/10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-tr-xl blur-xl bg-gradient-to-bl from-violet-600/20 via-purple-600/20 to-blue-600/10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-bl-xl blur-xl bg-gradient-to-tr from-purple-600/20 via-blue-600/20 to-violet-600/10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-br-xl blur-xl bg-gradient-to-tl from-blue-600/20 via-purple-600/20 to-violet-600/10 pointer-events-none"></div>
      
      {/* Dynamic interactive glow effect */}
      <div className="absolute inset-0 pointer-events-none" style={getGlowStyle()}></div>
      
      {/* Animated circuit pattern overlay */}
      <div className="absolute inset-0 circuit-pattern opacity-5 pointer-events-none"></div>
      
      {/* Header with voice controls */}
      <div className="bg-neu-glass border-b border-gray-800 backdrop-blur-md text-white p-4 flex items-center justify-between z-10 rgb-border">
        <h2 className="text-xl font-bold flex items-center">
          <Bot className="w-6 h-6 mr-2 text-violet-400" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
            Neural Automotive Assistant
          </span>
        </h2>
        
        {/* Voice controls in a nice pill */}
        {onVoiceToggle && (
          <div className="flex items-center gap-1 bg-gray-800/50 backdrop-blur-sm p-1 rounded-full border border-gray-700">
            <button
              onClick={() => onVoiceToggle(!voiceEnabled)}
              className={`p-2 rounded-full transition-colors ${voiceEnabled ? 'bg-violet-600/30 text-violet-300 ring-1 ring-violet-500/50' : 'text-gray-300 hover:bg-white/10'}`}
              title={voiceEnabled ? "Voice responses enabled" : "Voice responses disabled"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            
            {'webkitSpeechRecognition' in window && (
              <button
                onClick={startVoiceRecognition}
                disabled={listening}
                className={`p-2 rounded-full transition-colors ${
                  listening ? 'bg-red-500/50 text-white ring-1 ring-red-500/50' : 'text-gray-300 hover:bg-white/10'
                }`}
                title={listening ? "Listening..." : "Speak your question"}
              >
                <Mic className={`w-4 h-4 ${listening ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages area with clean styling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const isLastMessage = idx === messages.length - 1;
          const isTyping = isLastMessage && typingEffect && !isUser;
          
          return (
            <div 
              key={idx} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`
                relative 
                max-w-[85%] 
                transition-all 
                duration-500 
                transform 
                ${isLastMessage ? 'scale-in-message' : ''}
                ${isUser ? 'origin-right' : 'origin-left'}
              `}>
                {/* Avatar */}
                <div className={`
                  absolute 
                  ${isUser ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} 
                  top-0 
                  ${isUser ? 'bg-gradient-to-br from-blue-500 to-violet-600' : 'bg-gradient-to-br from-violet-700 to-indigo-900'}
                  w-8 h-8 
                  rounded-full 
                  flex 
                  items-center 
                  justify-center 
                  border-2 
                  border-gray-900 
                  shadow-glow-sm
                  -translate-y-1/4
                  z-10
                `}>
                  {isUser ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                  
                  {/* Particle effects around AI avatar */}
                  {!isUser && (
                    <div className="absolute inset-0 avatar-particles pointer-events-none">
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                    </div>
                  )}
                </div>
                
                {/* Message bubble with dynamic gradient border */}
                <div 
                  className={`
                    ${isUser ? 'neu-glass-user' : 'neu-glass-ai'} 
                    relative z-0
                    message-bubble
                    p-4 
                    rounded-2xl
                    mt-4
                    backdrop-blur-md
                    border
                    ${isUser ? 'border-blue-500/30 rgb-border-user' : 'border-violet-600/30 rgb-border-ai'}
                    shadow-lg
                    overflow-hidden
                  `}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 opacity-5 z-0 message-gradient-animated"></div>
                  
                  {/* Message text with enhanced typography */}
                  <div className="relative z-10">
                    {isTyping ? (
                      <p className="text-gray-100">{currentTypingText}</p>
                    ) : (
                      <p className="text-gray-100">{msg.text}</p>
                    )}
                    
                    {/* Interactive elements */}
                    {msg.components && renderMessageComponents(msg.components)}
                    
                    {/* Suggestion chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <EnhancedSuggestionChips 
                        suggestions={msg.suggestions} 
                        onSelect={handleSuggestionClick} 
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {loading && !typingEffect && (
          <DynamicTypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area with enhanced styling */}
      <div className="border-t border-gray-800 backdrop-blur-md p-4 rgb-border-bottom">
        <div className="relative flex">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={listening ? "Listening..." : "Ask about this vehicle..."}
            className={`w-full bg-neu-glass backdrop-blur-md border border-gray-700 focus:border-violet-500/50 rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-white transition-all ${listening ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
          />
          
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-violet-700 text-white rounded-r-xl px-5 py-3 hover:from-blue-500 hover:to-violet-600 disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-violet-700 transition-colors shadow-glow-button"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Voice input visualizer */}
      <VoiceInputVisualizer isListening={listening} audioLevel={0.5} />
      
      {/* Global CSS */}
      <style jsx global>{`
        /* Neural glass backgrounds */
        .neu-dark {
          background: linear-gradient(to bottom right, #0f0f1a, #141428);
        }
        
        .neu-glass {
          background: rgba(30, 30, 50, 0.4);
        }
        
        .neu-glass-bg {
          background: rgba(30, 30, 50, 0.4);
        }
        
        .neu-glass-user {
          background: rgba(37, 99, 235, 0.1);
        }
        
        .neu-glass-ai {
          background: rgba(124, 58, 237, 0.1);
        }
        
        /* RGB borders */
        .rgb-border {
          position: relative;
        }
        
        .rgb-border::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 25%;
          right: 25%;
          height: 1px;
          background: linear-gradient(to right, 
            rgba(59, 130, 246, 0), 
            rgba(59, 130, 246, 0.7), 
            rgba(139, 92, 246, 0.7), 
            rgba(217, 70, 239, 0.7), 
            rgba(59, 130, 246, 0)
          );
          background-size: 400% 100%;
          animation: rgb-border-flow 6s linear infinite;
        }
        
        .rgb-border-bottom::after {
          content: '';
          position: absolute;
          top: -1px;
          left: 25%;
          right: 25%;
          height: 1px;
          background: linear-gradient(to right, 
            rgba(59, 130, 246, 0), 
            rgba(59, 130, 246, 0.7), 
            rgba(139, 92, 246, 0.7), 
            rgba(217, 70, 239, 0.7), 
            rgba(59, 130, 246, 0)
          );
          background-size: 400% 100%;
          animation: rgb-border-flow 6s linear infinite;
        }
        
        .rgb-border-user:hover {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }
        
        .rgb-border-ai:hover {
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
        }
        
        /* Message gradient */
        @keyframes message-gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .message-gradient-animated {
          background: linear-gradient(45deg, 
            rgba(139, 92, 246, 0.3), 
            rgba(59, 130, 246, 0.3), 
            rgba(236, 72, 153, 0.3), 
            rgba(139, 92, 246, 0.3)
          );
          background-size: 400% 400%;
          animation: message-gradient-flow 8s ease infinite;
        }
        
        /* Shadow glow effects */
        .shadow-glow-sm {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
        }
        
        .shadow-glow-button {
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
        }
        
        .shadow-glow {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        
        /* Circuit pattern background */
        .circuit-pattern {
          background-image: radial-gradient(
            rgba(139, 92, 246, 0.3) 2px, 
            transparent 2px
          ), linear-gradient(
            to right, 
            rgba(139, 92, 246, 0.1) 1px, 
            transparent 1px
          ), linear-gradient(
            to bottom, 
            rgba(139, 92, 246, 0.1) 1px, 
            transparent 1px
          );
          background-size: 20px 20px, 40px 40px, 40px 40px;
        }
        
        /* Typing indicator animations */
        .typing-particle-system {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .typing-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: white;
          opacity: 0.7;
          filter: blur(1px);
        }

        .typing-particle.p1 {
          animation: orbit 2s linear infinite;
        }

        .typing-particle.p2 {
          animation: orbit 3s linear infinite;
          animation-delay: -1s;
        }

        .typing-particle.p3 {
          animation: orbit 1.5s linear infinite;
          animation-delay: -0.5s;
        }

        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(8px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(8px) rotate(-360deg); }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-typing-dot {
          animation: typing-dot 1.4s infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        @keyframes typing-dot {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        /* Avatar particle effects */
        .avatar-particles .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.8);
          filter: blur(1px);
          opacity: 0;
        }
        
        .avatar-particles .particle:nth-child(1) {
          top: 0;
          left: 50%;
          animation: particle-fade 3s ease-in-out infinite;
        }
        
        .avatar-particles .particle:nth-child(2) {
          top: 50%;
          right: 0;
          animation: particle-fade 3s ease-in-out infinite 1s;
        }
        
        .avatar-particles .particle:nth-child(3) {
          bottom: 0;
          left: 50%;
          animation: particle-fade 3s ease-in-out infinite 2s;
        }
        
        @keyframes particle-fade {
          0%, 100% { opacity: 0; transform: scale(0.2) translateY(0); }
          50% { opacity: 0.8; transform: scale(1) translateY(-5px); }
        }

        /* Message scale-in animation */
        @keyframes scale-in-message {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        .scale-in-message {
          animation: scale-in-message 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        /* RGB border animation */
        @keyframes rgb-border-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        /* Car illustration float animation */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EnhancedChatInterface;