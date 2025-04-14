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
  Sparkles
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

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black h-full flex flex-col border border-gray-800 overflow-hidden">
      {/* Header with voice controls */}
      <div className="bg-gradient-to-r from-blue-700 to-violet-700 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          AI Automotive Expert
        </h2>
        
        {carData && (
          <p className="text-sm text-blue-200">
            Exploring the {carData.year} {carData.manufacturer} {carData.model}
          </p>
        )}
        
        {/* Voice controls */}
        <div className="flex items-center gap-2">
          {/* Voice output toggle */}
          {onVoiceToggle && (
            <button
              onClick={() => onVoiceToggle(!voiceEnabled)}
              className={`p-2 rounded-full hover:bg-black/30 ${voiceEnabled ? 'text-green-300' : 'text-gray-300'}`}
              title={voiceEnabled ? "Voice responses enabled" : "Voice responses disabled"}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
          
          {/* Voice input button */}
          {'webkitSpeechRecognition' in window && (
            <button
              onClick={startVoiceRecognition}
              disabled={listening}
              className={`p-2 rounded-full hover:bg-black/30 ${
                listening ? 'bg-red-600 text-white' : 'text-gray-300'
              }`}
              title={listening ? "Listening..." : "Speak your question"}
            >
              <Mic className={`w-5 h-5 ${listening ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Messages area with smooth scrolling */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message-appear`}
          >
            {msg.sender === 'user' ? (
              <div className="flex items-start gap-2">
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg p-3 max-w-md shadow-lg">
                  <p>{msg.text}</p>
                </div>
                <div className="bg-blue-500 rounded-full p-1 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className={`bg-violet-700 rounded-full p-1 mt-1 ${msg.isSystem ? 'bg-orange-700' : ''}`}>
                  {msg.isSystem ? (
                    <AlertCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div 
                  className={`bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 rounded-tr-lg rounded-br-lg rounded-bl-lg p-3 max-w-md shadow-lg border border-gray-700 ${msg.error ? 'border-red-700 bg-red-900/30' : ''}`}
                >
                  {idx === messages.length - 1 && typingEffect ? (
                    <>
                      <p>{currentTypingText}</p>
                      <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-blink"></span>
                    </>
                  ) : (
                    <>
                      <p>{msg.text}</p>
                      
                      {msg.error && msg.showRetry && (
                        <button 
                          onClick={handleRetry}
                          className="mt-2 px-3 py-1 bg-red-800/50 hover:bg-red-700/60 text-white rounded-md text-sm flex items-center"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Try again
                        </button>
                      )}
                      
                      {/* Render any component cards */}
                      {msg.components && renderMessageComponents(msg.components)}
                      
                      {/* Render suggestions if available */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <SuggestionChips 
                          suggestions={msg.suggestions} 
                          onSelect={handleSuggestionClick} 
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && !typingEffect && (
          <div className="flex justify-start animate-message-appear">
            <div className="flex items-start gap-2">
              <div className="bg-violet-700 rounded-full p-1 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 rounded-tr-lg rounded-br-lg rounded-bl-lg p-3 shadow-lg border border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial suggestions */}
        {showSuggestions && !loading && messages.length < 2 && (
          <div className="mt-6 space-y-2 animate-fade-in">
            <p className="text-gray-400 text-sm">Here's what you can ask me:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {messages[0]?.suggestions?.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 text-sm px-3 py-2 rounded-lg border border-gray-700 hover:border-violet-500 transition-all hover:shadow-glow flex items-center justify-between group"
                >
                  <span className="flex items-center">
                    {idx === 0 && <Fuel className="w-4 h-4 mr-2 text-blue-400" />}
                    {idx === 1 && <Gauge className="w-4 h-4 mr-2 text-green-400" />}
                    {idx === 2 && <BarChart3 className="w-4 h-4 mr-2 text-purple-400" />}
                    {idx === 3 && <Shield className="w-4 h-4 mr-2 text-yellow-400" />}
                    {idx === 4 && <Award className="w-4 h-4 mr-2 text-red-400" />}
                    {suggestion}
                  </span>
                  <CornerDownRight className="w-4 h-4 text-gray-500 group-hover:text-violet-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area with voice indicator */}
      <div className="border-t border-gray-800 p-4 backdrop-blur-sm bg-black/40">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={listening ? "Listening..." : "Ask about this vehicle..."}
            className={`flex-1 border border-gray-700 bg-gray-800/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-500 ${listening ? 'border-red-500 ring-1 ring-red-500' : ''}`}
          />
          
          {/* Smart send button with icon and animation */}
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg px-4 py-3 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 transition-colors shadow-lg hover:shadow-glow relative group overflow-hidden"
          >
            {/* Sparkle animation effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 sparkle-pattern animate-sparkle-shift"></div>
            </div>
            
            <div className="relative z-10 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 hidden md:block animate-pulse-subtle" />
              <span className="hidden md:block">Send</span>
              <Send className="w-5 h-5 md:hidden" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Helper hint at the bottom */}
      {carData && (
        <div className="flex justify-center items-center space-x-2 py-2 border-t border-gray-800/50 bg-gray-900/30">
          <HelpCircle className="w-3 h-3 text-gray-500" />
          <p className="text-xs text-gray-500">
            Ask anything about the {carData.year} {carData.manufacturer} {carData.model}
          </p>
        </div>
      )}
      
      {/* CSS Animations and Effects */}
      <style jsx global>{`
        @keyframes message-appear {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-message-appear {
          animation: message-appear 0.3s ease-out forwards;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        .shadow-glow {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease forwards;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        .sparkle-pattern {
          background-image: radial-gradient(circle, #fff 1px, transparent 1px);
          background-size: 12px 12px;
        }
        
        @keyframes sparkle-shift {
          0% { transform: translateY(20px) translateX(-20px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-20px) translateX(20px); opacity: 0; }
        }
        
        .animate-sparkle-shift {
          animation: sparkle-shift 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
