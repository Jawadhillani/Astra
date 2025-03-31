'use client'
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import ChatInterface from './ChatInterface'; // Import your existing ChatInterface component

const AnimatedChatButton = ({ carId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const expandedRef = useRef(null);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && 
          expandedRef.current && 
          !expandedRef.current.contains(event.target) &&
          !event.target.closest('.chat-button')) {
        handleClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Lock body scroll when chat is expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  // Handle button click
  const handleButtonClick = () => {
    setIsExpanded(true);
  };

  // Handle close
  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsAnimatingOut(false);
    }, 500); // Match the CSS animation duration
  };

  return (
    <>
      {/* The RGB glowing button with Robot Animation */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-40">
          {/* Robot Animation (hovering above the button) */}
          <div className="robot-container absolute -top-24 left-1/2 -translate-x-1/2 z-10">
            {/* Robot Head */}
            <div className="robot-head w-16 h-16 relative">
              {/* Robot face */}
              <div className="robot-face bg-gradient-to-b from-slate-700 to-slate-900 w-full h-full rounded-xl relative overflow-hidden border-2 border-slate-600 shadow-lg">
                {/* Eyes */}
                <div className="eyes-container absolute top-3 left-0 right-0 flex justify-center gap-3">
                  <div className="eye w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] animate-robot-eye"></div>
                  <div className="eye w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] animate-robot-eye-alt"></div>
                </div>
                
                {/* Mouth - animates when speaking/hovered */}
                <div className={`mouth absolute bottom-3 left-0 right-0 mx-auto w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_2px_rgba(34,211,238,0.7)] ${isHovered ? 'animate-robot-talk' : ''}`}></div>
                
                {/* Circuit lines */}
                <div className="circuit absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
                  <div className="line-h w-full h-[1px] bg-cyan-400 absolute top-1/4"></div>
                  <div className="line-h w-full h-[1px] bg-cyan-400 absolute top-3/4"></div>
                  <div className="line-v w-[1px] h-full bg-cyan-400 absolute left-1/4"></div>
                  <div className="line-v w-[1px] h-full bg-cyan-400 absolute left-3/4"></div>
                </div>
              </div>
              
              {/* Robot antenna */}
              <div className="antenna absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-4 bg-slate-600">
                <div className="antenna-light w-2 h-2 rounded-full bg-cyan-400 absolute -top-1 left-1/2 -translate-x-1/2 animate-pulse shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"></div>
              </div>
              
              {/* Robot ears */}
              <div className="ear absolute top-1/2 -left-1 w-1 h-6 bg-slate-600 -translate-y-1/2 rounded-l-sm"></div>
              <div className="ear absolute top-1/2 -right-1 w-1 h-6 bg-slate-600 -translate-y-1/2 rounded-r-sm"></div>
            </div>
            
            {/* Speech lines connecting to button (animated) */}
            <div className="speech-connector absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gradient-to-b from-cyan-400 to-transparent">
              <div className="speech-dot absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-speech-dot-1"></div>
              <div className="speech-dot absolute top-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-speech-dot-2"></div>
              <div className="speech-dot absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-speech-dot-3"></div>
            </div>
          </div>
          
          {/* Energy waves around the robot */}
          <div className="energy-waves absolute -top-24 left-1/2 -translate-x-1/2 w-28 h-28 -z-10">
            <div className="wave absolute inset-0 rounded-full border border-cyan-400 opacity-0 animate-energy-wave"></div>
            <div className="wave absolute inset-0 rounded-full border border-fuchsia-400 opacity-0 animate-energy-wave-2"></div>
            <div className="wave absolute inset-0 rounded-full border border-purple-400 opacity-0 animate-energy-wave-3"></div>
          </div>
          
          {/* Floating particles */}
          <div className="particles absolute -top-20 left-1/2 -translate-x-1/2 w-24 h-24 -z-10">
            <div className="particle absolute w-1 h-1 bg-blue-400 rounded-full animate-float-1"></div>
            <div className="particle absolute w-1 h-1 bg-purple-400 rounded-full animate-float-2"></div>
            <div className="particle absolute w-1 h-1 bg-pink-400 rounded-full animate-float-3"></div>
            <div className="particle absolute w-1 h-1 bg-cyan-400 rounded-full animate-float-4"></div>
          </div>
          
          {/* The actual button */}
          <button 
            onClick={handleButtonClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="chat-button relative px-6 py-4 rounded-2xl flex items-center shadow-2xl animated-rgb-border group"
          >
            {/* Cybernetic circuit background */}
            <div className="circuit-pattern absolute inset-0 rounded-2xl overflow-hidden opacity-20">
              <div className="h-line absolute top-1/4 left-0 right-0 h-[1px] bg-cyan-400"></div>
              <div className="h-line absolute top-3/4 left-0 right-0 h-[1px] bg-cyan-400"></div>
              <div className="v-line absolute left-1/4 top-0 bottom-0 w-[1px] bg-cyan-400"></div>
              <div className="v-line absolute left-3/4 top-0 bottom-0 w-[1px] bg-cyan-400"></div>
              <div className="circuit-node absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-cyan-500"></div>
              <div className="circuit-node absolute top-1/4 left-3/4 w-1 h-1 rounded-full bg-purple-500"></div>
              <div className="circuit-node absolute top-3/4 left-1/4 w-1 h-1 rounded-full bg-fuchsia-500"></div>
              <div className="circuit-node absolute top-3/4 left-3/4 w-1 h-1 rounded-full bg-blue-500"></div>
            </div>
            
            {/* AI Icon with energy core */}
            <div className="ai-icon relative mr-3 w-10 h-10 flex items-center justify-center">
              <div className="ai-core absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 rounded-full opacity-80 animate-pulse-slow"></div>
              <div className="ai-rings absolute inset-0">
                <div className="ring absolute inset-2 border-2 border-white/20 rounded-full"></div>
                <div className="ring absolute inset-3 border border-white/40 rounded-full animate-spin-slow"></div>
              </div>
              <div className="ai-center w-3 h-3 bg-white rounded-full shadow-[0_0_10px_5px_rgba(255,255,255,0.5)] z-10"></div>
              <div className="ai-pulse absolute inset-0 rounded-full bg-transparent border-2 border-white/50 scale-100 opacity-0 animate-ai-pulse"></div>
            </div>
            
            {/* Text with gradient */}
            <div className="flex flex-col">
              <span className="font-medium text-white text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-blue-500 group-hover:to-purple-600 transition-all duration-500">
                Chat with AI
              </span>
              <span className="text-xs text-cyan-300 opacity-80">Automotive Expert</span>
            </div>
            
            {/* Energy pulses (only visible on hover) */}
            <div className={`energy-pulse absolute inset-0 rounded-2xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="pulse absolute inset-0 rounded-2xl border border-cyan-500 animate-energy-pulse"></div>
              <div className="pulse absolute inset-0 rounded-2xl border border-blue-500 animate-energy-pulse-delay"></div>
            </div>
          </button>
        </div>
      )}

      {/* The expanded full-screen chat interface */}
      {isExpanded && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${isAnimatingOut ? 'animate-fade-out' : 'animate-fade-in'}`}
        >
          <div 
            ref={expandedRef}
            className={`chat-container bg-dark-surface rounded-xl shadow-2xl border border-gray-800 relative
                       ${isAnimatingOut ? 'animate-scale-out' : 'animate-scale-in'}`}
          >
            <button 
              onClick={handleClose} 
              className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white bg-gray-800/50 backdrop-blur-sm p-2 rounded-full transition-all hover:bg-gray-700/70"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full h-full">
              <ChatInterface carId={carId} />
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        /* RGB Border Animation */
        .animated-rgb-border {
          position: relative;
          background: linear-gradient(45deg, #0c111f, #162046);
          z-index: 1;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .animated-rgb-border:before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, 
            #ff00cc, #3393ff, #00ffe7, #22edda, 
            #00c3ff, #002bff, #7a00ff, #ff00c8, #ff00cc);
          background-size: 400%;
          animation: rgb-border 8s linear infinite;
          filter: blur(8px);
          opacity: 0.7;
          border-radius: 16px;
        }
        
        .animated-rgb-border:hover:before {
          filter: blur(5px);
          opacity: 1;
          animation: rgb-border 5s linear infinite;
        }
        
        .animated-rgb-border:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.7);
        }
        
        /* Robot animations */
        .robot-container {
          animation: hover-float 3s ease-in-out infinite;
        }
        
        @keyframes hover-float {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-8px) translateX(-50%); }
        }
        
        @keyframes robot-eye {
          0%, 90%, 100% { opacity: 1; transform: scale(1); }
          95% { opacity: 0.5; transform: scale(0.8); }
        }
        
        @keyframes robot-eye-alt {
          0%, 85%, 100% { opacity: 1; transform: scale(1); }
          90% { opacity: 0.5; transform: scale(0.8); }
        }
        
        @keyframes robot-talk {
          0%, 100% { height: 2px; width: 8px; }
          25% { height: 4px; width: 10px; }
          50% { height: 2px; width: 8px; }
          75% { height: 4px; width: 10px; }
        }
        
        @keyframes speech-dot-1 {
          0%, 100% { opacity: 0; }
          25% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes speech-dot-2 {
          0%, 100% { opacity: 0; }
          35% { opacity: 1; }
          60% { opacity: 0; }
        }
        
        @keyframes speech-dot-3 {
          0%, 100% { opacity: 0; }
          45% { opacity: 1; }
          70% { opacity: 0; }
        }
        
        @keyframes energy-wave {
          0% { transform: scale(0.5); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes energy-wave-2 {
          0% { transform: scale(0.5); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes energy-wave-3 {
          0% { transform: scale(0.5); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          25% { opacity: 1; }
          50% { transform: translate(-10px, -15px); }
          75% { opacity: 0.5; }
          100% { transform: translate(-15px, -20px); opacity: 0; }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          25% { opacity: 1; }
          50% { transform: translate(10px, -15px); }
          75% { opacity: 0.5; }
          100% { transform: translate(15px, -20px); opacity: 0; }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          25% { opacity: 1; }
          50% { transform: translate(-5px, -20px); }
          75% { opacity: 0.5; }
          100% { transform: translate(-8px, -25px); opacity: 0; }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          25% { opacity: 1; }
          50% { transform: translate(5px, -20px); }
          75% { opacity: 0.5; }
          100% { transform: translate(8px, -25px); opacity: 0; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes ai-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes energy-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        
        @keyframes energy-pulse-delay {
          0% { transform: scale(1); opacity: 0; }
          25% { opacity: 0.7; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        
        /* Animation utilities */
        .animate-robot-eye {
          animation: robot-eye 4s infinite;
        }
        
        .animate-robot-eye-alt {
          animation: robot-eye-alt 4s infinite;
        }
        
        .animate-robot-talk {
          animation: robot-talk 0.8s infinite;
        }
        
        .animate-speech-dot-1 {
          animation: speech-dot-1 1.5s infinite;
        }
        
        .animate-speech-dot-2 {
          animation: speech-dot-2 1.5s infinite;
        }
        
        .animate-speech-dot-3 {
          animation: speech-dot-3 1.5s infinite;
        }
        
        .animate-energy-wave {
          animation: energy-wave 3s infinite;
        }
        
        .animate-energy-wave-2 {
          animation: energy-wave-2 3s infinite 0.5s;
        }
        
        .animate-energy-wave-3 {
          animation: energy-wave-3 3s infinite 1s;
        }
        
        .animate-float-1 {
          animation: float-1 4s infinite;
        }
        
        .animate-float-2 {
          animation: float-2 4s infinite 0.7s;
        }
        
        .animate-float-3 {
          animation: float-3 4s infinite 1.3s;
        }
        
        .animate-float-4 {
          animation: float-4 4s infinite 1.9s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-ai-pulse {
          animation: ai-pulse 2s infinite;
        }
        
        .animate-energy-pulse {
          animation: energy-pulse 2s infinite;
        }
        
        .animate-energy-pulse-delay {
          animation: energy-pulse-delay 2s infinite 1s;
        }
        
        /* Fade animations for the overlay */
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        
        .animate-fade-out {
          animation: fadeOut 0.5s ease forwards;
        }
        
        /* Scale animations for the chat container */
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-scale-out {
          animation: scaleOut 0.5s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
        }
        
        .chat-container {
          width: 90vw;
          height: 90vh;
          max-width: 1200px;
        }
        
        /* Keyframes for all animations */
        @keyframes rgb-border {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes scaleOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.5); opacity: 0; }
        }
        
        /* Particle positions */
        .particle:nth-child(1) {
          top: 20%;
          left: 20%;
        }
        
        .particle:nth-child(2) {
          top: 30%;
          left: 70%;
        }
        
        .particle:nth-child(3) {
          top: 70%;
          left: 35%;
        }
        
        .particle:nth-child(4) {
          top: 60%;
          left: 80%;
        }
      `}</style>
    </>
  );
};

export default AnimatedChatButton;