'use client'
import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatInterface from './ChatInterface';  // Using your existing ChatInterface
import AnimatedChatButton from './AnimatedChatButton';

/**
 * ChatIntegration component that provides:
 * 1. A floating chat button with animations
 * 2. A modal that appears when the button is clicked
 * 3. Integration with your existing ChatInterface
 */
const ChatIntegration = ({ carId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl h-[80vh] animate-scale-in">
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
              <ChatInterface carId={carId} />
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