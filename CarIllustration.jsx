'use client'
import React from 'react';

/**
 * CarIllustration – renders a lightweight SVG illustration that adapts its palette
 * to the vehicle manufacturer and changes shape according to the body type.
 */
const CarIllustration = ({
  bodyType = 'sedan',
  manufacturer = '',
  model = '',
  year = '',
  size = 'md',
  className = '',
}) => {
  // size map → pad each illustration consistently
  const sizeClass = {
    sm: 'w-16 h-16',
    md: 'w-32 h-24',
    lg: 'w-48 h-32',
    xl: 'w-64 h-40',
  }[size] || 'w-32 h-24';

  const type = bodyType.toLowerCase();
  const brand = manufacturer.toLowerCase();

  const baseCls = `${sizeClass} ${className} transition-transform duration-300 hover:scale-105`;

  /** Brand‑aware colour generator */
  const getCarColors = (m) => {
    const preset = {
      bmw: { body: '#1c69d3', accent: '#ffffff', glass: '#a4dbff' },
      tesla: { body: '#cc0000', accent: '#000000', glass: '#a4e0ff' },
      toyota: { body: '#EB0A1E', accent: '#ffffff', glass: '#a4e7ff' },
      honda: { body: '#CC0000', accent: '#000000', glass: '#a4dbff' },
      ford: { body: '#0063D1', accent: '#ffffff', glass: '#a4e7ff' },
      chevrolet: { body: '#FFB612', accent: '#000000', glass: '#a4e7ff' },
      dodge: { body: '#BA0C2F', accent: '#000000', glass: '#a4dbff' },
      mercedes: { body: '#221F1F', accent: '#ffffff', glass: '#a4e7ff' },
      audi: { body: '#000000', accent: '#ffffff', glass: '#a4dbff' },
      volkswagen: { body: '#0d57a3', accent: '#ffffff', glass: '#a4e0ff' },
      hyundai: { body: '#002c5f', accent: '#ffffff', glass: '#a4e7ff' },
      kia: { body: '#BB162B', accent: '#ffffff', glass: '#a4dbff' },
      nissan: { body: '#C3002F', accent: '#ffffff', glass: '#a4e7ff' },
      subaru: { body: '#0041AA', accent: '#ffffff', glass: '#a4dbff' },
      mazda: { body: '#910A2D', accent: '#ffffff', glass: '#a4e7ff' },
    };
    if (preset[m]) return preset[m];
    // fallback → hash to hue
    let h = 0;
    for (let i = 0; i < m.length; i++) h = m.charCodeAt(i) + ((h << 5) - h);
    const hue = Math.abs(h) % 360;
    return {
      body: `hsl(${hue},70%,40%)`,
      accent: '#ffffff',
      glass: `hsl(${(hue + 180) % 360},50%,80%)`,
    };
  };

  const colors = getCarColors(brand);

  // Common primitives
  const Wheel = ({ cx, cy }) => (
    <>
      <circle cx={cx} cy={cy} r="18" fill="#111" stroke="#000" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="10" fill="#333" stroke="#555" strokeWidth="1" />
    </>
  );

  const HeadTailLights = () => (
    <>
      {/* Headlight */}
      <path d="M40,85 L50,85 L50,75 L40,85 Z" fill="yellow" />
      {/* Taillight */}
      <path d="M210,85 L200,85 L200,75 L210,85 Z" fill="red" />
    </>
  );

  const Shadow = () => <ellipse cx="125" cy="120" rx="80" ry="10" fill="rgba(0,0,0,0.2)" />;

  const Label = () => (
    <text x="120" y="120" fontSize="12" textAnchor="middle" fill="#fff" fontWeight="bold">
      {`${year ? `${year} ` : ''}${manufacturer || type.charAt(0).toUpperCase() + type.slice(1)}`}
    </text>
  );

  /* ---------- Body‑type SVGs ---------- */
  const renderSVG = () => {
    switch (type) {
      case 'suv':
        return (
          <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
            <path d="M40,100 L60,50 L180,50 L210,100 L40,100 Z" fill={colors.body} stroke="#000" strokeWidth="2" />
            <path d="M70,55 L80,30 L160,30 L170,55 Z" fill="#111" stroke="#000" strokeWidth="2" />
            <path d="M75,55 L85,35 L155,35 L165,55 Z" fill={colors.glass} />
            <line x1="105" y1="35" x2="105" y2="55" stroke="#333" strokeWidth="1.5" />
            <line x1="135" y1="35" x2="135" y2="55" stroke="#333" strokeWidth="1.5" />
            <Wheel cx="80" cy="100" />
            <Wheel cx="170" cy="100" />
            <HeadTailLights />
            <Shadow />
            <Label />
          </svg>
        );

      case 'pickup':
        return (
          <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
            <rect x="110" y="50" width="100" height="50" fill={colors.body} stroke="#000" strokeWidth="2" />
            <path d="M40,100 L60,50 L110,50 L110,100 Z" fill={colors.body} stroke="#000" strokeWidth="2" />
            <path d="M65,55 L75,35 L105,35 L105,55 Z" fill={colors.glass} stroke="#000" strokeWidth="1" />
            <Wheel cx="75" cy="100" />
            <Wheel cx="175" cy="100" />
            <line x1="130" y1="50" x2="130" y2="100" stroke="#000" strokeWidth="1" />
            <line x1="170" y1="50" x2="170" y2="100" stroke="#000" strokeWidth="1" />
            <line x1="110" y1="75" x2="210" y2="75" stroke="#000" strokeWidth="1" />
            <HeadTailLights />
            <Shadow />
            <Label />
          </svg>
        );

      case 'coupe':
      case 'sport':
      case 'sports':
        return (
          <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
            <path d="M40,95 L70,60 L170,55 L210,95 Z" fill={colors.body} stroke="#000" strokeWidth="2" />
            <path d="M80,60 L95,40 L155,40 L170,60 Z" fill={colors.glass} stroke="#000" strokeWidth="1" />
            <line x1="125" y1="40" x2="125" y2="60" stroke="#333" strokeWidth="1" />
            <Wheel cx="80" cy="95" />
            <Wheel cx="170" cy="95" />
            <path d="M110,55 L130,55 L130,60 L110,60 Z" fill="#111" />
            <line x1="60" y1="75" x2="190" y2="75" stroke="#222" strokeWidth="1" />
            <HeadTailLights />
            <Shadow />
            <Label />
          </svg>
        );

      case 'convertible':
        return (
          <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
            <path d="M40,95 L70,70 L170,70 L210,95 Z" fill={colors.body} stroke="#000" strokeWidth="2" />
            <path d="M80,70 L90,55 L150,55 L160,70 Z" fill={colors.glass} stroke="#000" strokeWidth="1" />
            <path d="M135,70 L165,70 L165,60 L145,55 L135,60 Z" fill="#222" stroke="#000" strokeWidth="1" />
            <Wheel cx="80" cy="95" />
            <Wheel cx="170" cy="95" />
            <path d="M95,70 L95,95" stroke="#222" strokeWidth="1" />
            <path d="M150,70 L150,95" stroke="#222" strokeWidth="1" />
            <HeadTailLights />
            <Shadow />
            <Label />
          </svg>
        );

      case 'wagon':
        return (
          <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
            <path d="M40,95 L70,60 L170,60 L190,95 Z" fill={colors.body} stroke="#000" strokeWidth="2" />
            <path d="M75,60 L85,40 L165,40 L175,60 Z" fill={colors.glass} stroke="#000" strokeWidth="1" />
            <line x1="105" y1="40" x2="105" y2="60" stroke="#333" strokeWidth="1" />
            <line x1="140" y1="40" x2="140" y2="60" stroke="#333" strokeWidth="1" />
            <line x1="90" y1="35" x2="160" y2="35" stroke="#111" strokeWidth="2" />
            <Wheel cx="80" cy="95" />
            <Wheel cx="170" cy="95" />
            <HeadTailLights />
            <Shadow />
            <Label />
          </svg>
        );

      case 'hatchback':
        return (
          <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
            <path d="M40,95 L70,60 L140,60 L170,85 L210,95 Z" fill={colors.body} stroke="#000" strokeWidth="2" />
            <path d="M75,60 L85,40 L135,40 L165,85 Z" fill={colors.glass} stroke="#000" strokeWidth="1" />
            <line x1="100" y1="40" x2="90" y2="60" stroke="#333" strokeWidth="1" />
            <line x1="120" y1="40" x2="125" y2="60" stroke="#333" strokeWidth="1" />
            <Wheel cx="80" cy="95" />
            <Wheel cx="170" cy="95" />
            <HeadTailLights />
            <Shadow />
            <Label />
          </svg>
        );

      // fallback sedan
      default:
        return (
          <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
            <path d="M40,95 L70,60 L170,60 L210,95 Z" fill={colors.body} stroke="#000" strokeWidth="2" />
            <path d="M75,60 L85,40 L155,40 L165,60 Z" fill={colors.glass} stroke="#000" strokeWidth="1" />
            <line x1="115" y1="40" x2="115" y2="60" stroke="#333" strokeWidth="1" />
            <line x1="135" y1="40" x2="135" y2="60" stroke="#333" strokeWidth="1" />
            <Wheel cx="80" cy="95" />
            <Wheel cx="170" cy="95" />
            <line x1="115" y1="60" x2="115" y2="95" stroke="#222" strokeWidth="1" />
            <line x1="60" y1="80" x2="190" y2="80" stroke="#222" strokeWidth="1" />
            <HeadTailLights />
            <Shadow />
            <Label />
          </svg>
        );
    }
  };

  return <div className={baseCls}>{renderSVG()}</div>;
};

export default CarIllustration;
