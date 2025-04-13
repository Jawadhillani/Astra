'use client'
import React, { useState } from 'react';
import { MessageSquare, Bot, Zap, Shield } from 'lucide-react';

const AnimatedChatButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* The robot head that hovers above the button */}
      <div className="robot-container absolute -top-16 left-1/2 -translate-x-1/2 z-10">
        {/* Robot Head */}
        <div className="robot-head w-12 h-12 relative">
          <div className="robot-face bg-gradient-to-b from-gray-700 to-gray-900 w-full h-full rounded-lg relative overflow-hidden border-2 border-gray-600 shadow-lg">
            {/* Eyes */}
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-2">
              <div className="eye w-2 h-2 rounded-full bg-blue-400 shadow-glow animate-robot-eye"></div>
              <div className="eye w-2 h-2 rounded-full bg-blue-400 shadow-glow animate-robot-eye-alt"></div>
            </div>
            
            {/* Mouth - animates when speaking/hovered */}
            <div className={`mouth absolute bottom-3 left-0 right-0 mx-auto w-5 h-1 bg-blue-400 rounded-full shadow-glow ${isHovered ? 'animate-robot-talk' : ''}`}></div>
          </div>
          
          {/* Antenna */}
          <div className="antenna absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-gray-600">
            <div className="antenna-light w-2 h-2 rounded-full bg-blue-400 absolute -top-1 left-1/2 -translate-x-1/2 animate-pulse shadow-glow"></div>
          </div>
        </div>
        
        {/* Energy waves around the robot */}
        <div className="energy-waves absolute -top-20 left-1/2 -translate-x-1/2 w-20 h-20 -z-10">
          <div className="wave absolute inset-0 rounded-full border border-blue-400 opacity-0 animate-energy-wave"></div>
          <div className="wave absolute inset-0 rounded-full border border-violet-400 opacity-0 animate-energy-wave-2"></div>
        </div>
      </div>
      
      {/* The actual button */}
      <button 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="chat-button relative px-6 py-4 rounded-xl flex items-center shadow-xl animated-rgb-border group"
      >
        {/* AI Icon with energy core */}
        <div className="ai-icon relative mr-3 w-8 h-8 flex items-center justify-center">
          <div className="ai-core absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 rounded-full opacity-80 animate-pulse-slow"></div>
          <div className="ai-rings absolute inset-0">
            <div className="ring absolute inset-2 border border-white/20 rounded-full"></div>
            <div className="ring absolute inset-3 border border-white/40 rounded-full animate-spin-slow"></div>
          </div>
          <Bot className="w-4 h-4 text-white z-10" />
        </div>
        
        {/* Text with gradient */}
        <div className="flex flex-col">
          <span className="font-medium text-white text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-violet-400 group-hover:to-purple-400 transition-all duration-500">
            Chat with AI
          </span>
          <span className="text-xs text-blue-300 opacity-80">Automotive Expert</span>
        </div>
        
        {/* Energy pulses (only visible on hover) */}
        <div className={`energy-pulse absolute inset-0 rounded-xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="pulse absolute inset-0 rounded-xl border border-blue-500 animate-energy-pulse"></div>
          <div className="pulse absolute inset-0 rounded-xl border border-violet-500 animate-energy-pulse-delay"></div>
        </div>
      </button>
      
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
            #3b82f6, #8b5cf6, #d946ef, 
            #3b82f6, #8b5cf6, #d946ef);
          background-size: 400%;
          animation: rgb-border 8s linear infinite;
          filter: blur(8px);
          opacity: 0.7;
          border-radius: 12px;
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
        
        /* Shadow glow effect */
        .shadow-glow {
          box-shadow: 0 0 8px rgba(96, 165, 250, 0.6);
        }
        
        /* Animation keyframes */
        @keyframes rgb-border {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        
        @keyframes energy-wave {
          0% { transform: scale(0.5); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes energy-wave-2 {
          0% { transform: scale(0.5); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
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
          0%, 100% { height: 1px; width: 5px; }
          50% { height: 3px; width: 7px; }
        }
        
        /* Apply animations to elements */
        .robot-container {
          animation: hover-float 3s ease-in-out infinite;
        }
        
        @keyframes hover-float {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-8px) translateX(-50%); }
        }
        
        .animate-robot-eye {
          animation: robot-eye 4s infinite;
        }
        
        .animate-robot-eye-alt {
          animation: robot-eye-alt 4s infinite;
        }
        
        .animate-robot-talk {
          animation: robot-talk 0.8s infinite;
        }
        
        .animate-energy-wave {
          animation: energy-wave 3s infinite;
        }
        
        .animate-energy-wave-2 {
          animation: energy-wave-2 3s infinite 0.5s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-energy-pulse {
          animation: energy-pulse 2s infinite;
        }
        
        .animate-energy-pulse-delay {
          animation: energy-pulse-delay 2s infinite 1s;
        }
      `}</style>
    </div>
  );
};

export default AnimatedChatButton;