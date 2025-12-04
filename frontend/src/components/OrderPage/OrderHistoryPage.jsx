import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Utility function for price formatting
const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
};

// Component to map status to a color badge
const StatusBadge = ({ status }) => {
    let color = 'bg-gray-200 text-gray-800';
    if (status === 'PROCESSING') {
        color = 'bg-blue-100 text-blue-800';
    } else if (status === 'SHIPPED') {
        color = 'bg-indigo-100 text-indigo-800';
    } else if (status === 'DELIVERED') {
        color = 'bg-green-100 text-green-800';
    } else if (status === 'CANCELLED') {
        color = 'bg-red-100 text-red-800';
    } else if (status === 'PENDING') {
        color = 'bg-yellow-100 text-yellow-800';
    }

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
            {status}
        </span>
    );
};


// --- MAIN COMPONENT ---
export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // CRITICAL FIX: Use the ABSOLUTE URL path for consistency
    const API_BASE_URL = "http://localhost:8000/api";

    useEffect(() => {
        const fetchOrders = async () => {
            const authToken = localStorage.getItem('access_token') || localStorage.getItem('access');

            if (!authToken) {
                // If not logged in, redirect to auth page
                alert("You must be logged in to view your order history.");
                navigate('/auth');
                return;
            }

            try {
                // FIX: Use absolute URL
                const response = await fetch(`${API_BASE_URL}/orders/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    throw new Error("Authentication failed. Please log in again.");
                }

                if (!response.ok) {
                    // Added robust error handling here too
                    const text = await response.text();
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.detail || "Failed to fetch orders from the server.");
                    } catch (jsonError) {
                        throw new Error(`Failed to load orders. Server returned status ${response.status}.`);
                    }
                }

                const data = await response.json();
                setOrders(data);

            } catch (err) {
                console.error("Fetch Orders Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);


    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center">
                <p className="text-xl font-medium">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                <p className="text-gray-600">Could not load orders: {error}</p>
                <button 
                    onClick={() => navigate('/auth')} 
                    className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                    Order History
                </h1>

                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <p className="text-xl text-gray-500 mb-4">You haven't placed any orders yet.</p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="px-6 py-3 bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-800 transition duration-300"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-4 sm:p-6">
                                {/* Order Header/Summary */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Order ID: #{order.id}</p>
                                        <p className="text-sm text-gray-500">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                                        <StatusBadge status={order.status} />
                                        <p className="text-xl font-bold text-gray-900">
                                            {formatPrice(order.total_price)}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                {/* Note: item.product is a nested object returned by your OrderSerializer */}
                                                <img 
                                                    src={item.product.image || "https://placehold.co/64x64/E5E7EB/4B5563?text=N"} 
                                                    alt={item.product.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://placehold.co/64x64/E5E7EB/4B5563?text=N";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 truncate">{item.product.name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity} @ {formatPrice(item.price)} each</p>
                                            </div>
                                            <p className="font-semibold text-right flex-shrink-0">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Footer (Optional payment details) */}
                                {order.razorpay_payment_id && (
                                    <div className="pt-4 mt-4 border-t text-sm text-gray-500">
                                        Payment ID: {order.razorpay_payment_id.substring(0, 15)}...
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}