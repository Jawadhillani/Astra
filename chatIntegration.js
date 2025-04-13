'use client'
import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, Volume2, Mic } from 'lucide-react';
import AnimatedChatButton from './AnimatedChatButton';

// Import the enhanced chat interface
import { Enhanced as EnhancedChatInterface } from './EnhancedChatInterface';

/**
 * ChatIntegration component that provides:
 * 1. A floating chat button with animations
 * 2. A modal that appears when the button is clicked
 * 3. Integration with the EnhancedChatInterface
 * 4. Voice features (text-to-speech and speech recognition)
 * 
 * This component can be added to any page where you want to provide chat functionality
 */
const ChatIntegration = ({ carId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [carData, setCarData] = useState(null);
  
  // Load car data for better voice interactions
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
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      setRecognition(recognitionInstance);
    }
  }, []);
  
  // Lock body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle close button click
  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };
  
  // Text-to-speech function
  const speakResponse = useCallback((text) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) {
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice options
    utterance.rate = 1.0; // Speed (0.1 to 10)
    utterance.pitch = 1.0; // Pitch (0 to 2)
    utterance.volume = 1.0; // Volume (0 to 1)
    
    // Optional: choose a specific voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Google'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);
  
  // Start voice recognition
  const startVoiceRecognition = useCallback(() => {
    if (!recognition || listening) return;
    
    recognition.onstart = () => {
      setListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      
      // Send the transcript to the chat interface
      // This requires a ref to the chat interface component
      // or using a custom event or context
      document.dispatchEvent(new CustomEvent('voiceTranscript', { 
        detail: { transcript }
      }));
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
      setListening(false);
    };
    
    recognition.onend = () => {
      setListening(false);
    };
    
    recognition.start();
  }, [recognition, listening]);
  
  // Determine if using AnimatedChatButton or a simpler version
  const useAnimatedButton = true; // Set to false for a simpler button
  
  return (
    <>
      {!isOpen && !useAnimatedButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-violet-600 text-white p-4 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden md:inline">Chat with AI</span>
        </button>
      )}
      
      {!isOpen && useAnimatedButton && (
        <AnimatedChatButton 
          carId={carId}
          onClick={() => setIsOpen(true)}
        />
      )}
      
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm ${isAnimatingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`relative w-full max-w-4xl h-[80vh] ${isAnimatingOut ? 'animate-scale-out' : 'animate-scale-in'}`}>
            <div className="absolute -top-12 right-0 flex items-center space-x-3">
              {/* Voice toggle button */}
              <button
                onClick={() => setVoiceEnabled(prev => !prev)}
                className={`p-2 rounded-full transition-colors ${
                  voiceEnabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                title={voiceEnabled ? "Voice responses enabled" : "Voice responses disabled"}
              >
                <Volume2 className="w-5 h-5" />
              </button>
              
              {/* Speech recognition button */}
              {recognition && (
                <button
                  onClick={startVoiceRecognition}
                  disabled={listening}
                  className={`p-2 rounded-full transition-colors ${
                    listening ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={listening ? "Listening..." : "Speak your question"}
                >
                  <Mic className={`w-5 h-5 ${listening ? 'animate-pulse' : ''}`} />
                </button>
              )}
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
              <EnhancedChatInterface 
                carId={carId} 
                voiceEnabled={voiceEnabled}
                onSpeakResponse={speakResponse}
                listening={listening}
              />
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes scale-out {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.9); opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-scale-out {
          animation: scale-out 0.3s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
        }
      `}</style>
    </>
  );
};

export default ChatIntegration;