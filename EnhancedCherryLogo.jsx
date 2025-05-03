import { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Cpu, Brain } from 'lucide-react';

const AdvancedCherryLogo = ({ size = "default", interactive = true }) => {
  // State for animation and interaction effects
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [energyLevel, setEnergyLevel] = useState(0);
  const logoRef = useRef(null);
  const requestRef = useRef(null);
  const previousTimeRef = useRef(0);
  
  // Responsive sizing based on prop
  const sizes = {
    small: "w-12 h-12",
    default: "w-20 h-20",
    large: "w-32 h-32"
  };
  
  const avatarSize = sizes[size] || sizes.default;
  const textClass = size === "small" ? "text-lg" : "text-xl";
  
  // Initialize 3D rotation effect
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e) => {
      if (!logoRef.current || !isHovered) return;
      
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position relative to center
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 15;
      const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * 15;
      
      setRotation({ x: rotateX, y: rotateY });
    };
    
    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
      
      // Gradually increase energy level
      setEnergyLevel(prev => Math.min(prev + 2, 100));
    } else {
      // Reset rotation when not hovered
      setRotation({ x: 0, y: 0 });
      
      // Gradually decrease energy level
      setEnergyLevel(prev => Math.max(prev - 5, 0));
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered, interactive]);
  
  // Handle neural network pulse animation
  useEffect(() => {
    if (!interactive) return;
    
    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        // Animation logic here
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [interactive]);
  
  // Handle click effect - activate special animation
  const handleClick = () => {
    if (!interactive) return;
    setIsClicked(true);
    setEnergyLevel(100); // Boost energy to maximum
    
    // Reset after animation completes
    setTimeout(() => {
      setIsClicked(false);
    }, 2000);
  };
  
  return (
    <div className="flex items-center group">
      {/* Advanced 3D logo */}
      <div 
        ref={logoRef}
        className={`relative ${avatarSize} mr-4 perspective-container cursor-pointer`}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
        onClick={handleClick}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Main neural core with 3D transform effect */}
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: isHovered ? 'transform 0.1s ease' : 'transform 0.5s ease'
          }}
        >
          {/* Neural network core - hexagonal structure */}
          <div 
            className={`absolute inset-0 transition-all duration-500 ${isClicked ? 'scale-110' : ''}`}
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${isHovered ? 10 : 0}px)`
            }}
          >
            {/* Hexagonal outer frame */}
            <div className={`absolute inset-0 transition-all duration-500`}>
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                {/* Outer hexagon */}
                <polygon 
                  points="50,3 97,25 97,75 50,97 3,75 3,25" 
                  className={`stroke-violet-500 fill-violet-900/30 transition-all duration-300 ${
                    isHovered ? 'stroke-violet-400 fill-violet-800/40' : ''
                  } ${isClicked ? 'stroke-violet-300 fill-violet-700/50' : ''}`}
                  strokeWidth="1.5"
                />
                
                {/* Inner central hexagon */}
                <polygon 
                  points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5" 
                  className={`stroke-blue-500 fill-blue-900/40 transition-all duration-300 ${
                    isHovered ? 'stroke-blue-400 fill-blue-800/50' : ''
                  } ${isClicked ? 'stroke-blue-300 fill-blue-700/60' : ''}`}
                  strokeWidth="1.5"
                />
                
                {/* Connection lines */}
                <line x1="50" y1="3" x2="50" y2="25" stroke="#a78bfa" strokeWidth="1" className="neural-line" />
                <line x1="97" y1="25" x2="75" y2="37.5" stroke="#a78bfa" strokeWidth="1" className="neural-line" />
                <line x1="97" y1="75" x2="75" y2="62.5" stroke="#a78bfa" strokeWidth="1" className="neural-line" />
                <line x1="50" y1="97" x2="50" y2="75" stroke="#a78bfa" strokeWidth="1" className="neural-line" />
                <line x1="3" y1="75" x2="25" y2="62.5" stroke="#a78bfa" strokeWidth="1" className="neural-line" />
                <line x1="3" y1="25" x2="25" y2="37.5" stroke="#a78bfa" strokeWidth="1" className="neural-line" />
                
                {/* Neural nodes at corners that pulse */}
                {[
                  [50, 3], [97, 25], [97, 75], [50, 97], [3, 75], [3, 25], // Outer hexagon
                  [50, 25], [75, 37.5], [75, 62.5], [50, 75], [25, 62.5], [25, 37.5] // Inner hexagon
                ].map((pos, i) => (
                  <circle 
                    key={i} 
                    cx={pos[0]} 
                    cy={pos[1]} 
                    r={i < 6 ? 3 : 2} 
                    className={`neural-node fill-indigo-400 transition-all duration-300 ${
                      isHovered ? 'fill-indigo-300' : ''
                    } ${isClicked ? 'fill-white' : ''}`}
                    style={{
                      animation: `nodePulse ${1 + (i % 3) * 0.3}s infinite alternate ${i * 0.1}s`,
                      filter: `blur(${isClicked ? 2 : 0}px) drop-shadow(0 0 ${isClicked ? 4 : 2}px ${isClicked ? '#ffffff' : '#a78bfa'})`
                    }}
                  />
                ))}
                
                {/* Animated energy path */}
                <path 
                  d="M50,25 C60,30 70,25 75,37.5 C80,50 70,55 75,62.5 C70,70 60,70 50,75 C40,70 30,70 25,62.5 C20,55 30,50 25,37.5 C30,25 40,30 50,25" 
                  fill="none" 
                  stroke="#93c5fd" 
                  strokeWidth="1" 
                  className="energy-path" 
                  strokeDasharray="30"
                  strokeDashoffset={isHovered ? "60" : "0"}
                  style={{
                    animation: `energyFlow 3s linear infinite ${isHovered ? 'running' : 'paused'}`
                  }}
                />
                
                {/* Central core - neural brain visualization */}
                <g transform="translate(37.5, 37.5) scale(0.25)">
                  <path 
                    d="M50,20 C70,5 85,25 95,45 C105,65 95,85 75,95 C55,105 35,95 25,75 C15,55 30,35 50,20" 
                    className={`fill-violet-600/80 transition-all duration-300 ${
                      isHovered ? 'fill-violet-500/90' : ''
                    } ${isClicked ? 'fill-white/90' : ''}`}
                    style={{
                      animation: isHovered ? 'corePulse 1.5s infinite alternate' : 'none'
                    }}
                  />
                  
                  {/* Neural connections */}
                  {[...Array(6)].map((_, i) => (
                    <path 
                      key={i}
                      d={`M50,50 C${60 + i * 5},${30 + i * 3} ${80 - i * 4},${40 + i * 5} ${60 + i * 3},${70 - i * 2}`}
                      fill="none" 
                      className={`stroke-blue-300/60 transition-all duration-300 ${
                        isHovered ? 'stroke-blue-200/70' : ''
                      } ${isClicked ? 'stroke-white/90' : ''}`}
                      strokeWidth="1"
                      style={{
                        animation: isHovered ? `neuralPulse ${1 + i * 0.2}s infinite alternate ${i * 0.1}s` : 'none'
                      }}
                    />
                  ))}
                </g>
              </svg>
            </div>
            
            {/* Holographic projection effect */}
            <div 
              className={`absolute inset-0 transition-all duration-500 ${
                isHovered ? 'opacity-70' : 'opacity-0'
              } ${isClicked ? 'opacity-90' : ''}`}
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
                transform: `translateZ(${isHovered ? 15 : 5}px)`,
                animation: isHovered ? 'hologramFlicker 3s infinite' : 'none'
              }}
            ></div>
            
            {/* Energy halo */}
            <div 
              className={`absolute -inset-4 rounded-full blur-lg transition-opacity duration-500 ${
                isHovered ? 'opacity-60' : 'opacity-10'
              } ${isClicked ? 'opacity-100' : ''}`}
              style={{
                background: `radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(16, 185, 129, 0) 70%)`,
                transform: 'translateZ(-5px)',
                animation: isHovered ? 'haloExpand 2s infinite alternate' : 'none'
              }}
            ></div>
          </div>
          
          {/* Floating particles that orbit around the core */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className={`absolute rounded-full bg-indigo-400/60 transition-all duration-300 ${
                isHovered ? 'bg-indigo-300/70' : ''
              } ${isClicked ? 'bg-white/80' : ''}`}
              style={{
                width: `${2 + i % 2}px`,
                height: `${2 + i % 2}px`,
                left: `${50 + Math.cos(i * Math.PI / 3) * 40}%`,
                top: `${50 + Math.sin(i * Math.PI / 3) * 40}%`,
                filter: `blur(${isClicked ? 2 : 1}px)`,
                boxShadow: `0 0 ${isClicked ? 8 : 4}px ${isClicked ? 'rgba(255, 255, 255, 0.8)' : 'rgba(139, 92, 246, 0.6)'}`,
                animation: `orbitParticle ${3 + i * 0.5}s linear infinite ${isHovered ? 'normal' : 'paused'}`
              }}
            ></div>
          ))}
        </div>
        
        {/* Surrounding orbital rings */}
        <div 
          className={`absolute inset-0 transition-all duration-500`}
          style={{
            transform: `rotateX(${rotation.x * 0.5}deg) rotateY(${rotation.y * 0.5}deg) rotateZ(${isHovered ? 30 : 0}deg)`,
          }}
        >
          <div className={`absolute inset-2 rounded-full border border-indigo-500/30 transition-opacity duration-300 ${
            isHovered ? 'opacity-80' : 'opacity-30'
          } ${isClicked ? 'opacity-100' : ''}`}
            style={{
              animation: 'spin 10s linear infinite',
            }}
          ></div>
          <div className={`absolute inset-4 rounded-full border border-purple-500/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-80' : 'opacity-20'
          } ${isClicked ? 'opacity-100' : ''}`}
            style={{
              animation: 'spinReverse 15s linear infinite',
            }}
          ></div>
        </div>
        
        {/* Energy meter */}
        <div className="absolute -right-1 -bottom-1 w-6 h-6 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#1e293b" strokeWidth="2" />
            <circle cx="12" cy="12" r="10" fill="none" stroke="#8b5cf6" strokeWidth="2" 
              strokeDasharray="63"
              strokeDashoffset={63 - (63 * energyLevel / 100)}
              transform="rotate(-90 12 12)"
              className="transition-all duration-300"
            />
            <circle cx="12" cy="12" r="6" 
              className={`fill-violet-500/50 transition-all duration-300 ${
                isHovered ? 'fill-violet-400/60' : ''
              } ${isClicked ? 'fill-white/80' : ''}`}
              style={{
                animation: isClicked ? 'corePulse 0.5s infinite alternate' : 'none'
              }}
            />
          </svg>
        </div>
        
        {/* State indicators */}
        {isHovered && (
          <div className="absolute -right-1 -top-1 text-yellow-300 animate-pulse">
            <Sparkles size={12} />
          </div>
        )}
        
        {isClicked && (
          <div className="absolute -left-1 -top-1 text-blue-300 animate-ping">
            <Zap size={12} />
          </div>
        )}
      </div>
      
      {/* Enhanced typography with animated gradient */}
      <div className="flex flex-col perspective-text">
        {/* Main logo text with enhanced gradient */}
        <h1 
          className={`${textClass} font-black tracking-tight text-transparent bg-clip-text transition-all duration-500`} 
          style={{
            backgroundImage: `linear-gradient(to right, 
              #c084fc, #a855f7, #8b5cf6, #7c3aed, #9333ea, #c026d3, #c084fc)`,
            backgroundSize: '200% auto',
            animation: `textGradient ${isHovered ? '2s' : '3s'} linear infinite`
          }}
        >
          Cherry AI
        </h1>
        
        {/* Subtitle with subtle hover effect */}
        <p 
          className={`text-xs font-medium tracking-widest uppercase transition-all duration-500 ${isHovered ? 'tracking-wider' : ''}`}
          style={{
            background: 'linear-gradient(to right, #c084fc, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transform: isHovered ? 'translateZ(10px)' : 'translateZ(0)',
          }}
        >
          Cognitive Assistant
        </p>
      </div>
      
      {/* Add custom keyframe animations */}
      <style jsx>{`
        @keyframes textGradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes nodePulse {
          0% { opacity: 0.6; r: 2; }
          100% { opacity: 1; r: ${isClicked ? 4 : 3}; }
        }
        
        @keyframes neuralPulse {
          0% { stroke-dasharray: 10; stroke-dashoffset: 10; opacity: 0.3; }
          100% { stroke-dasharray: 20; stroke-dashoffset: 30; opacity: 0.8; }
        }
        
        @keyframes hologramFlicker {
          0%, 100% { opacity: ${isClicked ? 0.9 : 0.7}; }
          50% { opacity: ${isClicked ? 0.7 : 0.5}; }
          75% { opacity: ${isClicked ? 1.0 : 0.8}; }
        }
        
        @keyframes corePulse {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 1; transform: scale(${isClicked ? 1.2 : 1.1}); }
        }
        
        @keyframes haloExpand {
          0% { transform: scale(1) translateZ(-5px); opacity: ${isClicked ? 0.9 : 0.6}; }
          100% { transform: scale(1.2) translateZ(-5px); opacity: ${isClicked ? 1.0 : 0.7}; }
        }
        
        @keyframes energyFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 60; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes orbitParticle {
          0% { transform: rotate(0deg) translateX(${isClicked ? 45 : 40}px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(${isClicked ? 45 : 40}px) rotate(-360deg); }
        }
        
        .neural-line {
          transition: all 0.3s;
          ${isHovered ? 'stroke: #a78bfa; stroke-width: 1.5;' : ''}
          ${isClicked ? 'stroke: #d8b4fe; stroke-width: 2;' : ''}
          stroke-dasharray: ${isHovered ? '5,3' : '1,0'};
          animation: ${isHovered ? 'lineFlow 3s linear infinite' : 'none'};
        }
        
        @keyframes lineFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 20; }
        }
      `}</style>
    </div>
  );
};

export default AdvancedCherryLogo;