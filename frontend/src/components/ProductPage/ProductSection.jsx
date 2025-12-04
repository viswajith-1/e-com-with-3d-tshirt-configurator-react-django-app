import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// The base URL is correctly defined based on your backend structure.
const API_BASE_URL = "http://localhost:8000/api";

// --- Helper Components ---

// StarRating component for displaying product reviews
const StarRating = ({
  rating = 4,
  reviewCount = 84,
  showReviewCount = true,
}) => (
  <div className="flex items-center">
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 fill-current ${
            i < Math.floor(rating) ? "text-black" : "text-gray-300"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
    {showReviewCount && (
      <span className="ml-3 text-sm font-medium text-gray-600">
        {rating.toFixed(1)} ({reviewCount} reviews)
      </span>
    )}
  </div>
);

// SizeSelector component for choosing t-shirt size
const SizeSelector = ({ sizes, selectedSize, onSelectSize }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
      <a
        href="#"
        className="text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        Size Guide
      </a>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onSelectSize(size)}
          className={`border rounded-md py-3 px-4 text-sm font-medium uppercase hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 ${
            selectedSize === size
              ? "bg-black text-white"
              : "bg-white text-gray-900 border-gray-200"
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
);

// ActionButtons component for adding to bag
// ACCEPT onAddToCart PROP
const ActionButtons = ({ isAvailable, onAddToCart }) => (
  <div className="mt-8">
    <button
      type="button"
      onClick={onAddToCart} // ADD HANDLER HERE
      disabled={!isAvailable}
      className={`w-full border border-transparent rounded-full py-4 px-8 flex items-center justify-center text-base font-medium transition-all duration-200 ${
        isAvailable
          ? "bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      {isAvailable ? "Add to Bag" : "Out of Stock"}
    </button>
  </div>
);

// ProductInfo component for displaying product details
const ProductInfo = ({ product }) => (
  <>
    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
      {product.name}
    </h1>
    <p className="text-lg text-gray-600 mt-2">{product.category}</p>
    <div className="mt-4">
      <h2 className="sr-only">Product information</h2>
      <p className="text-3xl sm:text-4xl tracking-tight text-gray-900">
        ₹{product.price.toFixed(2)}
      </p>
    </div>
    <div className="mt-4">
      <h3 className="sr-only">Reviews</h3>
      <StarRating />
    </div>
    {/* We use dangerouslySetInnerHTML to allow basic formatting (like <p> tags) for the description */}
    <div
      className="mt-6 text-base text-gray-700 space-y-4"
      dangerouslySetInnerHTML={{ __html: product.description }}
    />

    {/* Display stock information */}
    <div className="mt-4 text-sm font-medium">
      <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
        {product.stock > 0
          ? `${product.stock} units in stock`
          : "Currently out of stock"}
      </span>
    </div>
  </>
);

// UserReviews component
const UserReviews = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="mt-10 border-t pt-10">
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Customer Reviews
      </h3>
      <div className="flex items-center my-4">
        <StarRating rating={averageRating} showReviewCount={false} />
        <p className="ml-2 text-sm text-gray-600">
          Based on {reviews.length} reviews
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {reviews.map((review) => (
          <div key={review.id} className="py-6">
            <div className="flex items-center">
              <StarRating rating={review.rating} showReviewCount={false} />
            </div>
            <h4 className="mt-2 text-lg font-medium text-gray-900">
              {review.title}
            </h4>
            <p className="mt-2 text-base text-gray-600">{review.content}</p>
            <p className="mt-3 text-sm text-gray-500">
              <strong>{review.author}</strong> on{" "}
              <time dateTime={review.date}>
                {new Date(review.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Product Page Component ---

// Mock Cart Storage (replace with Context/Redux in a real app)
const MOCK_CART_KEY = 'mockCart';

const addToCartMock = (product, size) => {
  const existingCart = JSON.parse(localStorage.getItem(MOCK_CART_KEY) || '[]');
  
  // 1. Check if the item (by id AND size) already exists in the cart
  const existingItemIndex = existingCart.findIndex(
    item => item.id === product.id && item.size === size
  );

  let updatedCart;
  let message;

  if (existingItemIndex > -1) {
    // 2. If it exists, create a new cart array, increasing its quantity
    updatedCart = existingCart.map((item, index) => 
      index === existingItemIndex 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    );
    message = `Added another ${product.name} (Size: ${size}). Quantity is now ${updatedCart[existingItemIndex].quantity}.`;
  } else {
    // 3. If it doesn't exist, add it as a new item
    const newItem = { 
      ...product, 
      size, 
      quantity: 1 
    };
    updatedCart = [...existingCart, newItem];
    message = `Added ${product.name} (Size: ${size}) to the cart!`;
  }
  
  // Update storage
  localStorage.setItem(MOCK_CART_KEY, JSON.stringify(updatedCart));
  alert(message);
};


export default function ProductSection() {
  const { id } = useParams();
  const PRODUCT_ID = id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Default sizes, as sizes are not defined in the backend Product model
  const productSizes = ["S", "M", "L", "XL", "XXL"];

  // Hardcoded reviews data (since no reviews API endpoint is provided)
  const reviews = [
    {
      id: 1,
      rating: 5,
      title: "Perfect fit!",
      content:
        "This is the best t-shirt I've ever owned. The fabric is so soft and the fit is perfect. I'll be buying more in different colors.",
      author: "John D.",
      date: "2025-08-15",
    },
    {
      id: 2,
      rating: 4,
      title: "Great quality, a bit pricey",
      content:
        "The quality is undeniable, but it's a little more expensive than I'd usually pay for a t-shirt. Still, happy with my purchase.",
      author: "Jane S.",
      date: "2025-08-12",
    },
    {
      id: 3,
      rating: 5,
      title: "My new favorite shirt",
      content:
        "I wear this shirt all the time. It's comfortable and looks great. Washes well too without shrinking.",
      author: "Sam B.",
      date: "2025-08-10",
    },
  ];

  // Fetch product details from the backend
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_BASE_URL}/products/${PRODUCT_ID}/`;
        const productResponse = await axios.get(url);

        const apiProduct = productResponse.data;

        // Map the API response to the required frontend format
        const fetchedProduct = {
          // Use optional chaining and fallback for safety
          id: apiProduct.id,
          name: apiProduct.name || "Unknown Product",
          category: "T-Shirt", // Assuming category or default
          price: parseFloat(apiProduct.price || 0),
          stock: apiProduct.stock || 0,
          // Format the plain text description into a basic HTML string for rendering
          description: `<p>${
            apiProduct.description || "No description provided."
          }</p>`,
          // Use the image URL from the API, falling back to a placeholder
          image:
            apiProduct.image ||
            "https://placehold.co/600x600/000000/FFFFFF?text=Product+Image",
        };

        setProduct(fetchedProduct);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          "Failed to load product details. Please ensure the Django backend is running on port 8000 and has at least one product created."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [PRODUCT_ID]); // Dependency array to re-run on ID change

  // New function to handle adding the product to the cart
  const handleAddToCart = () => {
      if (product && selectedSize) {
          // Add color to the product object for the cart item, assuming a default color
          const productForCart = {
              ...product,
              color: "Vintage Black" // Hardcoded color for a more realistic cart item
          };
          addToCartMock(productForCart, selectedSize);
      }
  };
  
  // ... (rest of the component)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-700 p-8 rounded-lg shadow-xl bg-white">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-black inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading product details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-red-600 p-8 rounded-lg shadow-xl bg-white border-l-4 border-red-500">
          <p className="mb-2">🚨 Error</p>
          <p className="text-sm text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  // Check if product data is available after loading
  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-700 p-8 rounded-lg shadow-xl bg-white">
          Product not found. (ID: {PRODUCT_ID})
        </div>
      </div>
    );
  }

  const isAvailable = product.stock > 0;

  return (
    <div className="bg-white font-sans min-h-screen">
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-start">
          {/* Image Column */}
          <div className="lg:sticky lg:top-16">
            <div className="w-full aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                // Add a robust image error handler to use a reliable placeholder
                onError={(e) => {
                  e.target.onerror = null; // prevents looping
                  e.target.src =
                    "https://placehold.co/600x600/000000/FFFFFF?text=Product+Image";
                }}
              />
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 sm:mt-12 lg:mt-0">
            <ProductInfo product={product} />

            <div className="mt-8">
              <SizeSelector
                sizes={productSizes}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
              />
            </div>

            <ActionButtons 
                isAvailable={isAvailable} 
                onAddToCart={handleAddToCart} // PASS HANDLER HERE
            />

            <div className="mt-10 border-t pt-10">
              <h3 className="text-lg font-medium text-gray-900">
                Free Delivery and Returns
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Free standard delivery on orders over £50. You can return your
                order for any reason, free of charge, within 60 days.
              </p>
            </div>

            <UserReviews reviews={reviews} />
          </div>
        </div>
      </main>
    </div>
  );
}