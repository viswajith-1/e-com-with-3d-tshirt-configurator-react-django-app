import React, { useState } from 'react';

// An array of color palettes to cycle through on click
const colorPalettes = [
  {
    bg: 'bg-gray-900',
    tshirt: 'text-indigo-400',
    textColor: 'text-white'
  },
  {
    bg: 'bg-slate-100',
    tshirt: 'text-rose-500',
    textColor: 'text-gray-800'
  },
  {
    bg: 'bg-cyan-900',
    tshirt: 'text-emerald-400',
    textColor: 'text-white'
  },
  {
    bg: 'bg-amber-100',
    tshirt: 'text-blue-600',
    textColor: 'text-gray-800'
  },
];


// The main App component which renders the Hero Section
export default function App() {
  // State to track the current color palette
  const [paletteIndex, setPaletteIndex] = useState(0);
  // State to trigger the spin animation
  const [isSpinning, setIsSpinning] = useState(false);

  const currentPalette = colorPalettes[paletteIndex];

  // Handles the click event on the T-shirt
  const handleTshirtClick = () => {
    // Trigger the spin animation
    setIsSpinning(true);
    // Cycle to the next color palette
    setPaletteIndex((prevIndex) => (prevIndex + 1) % colorPalettes.length);
  };

  return (
    // Main container for the hero section
    // The background color now dynamically changes based on the current palette
    // Added a transition for a smooth color change effect
    <div className={`h-screen w-full flex flex-col items-center justify-center overflow-hidden p-4 transition-colors duration-700 ${currentPalette.bg}`}>

      {/* T-shirt SVG Icon 
        - An onClick handler is added to trigger the color change and animation.
        - onAnimationEnd resets the spinning state, allowing the animation to re-trigger on subsequent clicks.
        - The color is now dynamic, and a spin animation class is conditionally applied.
      */}
      <svg
        onClick={handleTshirtClick}
        onAnimationEnd={() => setIsSpinning(false)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`
          w-28 h-28 
          sm:w-32 sm:h-32 
          md:w-40 md:h-40 
          lg:w-48 lg:h-48 
          mb-4 
          animate-float
          cursor-pointer
          transition-colors duration-700
          ${currentPalette.tshirt}
          ${isSpinning ? 'animate-spin-once' : ''}
        `}
      >
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>


      {/* The main heading "NEXUS" */}
      <h1 className={`
        text-7xl 
        sm:text-8xl 
        md:text-9xl 
        lg:text-[10rem] 
        xl:text-[14rem] 
        2xl:text-[18rem] 
        font-extrabold 
        uppercase 
        tracking-wider 
        text-center
        transition-colors duration-700
        ${currentPalette.textColor}
      `}>
        NEXUS
      </h1>

      {/* This style block now includes the keyframes for the horizontal spin animation. */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .animate-spin-once {
          animation: spin 0.7s ease-in-out;
        }
      `}</style>
    </div>
  );
}

