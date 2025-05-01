const EnhancedCherryLogo = ({ size = "default" }) => {
  // Responsive sizing based on prop or screen size
  const sizes = {
    small: "w-8 h-8",
    default: "w-12 h-12",
    large: "w-16 h-16"
  };
  
  const avatarSize = sizes[size] || sizes.default;
  const textClass = size === "small" ? "text-lg" : "text-xl";
  
  return (
    <div className="flex items-center group">
      {/* Enhanced avatar with RGB effects */}
      <div className={`relative ${avatarSize} mr-3 cherry-avatar`}>
        {/* RGB glow effect that pulses */}
        <div className="absolute -inset-[15%] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-75 blur-md animate-pulse-slow group-hover:opacity-100 transition-opacity"></div>
        
        {/* Cherry-themed avatar with depth */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-800 via-violet-700 to-indigo-900 overflow-hidden shadow-lg cherry-face">
          {/* Gleaming highlight effect */}
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/5 to-transparent rotate-12 animate-rotate-slow"></div>
          
          {/* Dynamic particle effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-1 h-1 rounded-full bg-purple-300 animate-float-slow"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-300 animate-float-reverse"></div>
            <div className="absolute top-2/3 right-1/3 w-1 h-1 rounded-full bg-pink-300 animate-float-med"></div>
          </div>
          
          {/* Enhanced facial features with animation */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Animated glowing eyes */}
            <div className="flex space-x-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow animate-blink cherry-eye"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow animate-blink-delayed cherry-eye"></div>
            </div>
          </div>
        </div>
        
        {/* Orbiting RGB rings */}
        <div className="absolute inset-[3%] rounded-full border border-indigo-500/50 animate-spin-slow"></div>
        <div className="absolute inset-[6%] rounded-full border border-violet-500/40 animate-spin-reverse-slow"></div>
        <div className="absolute inset-[9%] rounded-full border border-fuchsia-500/30 animate-spin-med"></div>
      </div>
      
      {/* Enhanced typography with animated gradient */}
      <div className="flex flex-col">
        <h1 className={`${textClass} font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 animate-gradient-x group-hover:animate-gradient-fast`}>
          Cherry AI
        </h1>
        <p className="text-xs font-medium tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 uppercase">
          Cognitive Assistant
        </p>
      </div>
    </div>
  );
};

export default EnhancedCherryLogo; 