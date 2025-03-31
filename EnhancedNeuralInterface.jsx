// components/EnhancedNeuralInterface.jsx
'use client'
import { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit } from 'lucide-react';

export default function EnhancedNeuralInterface({ carId }) {
  const [messages, setMessages] = useState([
    { 
      text: "Welcome to DataHive Automotive. I can answer questions with both text and visualizations. How can I help you?", 
      sender: 'ai',
      type: 'text' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user', type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Make sure this URL matches your API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          car_id: carId,
          conversation_history: messages
            .filter(m => m.sender === 'user')
            .map(m => m.text)
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        text: data.response, 
        sender: 'ai',
        type: 'text'
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error processing your request: ' + error.message, 
        sender: 'ai',
        type: 'text',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (message) => {
    return <p>{message.text}</p>;
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden flex flex-col h-[450px] border border-gray-800">
      <div className="bg-gradient-to-r from-blue-900 to-violet-900 p-4">
        <h2 className="text-lg font-bold flex items-center">
          <BrainCircuit className="w-5 h-5 mr-2" />
          DataHive Neural Interface
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-800 text-gray-200 rounded-bl-none'
              } ${msg.error ? 'bg-red-900 text-red-100' : ''}`}
            >
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3 rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-800 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this vehicle or explore data connections..."
            className="flex-1 border border-gray-700 bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg px-4 py-2 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
