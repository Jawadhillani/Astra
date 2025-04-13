'use client'
import { useState, useRef, useEffect } from 'react';
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
  Mic
} from 'lucide-react';

// Import the visual components for chat
import { 
  SpecificationCard, 
  RatingCard, 
  ProsConsCard, 
  CategoryScoresCard, 
  SentimentCard 
} from './ChatComponents';

/**
 * Enhanced chat interface with the following features:
 * - Typing effect for assistant messages
 * - Visual component cards for car data
 * - Suggested questions
 * - Smart error handling
 * - Voice capability integration
 */
const EnhancedChatInterface = ({ 
  carId, 
  voiceEnabled = false, 
  onSpeakResponse = null,
  listening = false
}) => {
  // State management
  const [messages, setMessages] = useState([
    { 
      text: "👋 Hello! I'm your AI automotive expert. How can I help you explore this vehicle?", 
      sender: 'ai',
      suggestions: [
        "What's the fuel economy like?", 
        "Tell me about the engine specs", 
        "How does it compare to competitors?", 
        "What are the safety features?", 
        "Is this car reliable?"
      ]
    }
  ]);
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch car data when component mounts
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carId) return;

      try {
        const response = await fetch(`/api/cars/${carId}`);
        if (response.ok) {
          const data = await response.json();
          setCarData(data);
        }
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };

    fetchCarData();
  }, [carId]);

  // Listen for voice transcript events
  useEffect(() => {
    const handleVoiceTranscript = (event) => {
      const { transcript } = event.detail;
      if (transcript) {
        setInput(transcript);
        handleSend(transcript);
      }
    };
    
    document.addEventListener('voiceTranscript', handleVoiceTranscript);
    
    return () => {
      document.removeEventListener('voiceTranscript', handleVoiceTranscript);
    };
  }, []);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTypingText]);

  // Focus input field when component mounts
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  // Typing effect animation
  useEffect(() => {
    if (typingEffect && fullResponseText) {
      if (currentTypingText.length < fullResponseText.length) {
        const timeout = setTimeout(() => {
          setCurrentTypingText(fullResponseText.substring(0, currentTypingText.length + 3));
        }, 10);
        return () => clearTimeout(timeout);
      } else {
        setTypingEffect(false);
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

  // Send message to API
  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          car_id: carId,
          conversation_history: messages.filter(m => m.sender === 'user').map(m => m.text)
        })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      // Create an AI response with components based on the analysis
      const aiResponse = { 
        text: '', 
        sender: 'ai',
        components: []
      };
      
      // If we received analysis data, add appropriate visual components
      if (data.analysis) {
        // Add car spec card if this is the first detailed response
        if (data.car_data && messages.length <= 2) {
          aiResponse.components.push({
            type: 'specification',
            data: data.car_data
          });
        }
        
        // If there are category scores in the analysis, add a score card
        if (data.analysis.category_scores && 
            Object.keys(data.analysis.category_scores).length > 0) {
          aiResponse.components.push({
            type: 'category_scores',
            data: data.analysis.category_scores
          });
        }
        
        // If there are pros/cons, add that component
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
        
        // If there's sentiment analysis, add that component
        if (data.analysis.sentiment) {
          aiResponse.components.push({
            type: 'sentiment',
            data: data.analysis.sentiment
          });
        }
        
        // If there's an average rating, add a rating card
        if (data.analysis.average_rating) {
          aiResponse.components.push({
            type: 'rating',
            data: {
              rating: data.analysis.average_rating,
              reviewCount: data.analysis.sentiment ? 
                Object.values(data.analysis.sentiment).reduce((a, b) => a + b, 0) : 0
            }
          });
        }
      } else if (data.car_data && messages.length <= 2) {
        // If no analysis but we have car data for first response
        aiResponse.components.push({
          type: 'specification',
          data: data.car_data
        });
      }
      
      // Generate follow-up questions based on the context and add as suggestions
      aiResponse.suggestions = generateSuggestions({
        carData: data.car_data, 
        intent: data.intent?.primaryIntent,
        conversationLength: messages.filter(m => m.sender === 'user').length
      });
      
      // Add the AI response to messages
      setMessages(prev => [...prev, aiResponse]);
      
      // Start typing effect
      setFullResponseText(data.response);
      setCurrentTypingText('');
      setTypingEffect(true);
      
      // Reset error state
      setErrorState({
        hasError: false,
        retryCount: 0
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Increment retry count
      const newRetryCount = errorState.retryCount + 1;
      setErrorState({
        hasError: true,
        retryCount: newRetryCount
      });
      
      // Generate a friendly error message based on retry count
      let errorMessage = '';
      
      if (newRetryCount === 1) {
        errorMessage = "I'm having trouble accessing information about this vehicle. Let me try again...";
      } else if (newRetryCount === 2) {
        errorMessage = "I apologize for the difficulty. My connection to the vehicle database seems unstable right now.";
      } else {
        errorMessage = "I'm very sorry, but I'm unable to connect to our automotive database at the moment. I can still chat about general car topics or answer basic questions about this model based on what I already know.";
      }
      
      // Add error message with retry option
      setMessages(prev => [...prev, { 
        text: errorMessage, 
        sender: 'ai',
        error: true,
        // Only show retry button for first two errors
        showRetry: newRetryCount < 3,
        // Add car name if we have it
        carName: carData ? `${carData.year} ${carData.manufacturer} ${carData.model}` : null
      }]);
      
      // If we've failed three times, show alternative suggestions
      if (newRetryCount >= 3 && carData) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: `I can still tell you general information about the ${carData.year} ${carData.manufacturer} ${carData.model} based on my automotive knowledge. What would you like to know?`, 
            sender: 'ai',
            suggestions: [
              "Tell me about this car model",
              "What's this car known for?",
              "Common issues with this model",
              "What should I look for when buying?"
            ]
          }]);
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

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
    <div className="bg-gradient-to-b from-gray-900 to-black h-full flex flex-col border border-gray-800">
      <div className="bg-gradient-to-r from-blue-700 to-violet-700 text-white p-4">
        <h2 className="text-xl font-bold flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          AI Automotive Expert
        </h2>
        {carData && (
          <p className="text-sm text-blue-200 mt-1">
            Exploring the {carData.year} {carData.manufacturer} {carData.model}
          </p>
        )}
      </div>

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
                <div className="bg-violet-700 rounded-full p-1 mt-1">
                  <Bot className="w-4 h-4 text-white" />
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
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 text-xs px-3 py-1.5 rounded-full border border-gray-700 hover:border-violet-500 transition-all hover:shadow-glow flex items-center"
                            >
                              <CornerDownRight className="w-3 h-3 mr-1 text-violet-400" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

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

        {showSuggestions && !loading && messages.length < 2 && (
          <div className="mt-6 space-y-2 animate-fade-in">
            <p className="text-gray-400 text-sm">Here's what you can ask me:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {messages[0].suggestions.map((suggestion, idx) => (
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
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg px-4 py-3 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 transition-colors shadow-lg hover:shadow-glow"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Subtle feature hint at the bottom */}
      {carData && (
        <div className="flex justify-center items-center space-x-2 py-2 border-t border-gray-800/50 bg-gray-900/30">
          <HelpCircle className="w-3 h-3 text-gray-500" />
          <p className="text-xs text-gray-500">
            Ask anything about the {carData.year} {carData.manufacturer} {carData.model}
          </p>
        </div>
      )}
      
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
      `}</style>
    </div>
  );
};

/**
 * Generate follow-up suggestions based on conversation context
 * 
 * @param {object} context - Current conversation context
 * @returns {array} - Array of suggested questions
 */
function generateSuggestions(context) {
  const { carData, intent, conversationLength } = context;
  
  // Default suggestions if we have no context
  if (!carData) {
    return [
      "What cars do you recommend?",
      "Tell me about SUVs",
      "What are the most fuel-efficient cars?",
      "What should I look for when buying a used car?",
      "What are the safest family vehicles?"
    ];
  }
  
  // Generate car-specific suggestions
  const carName = `${carData.year} ${carData.manufacturer} ${carData.model}`;
  
  // If this is early in the conversation, suggest basic questions
  if (conversationLength <= 2) {
    return [
      `What's the fuel economy like for the ${carName}?`,
      `Tell me about the engine in the ${carName}`,
      `How comfortable is the ${carName}?`,
      `What are the safety features in the ${carName}?`,
      `Is the ${carName} reliable?`
    ];
  }
  
  // Generate suggestions based on the last intent
  switch (intent) {
    case 'fuel_economy':
      return [
        `How does the ${carName}'s fuel economy compare to competitors?`,
        `What's the driving range of the ${carName}?`,
        `Does the ${carName} require premium fuel?`,
        `Are there any fuel-saving features in the ${carName}?`
      ];
    case 'performance':
      return [
        `What's the horsepower of the ${carName}?`,
        `How does the ${carName} handle in different conditions?`,
        `What's the 0-60 time for the ${carName}?`,
        `How is the braking performance of the ${carName}?`
      ];
    case 'reliability':
      return [
        `What are common issues with the ${carName}?`,
        `How long do ${carData.manufacturer} vehicles typically last?`,
        `What's the warranty coverage for the ${carName}?`,
        `Is the ${carName} expensive to maintain?`
      ];
    case 'safety':
      return [
        `What safety ratings does the ${carName} have?`,
        `Does the ${carName} have advanced driver assistance?`,
        `How many airbags does the ${carName} have?`,
        `Is the ${carName} a good family vehicle?`
      ];
    default:
      // General follow-up questions
      return [
        `How does the ${carName} compare to similar vehicles?`,
        `What are owners saying about the ${carName}?`,
        `What are the pros and cons of the ${carName}?`,
        `Would you recommend the ${carName}?`
      ];
  }
}

// Export the component
export const Enhanced = EnhancedChatInterface;
export default EnhancedChatInterface;