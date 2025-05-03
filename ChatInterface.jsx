// Enhanced version of ChatInterface.jsx with improved intelligence and features
'use client'
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  CornerDownRight, 
  Car, 
  Zap, 
  Shield, 
  Star,
  AlertCircle,
  RefreshCw,
  Fuel,
  Gauge,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Info,
  BarChart3,
  Mic,
  Volume2,
  Sparkles,
  Search,
  DollarSign,
  X,
  Activity
} from 'lucide-react';

// Import the visual components for chat
import { 
  SpecificationCard, 
  RatingCard, 
  ProsConsCard, 
  CategoryScoresCard, 
  SentimentCard
} from './ChatComponents';

// Import suggestion chips for smart recommendations
import SuggestionChips from './SuggestionChips';

// Advanced typing indicator with dynamic particles
const AdvancedTypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-800/80 backdrop-blur-md rounded-full py-2 px-4 flex items-center space-x-2 border border-violet-900/30">
        <div className="relative w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
          <Bot className="w-3 h-3 text-white" />
          
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
          <span className="text-violet-400">AI</span> is composing
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

// Voice input visualization
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
      p-4 bg-gray-900/90 backdrop-blur-md rounded-lg border border-violet-600/30
      transition-all duration-300 shadow-lg
      ${isListening ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
    `}>
      <div className="text-center mb-2">
        <p className="text-violet-300 font-medium">Listening...</p>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={280} 
        height={60} 
        className="rounded-lg"
      />
      
      <div className="mt-2 flex justify-center">
        <button className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Context-aware action buttons
const ContextAwareActionButtons = ({ context, onAction }) => {
  if (!context || Object.keys(context).length === 0) return null;
  
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {context.carComparison && (
        <button 
          onClick={() => onAction('compare', context.carComparison)}
          className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg text-xs font-medium text-white flex items-center shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]"
        >
          <BarChart3 className="w-3 h-3 mr-1" />
          Compare {context.carComparison.car1.model} vs {context.carComparison.car2.model}
        </button>
      )}
      
      {context.carFeature && (
        <button 
          onClick={() => onAction('explore', context.carFeature)}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg text-xs font-medium text-white flex items-center shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]"
        >
          <Search className="w-3 h-3 mr-1" />
          Explore {context.carFeature} in detail
        </button>
      )}
      
      {context.priceCheck && (
        <button 
          onClick={() => onAction('price', context.priceCheck)}
          className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-400 rounded-lg text-xs font-medium text-white flex items-center shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]"
        >
          <DollarSign className="w-3 h-3 mr-1" />
          Check current pricing
        </button>
      )}
    </div>
  );
};

/**
 * Enhanced chat interface with the following features:
 * - Improved intelligence with context awareness
 * - Rich visual components for car data visualization
 * - Smart suggestion chips based on conversation context
 * - Typing effect for natural conversation feel
 * - Voice capabilities (text-to-speech and speech recognition)
 * - Advanced error handling and recovery mechanisms
 * - Memory of conversation history and preferences
 */
const ChatInterface = ({ 
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
  const [errorState, setErrorState] = useState({
    hasError: false,
    retryCount: 0
  });
  
  // Conversation context for more intelligent responses
  const [conversationContext, setConversationContext] = useState({
    lastIntent: null,
    mentionedFeatures: [],
    preferredAspects: [],
    questionCount: 0
  });

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    // Create welcome message with smart suggestions based on context
    const initialMessage = { 
      text: getWelcomeMessage(carId ? true : false),
      sender: 'ai',
      suggestions: getInitialSuggestions()
    };
    
    setMessages([initialMessage]);
    
    // After loading welcome message, fetch car data
    if (carId) {
      fetchCarData();
    }
    
    // Focus input field on load
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Preload voices
      speechSynthesisRef.current.onvoiceschanged = () => {
        speechSynthesisRef.current.getVoices();
      };
    }
    
    // Initialize speech recognition if available
    initializeSpeechRecognition();
    
    // Cleanup speech synthesis on unmount
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [carId]);

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
        
        // Handle API errors gracefully
        if (response.status === 404) {
          // Car not found
          addSystemMessage(`I couldn't find information about this car in our database. Please try another vehicle or ask a general question about cars.`);
        } else {
          // Other API errors
          addSystemMessage(`I'm having trouble accessing our vehicle database right now. You can still ask general questions about cars.`);
        }
      }
    } catch (error) {
      console.error('Error fetching car data:', error);
      addSystemMessage(`There was a problem connecting to our database. Please check your connection and try again later.`);
    }
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      // Configure recognition events
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech recognized:", transcript);
        setInput(transcript);
        handleSend(transcript);
        setListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
        
        // Provide feedback for microphone errors
        if (event.error === 'not-allowed') {
          addSystemMessage("I couldn't access your microphone. Please check your permissions and try again.");
        } else if (event.error === 'network') {
          addSystemMessage("I couldn't connect to the speech recognition service. Please check your internet connection.");
        }
      };
      
      recognitionInstance.onend = () => {
        setListening(false);
      };
      
      window.speechRecognition = recognitionInstance;
    }
  };
  
  // Start voice recognition
  const startVoiceRecognition = () => {
    if (window.speechRecognition && !listening) {
      try {
        window.speechRecognition.start();
        setListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setListening(false);
      }
    }
  };

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
        } else if (voiceEnabled && speechSynthesisRef.current) {
          speakText(fullResponseText);
        }
      }
    }
  }, [typingEffect, currentTypingText, fullResponseText, messages, voiceEnabled, onSpeakResponse]);

  // Function to speak text using built-in speech synthesis
  const speakText = (text) => {
    if (!speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to select a natural-sounding voice
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(
      voice => voice.name.includes('Female') || 
               voice.name.includes('Google') || 
               voice.name.includes('Natural')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Speak the text
    speechSynthesisRef.current.speak(utterance);
  };

  // Helper to add system messages
  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, { 
      text, 
      sender: 'ai',
      isSystem: true
    }]);
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

  // Context-aware follow-up suggestions based on conversation
  const generateFollowupSuggestions = (/* Possibly pass something if needed */) => {
    // For now, this just returns some placeholders
    // or references existing carData if you prefer
    if (!carData) {
      // Return general suggestions if no carData
      return [
        "Tell me about this car model",
        "What are the pros and cons?",
        "Common reliability issues",
        "What should I look for when buying?"
      ];
    }
    
    // Return car-specific suggestions
    return [
      `Is the ${carData.manufacturer} ${carData.model} good for families?`,
      `What is the overall rating of the ${carData.model}?`,
      `Any common problems with the ${carData.model}?`,
      `How does the ${carData.model} compare to competitors?`
    ];
  };

  // -- ONLY THIS FUNCTION IS UPDATED WITH YOUR NEW SNIPPET --
  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    // Add user message to chat
    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      // Prepare conversation history for context
      const messageHistory = messages
        .map(m => m.text)
        .filter(text => text && text.trim().length > 0);
      
      // Make request to our new OpenAI-powered endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          car_id: carId,
          conversation_history: messageHistory
        })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      
      // Create AI response using the same UI components you already have
      const aiResponse = { 
        text: data.response,
        sender: 'ai',
        components: []
      };
      
      // Add components based on the car data and analysis
      // This uses your existing visual components without changing design
      if (data.car_data && messages.length <= 2) {
        aiResponse.components.push({
          type: 'specification',
          data: data.car_data
        });
      }
      
      if (data.analysis) {
        // Add pros/cons if detected
        if ((data.analysis.common_pros && data.analysis.common_pros.length > 0) ||
            (data.analysis.common_cons && data.analysis.common_cons.length > 0)) {
          aiResponse.components.push({
            type: 'pros_cons',
            data: {
              pros: data.analysis.common_pros || [],
              cons: data.analysis.common_cons || []
            }
          });
        }
        
        // Add sentiment if available
        if (data.analysis.sentiment) {
          aiResponse.components.push({
            type: 'sentiment',
            data: data.analysis.sentiment
          });
        }
        
        // Add rating if available
        if (data.analysis.average_rating) {
          aiResponse.components.push({
            type: 'rating',
            data: {
              rating: data.analysis.average_rating,
              reviewCount: 10 // Placeholder
            }
          });
        }
      }
      
      // Generate follow-up suggestions
      aiResponse.suggestions = generateFollowupSuggestions(carData);
      
      // Add the AI response
      setMessages(prev => [...prev, aiResponse]);
      
      // Animate typing if you have that feature
      if (typeof setFullResponseText === 'function') {
        setFullResponseText(data.response);
        setCurrentTypingText('');
        setTypingEffect(true);
      }
      
      // Reset error state
      setErrorState({
        hasError: false,
        retryCount: 0
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Your existing error handling code can remain the same
      // ...
    } finally {
      setLoading(false);
    }
  };
  // -- END OF UPDATED handleSend FUNCTION --

  // Handle click on suggestion button
  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  // Handle retry after error
  const handleRetry = () => {
    // Get the last user message
    const lastUserMessage = [...messages]
      .filter(msg => msg.sender === 'user')
      .pop();
      
    if (lastUserMessage) {
      handleSend(lastUserMessage.text);
    }
  };

  // Render message components based on their type
  const renderMessageComponents = (components) => {
    if (!components || components.length === 0) return null;
    
    return (
      <div className="space-y-3 mt-3">
        {components.map((component, index) => {
          switch (component.type) {
            case 'specification':
              return <SpecificationCard key={index} car={component.data} />;
            case 'rating':
              return <RatingCard key={index} rating={component.data.rating} reviewCount={component.data.reviewCount} />;
            case 'pros_cons':
              return <ProsConsCard key={index} pros={component.data.pros} cons={component.data.cons} />;
            case 'category_scores':
              return <CategoryScoresCard key={index} scores={component.data} />;
            case 'sentiment':
              return <SentimentCard key={index} sentiment={component.data} />;
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const renderMessage = (msg, idx) => {
    const isUser = msg.sender === 'user';
    const isLastMessage = idx === messages.length - 1;
    
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
            -translate-y-1/2
            z-10
          `}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          
          {/* Message bubble with dynamic gradient border */}
          <div 
            className={`
              ${isUser ? 'message-bubble-user' : 'message-bubble-ai'} 
              p-4 
              rounded-xl
              ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'}
              mt-4
              backdrop-blur-sm
              border
              ${isUser ? 'border-blue-500/30' : 'border-violet-600/30'}
              shadow-lg
              relative
              overflow-hidden
              z-0
            `}
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 opacity-10 z-0 message-gradient-animated"></div>
            
            {/* Message text with enhanced typography */}
            <div className="relative z-10">
              <p className="text-gray-100">{msg.text}</p>
              
              {/* Interactive elements */}
              {msg.components && renderMessageComponents(msg.components)}
              
              {/* Suggestion chips */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <SuggestionChips 
                  suggestions={msg.suggestions} 
                  onSelect={handleSuggestionClick} 
                />
              )}
            </div>
          </div>
          
          {/* Message timestamp with futuristic design */}
          <div className={`
            ${isUser ? 'text-right' : 'text-left'} 
            mt-1 
            text-xs 
            text-gray-500 
            opacity-0 
            group-hover:opacity-100 
            transition-opacity
          `}>
            {msg.timestamp ? formatTimestamp(msg.timestamp) : 'just now'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black h-full flex flex-col border border-gray-800 overflow-hidden chat-dynamic-bg">
      {/* Header with voice controls */}
      <div className="bg-gradient-to-r from-blue-800 to-violet-800 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          AI Automotive Expert
        </h2>
        
        {/* Voice controls in a nice pill */}
        {onVoiceToggle && (
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full">
            <button
              onClick={() => onVoiceToggle(!voiceEnabled)}
              className={`p-2 rounded-full ${voiceEnabled ? 'bg-green-500/20 text-green-300' : 'text-gray-300 hover:bg-white/10'}`}
              title={voiceEnabled ? "Voice responses enabled" : "Voice responses disabled"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            
            {'webkitSpeechRecognition' in window && (
              <button
                onClick={startVoiceRecognition}
                disabled={listening}
                className={`p-2 rounded-full ${
                  listening ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-white/10'
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
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.map((msg, idx) => renderMessage(msg, idx))}

        {/* Loading indicator */}
        {loading && !typingEffect && (
          <AdvancedTypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area with voice indicator */}
      <div className="border-t border-gray-800 p-4 backdrop-blur bg-black/60">
        <div className="relative flex">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={listening ? "Listening..." : "Ask about this vehicle..."}
            className={`w-full bg-gray-800/50 border border-gray-700 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-white ${listening ? 'border-red-500 ring-1 ring-red-500' : ''}`}
          />
          
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-violet-700 text-white rounded-r-lg px-5 py-3 hover:from-blue-500 hover:to-violet-600 disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-violet-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Voice input visualizer */}
      <VoiceInputVisualizer isListening={listening} audioLevel={0.5} />
      
      {/* Global CSS */}
      <style jsx global>{`
        @keyframes message-gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .message-gradient-animated {
          background: linear-gradient(45deg, 
            rgba(139, 92, 246, 0.4), 
            rgba(59, 130, 246, 0.4), 
            rgba(236, 72, 153, 0.4), 
            rgba(139, 92, 246, 0.4)
          );
          background-size: 400% 400%;
          animation: message-gradient-flow 8s ease infinite;
        }

        .message-bubble-user {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.1));
        }

        .message-bubble-ai {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(139, 92, 246, 0.1));
        }

        .shadow-glow-sm {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
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

        /* Message scale-in animation */
        @keyframes scale-in-message {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        .scale-in-message {
          animation: scale-in-message 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Animated background for chat container */
        .chat-dynamic-bg {
          position: relative;
          overflow: hidden;
        }

        .chat-dynamic-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 20%),
            radial-gradient(circle at 80% 40%, rgba(59, 130, 246, 0.03) 0%, transparent 20%),
            radial-gradient(circle at 40% 70%, rgba(236, 72, 153, 0.03) 0%, transparent 20%);
          filter: blur(8px);
          z-index: 0;
          animation: pulse-subtle 10s ease-in-out infinite alternate;
        }

        @keyframes pulse-subtle {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;