'use client'

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CornerDownRight, ChevronRight, Car, Zap, Shield, Star } from 'lucide-react';
import { 
  SpecificationCard, 
  RatingCard, 
  ProsConsCard, 
  CategoryScoresCard, 
  SentimentCard 
} from './ChatComponents';

export default function ChatInterface({ carId }) {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your automotive expert assistant. Ask me anything about this vehicle!", 
      sender: 'ai',
      suggestions: ["What's the fuel economy like?", "How does it handle in the city?", "What are the safety features?", "How reliable is this model?", "What's the cargo capacity?"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [carData, setCarData] = useState(null);
  const [typingEffect, setTypingEffect] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [fullResponseText, setFullResponseText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTypingText]);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  useEffect(() => {
    if (typingEffect && fullResponseText) {
      if (currentTypingText.length < fullResponseText.length) {
        const timeout = setTimeout(() => {
          setCurrentTypingText(fullResponseText.substring(0, currentTypingText.length + 1));
        }, 15);
        return () => clearTimeout(timeout);
      } else {
        setTypingEffect(false);
        const newMessages = [...messages];
        newMessages[newMessages.length - 1].text = fullResponseText;
        setMessages(newMessages);
        setFullResponseText('');
        setCurrentTypingText('');
      }
    }
  }, [typingEffect, currentTypingText, fullResponseText]);

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
          conversation_history: messages.slice(1)
        })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      const aiResponse = { text: '', sender: 'ai' };
      setMessages(prev => [...prev, aiResponse]);
      setFullResponseText(data.response);
      setCurrentTypingText('');
      setTypingEffect(true);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error processing your request. The AI chat feature is still in development.', 
        sender: 'ai',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-800">
      <div className="bg-gradient-to-r from-blue-700 to-violet-700 text-white p-4">
        <h2 className="text-xl font-bold flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          AI Car Expert Chat
        </h2>
        {carData && (
          <p className="text-sm text-blue-200 mt-1">
            Chatting about {carData.year} {carData.manufacturer} {carData.model}
          </p>
        )}
      </div>

      {carData && (
        <div className="px-4 pt-4 animate-fade-in">
          <SpecificationCard car={carData} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message-appear`}>
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
                    <p>{msg.text}</p>
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
            <p className="text-gray-400 text-sm">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {messages[0].suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 text-sm px-3 py-1.5 rounded-full border border-gray-700 hover:border-violet-500 transition-all hover:shadow-glow"
                >
                  {suggestion}
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
            placeholder="Ask about this car..."
            className="flex-1 border border-gray-700 bg-gray-800/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-500"
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
    </div>
  );
}
