import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api";

// --- SVG Icons (No Changes) ---
const ChevronLeftIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

// --- Product Card Component (Refactored) ---
// I've removed the outer div from this component so the carousel can control its width directly.
const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
        <div className="bg-gray-100 p-4 flex items-center justify-center h-64 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-auto object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/400x400/f3f4f6/9ca3af?text=Image+Not+Found`;
            }}
          />
        </div>
        <div className="p-4 text-gray-800 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold truncate">{product.name}</h3>
          <div className="flex items-baseline space-x-2 mt-auto">
            <p className="text-lg font-bold">₹{product.price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- Reusable Product Carousel Component (Updated for Responsiveness) ---
// MODIFIED: Added 'id' prop to allow linking from the Navbar
const ProductCarousel = ({ id, title, products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(3);

  // This effect adjusts the number of products shown based on screen size.
  useEffect(() => {
    const handleResize = () => {
      let newProductsPerPage = 3;
      if (window.innerWidth < 640) {
        // Tailwind's 'sm' breakpoint
        newProductsPerPage = 1;
      } else if (window.innerWidth < 768) {
        // Tailwind's 'md' breakpoint
        newProductsPerPage = 2;
      }

      setProductsPerPage(newProductsPerPage);
      // Ensure the current index is not out of bounds after resizing
      setCurrentIndex((prevIndex) =>
        Math.max(0, Math.min(prevIndex, products.length - newProductsPerPage))
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener("resize", handleResize);
  }, [products.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, products.length - productsPerPage)
    );
  };

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled =
    currentIndex >= products.length - productsPerPage ||
    products.length <= productsPerPage;

  if (products.length === 0) return null;

  return (
    // CORRECTED: Set the id attribute for the Navbar links to target
    <div className="mb-16" id={id}> 
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {title}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className="p-2 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="p-2 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </header>
      <div className="overflow-hidden relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${
              currentIndex * (100 / productsPerPage)
            }%)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 p-2"
              style={{ width: `${100 / productsPerPage}%` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component (No Changes) ---
export default function TshirtSection() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredResponse, trendingResponse, bestsellerResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/products/?is_featured=true`),
            axios.get(`${API_BASE_URL}/products/?is_trending=true`),
            axios.get(`${API_BASE_URL}/products/?is_bestseller=true`),
          ]);
        setFeaturedProducts(featuredResponse.data);
        setTrendingProducts(trendingResponse.data);
        setBestsellerProducts(bestsellerResponse.data);
      } catch (err) {
        setError(
          "Failed to fetch products. Please check the backend connection."
        );
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">
          Loading products...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="container mx-auto px-4 py-12">
        {/* CORRECTED: Passed the corresponding 'id' prop to each carousel */}
        <ProductCarousel id="new-featured" title="New & Featured" products={featuredProducts} />
        <ProductCarousel id="trending" title="Trending" products={trendingProducts} />
        <ProductCarousel id="best-sellers" title="Best Sellers" products={bestsellerProducts} />
      </div>
    </div>
  );
}