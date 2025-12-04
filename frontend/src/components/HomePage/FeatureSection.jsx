import React from 'react';

// A card component for displaying a sport category with a video background
const SportCard = ({ title, heading, videoSrc }) => {
  return (
    // The main container is now the relative parent for positioning the text
    <div className="group relative cursor-pointer overflow-hidden rounded-xl shadow-md transition-shadow duration-300 hover:shadow-2xl">
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline // Important for autoplay on mobile browsers
        className="h-full w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
      >
        {/* Fallback text for browsers that don't support the video tag */}
        Your browser does not support the video tag.
      </video>
      
      {/* Gradient overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      
      {/* Absolute positioned container for the text content */}
      <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 text-white">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1">{heading}</h3>
        <p className="text-sm md:text-base uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
};

// The main App component that lays out the grid
export default function App() {
  return (
    <div className="bg-white min-h-screen w-full font-sans text-slate-900">
      <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {/* Header section with title */}
        <div className="mb-8 md:mb-12 flex justify-center items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">OUR CHOICES</h1>
        </div>

        {/* Responsive grid layout for the cards, with a max-width on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 max-w-6xl mx-auto">

          <SportCard
            heading="READY-MADE"
            title="Hoops Essentials"
            videoSrc="src/assets/videos/custom.mp4"
          />

          <SportCard
            heading="CUSTOMIZE"
            title="Pitch Perfect"
            videoSrc="src/assets/videos/ready.mp4"
          />

        </div>
      </main>
    </div>
  );
}

