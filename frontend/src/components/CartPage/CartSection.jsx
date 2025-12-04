import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

// --- SVG Icon Components ---
// These are included directly to keep the component self-contained.

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Mock Cart Storage Key 
const MOCK_CART_KEY = 'mockCart';

// --- Main Cart Component ---

const CartSection = () => {
    // 2. Initialize navigate hook
    const navigate = useNavigate();
    
    // State to hold cart items
    const [cartItems, setCartItems] = useState([]);
    
    // Function to load cart from localStorage
    const loadCart = () => {
        try {
            const storedCart = JSON.parse(localStorage.getItem(MOCK_CART_KEY) || '[]');
            setCartItems(storedCart);
        } catch (error) {
            console.error("Could not load cart from storage:", error);
            setCartItems([]);
        }
    };

    // Load cart on component mount
    useEffect(() => {
        loadCart();
        
        // OPTIONAL: Add a polling mechanism to reflect changes from ProductSection instantly
        const interval = setInterval(loadCart, 500); // Polls every 500ms
        return () => clearInterval(interval); // Clean up the interval on unmount

    }, []); // Empty dependency array means this runs only on mount

    // --- Business Logic ---
    const updateItemQuantity = (id, size, newQuantity) => {
        if (newQuantity < 1) newQuantity = 1;

        const updatedCart = cartItems.map(item => 
            item.id === id && item.size === size ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCart);
        // Persist change to mock storage
        localStorage.setItem(MOCK_CART_KEY, JSON.stringify(updatedCart));
    };

    const handleDecrement = (id, size, currentQuantity) => {
        updateItemQuantity(id, size, currentQuantity - 1);
    };

    const handleIncrement = (id, size, currentQuantity) => {
        updateItemQuantity(id, size, currentQuantity + 1);
    };
    
    // Use both id and size to uniquely identify the item to remove
    const handleRemoveItem = (id, size) => {
        const updatedCart = cartItems.filter(item => !(item.id === id && item.size === size));
        setCartItems(updatedCart);
        // Persist change to mock storage
        localStorage.setItem(MOCK_CART_KEY, JSON.stringify(updatedCart));
    };

    // 3. New function to handle checkout logic
    const handleCheckout = () => {
        // Check for access_token in localStorage (assuming this signifies a logged-in user)
        const accessToken = localStorage.getItem("access_token");

        if (accessToken) {
            navigate("/checkout"); // Logged in: Redirect to checkout page
        } else {
            navigate("/auth"); // Not logged in: Redirect to authentication page
        }
    };

    // Constant for delivery fee
    const deliveryFee = 40.00;

    // Calculate subtotal
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + (cartItems.length > 0 ? deliveryFee : 0); // Only apply delivery if there are items

    return (
        <div className="bg-white min-h-screen font-sans antialiased">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">

                    {/* Left Column: Bag */}
                    <div className="lg:col-span-2">
                        <h1 className="text-2xl font-bold mb-6 sm:text-3xl">Bag ({cartItems.length})</h1>
                        
                        {cartItems.length === 0 ? (
                            <p className="text-lg text-gray-500 py-10">Your bag is currently empty.</p>
                        ) : (
                            cartItems.map(item => (
                                // Cart Item
                                // Using a composite key for React since we can have the same product ID with different sizes
                                <div key={`${item.id}-${item.size}`} className="flex items-start py-6 border-b border-gray-200">
                                    <img
                                        // Use the item image from the mock cart
                                        src={item.image}
                                        alt={item.name}
                                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md mr-4 sm:mr-6 flex-shrink-0"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "https://placehold.co/128x128/000000/FFFFFF?text=Product";
                                        }}
                                    />
                                    <div className="flex-grow">
                                        <div className="flex flex-col sm:flex-row justify-between items-start">
                                            <div className="mb-2 sm:mb-0">
                                                <h2 className="font-semibold text-lg">{item.name}</h2>
                                                {/* item.description is a basic HTML string, so we'll just display it as text for the cart view or use a simplified description */}
                                                <p className="text-gray-500 text-sm sm:text-base">{item.color}</p> 
                                                <p className="text-gray-500 text-sm sm:text-base">Size: {item.size}</p>
                                            </div>
                                            <p className="font-semibold text-lg sm:ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center mt-4">
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                <button onClick={() => handleDecrement(item.id, item.size, item.quantity)} className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-l-md transition-colors duration-200">-</button>
                                                <span className="px-4 py-1 font-medium">{item.quantity}</span>
                                                <button onClick={() => handleIncrement(item.id, item.size, item.quantity)} className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-r-md transition-colors duration-200">+</button>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveItem(item.id, item.size)}
                                                className="ml-4 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="p-0 sm:p-6">
                            <h1 className="text-2xl font-bold mb-6 sm:text-3xl">Summary</h1>
                            <div className="space-y-3 text-gray-700">
                                <div className="flex justify-between">
                                    <span className="flex items-center">
                                        Subtotal ({cartItems.length} items)
                                        <button className="ml-1.5 text-gray-400 hover:text-gray-600">
                                            <InfoIcon />
                                        </button>
                                    </span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated Delivery & Handling</span>
                                    <span>{cartItems.length > 0 ? `₹${deliveryFee.toFixed(2)}` : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 my-4"></div>
                            <div className="flex justify-between font-bold text-lg text-black">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <div className="mt-8">
                                <button 
                                    // 4. Attach the new handleCheckout function to the button
                                    onClick={handleCheckout} 
                                    className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-transform transform hover:scale-105 duration-300 ease-out"
                                    disabled={cartItems.length === 0}
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSection;