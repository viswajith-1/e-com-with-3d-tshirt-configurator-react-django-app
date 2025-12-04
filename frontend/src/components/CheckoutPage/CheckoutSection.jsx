import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Helper Components (SVG Icons) ---
const NexusLogo = () => (
    <div className="text-3xl font-bold tracking-wider text-black">
        NEXUS
    </div>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline-block text-gray-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 5v2h2V5a1 1 0 00-2 0z" clipRule="evenodd" />
  </svg>
);

// Define the storage key used in CartSection.jsx
const MOCK_CART_KEY = 'mockCart';
const RAZORPAY_KEY_ID = "rzp_test_rxQ8YMdQHxknXd"; // Use the test key ID provided

const API_BASE_URL = "http://localhost:8000/api";


// =======================================================
// --- START: MOVED HELPER COMPONENTS (Fix for input focus) ---
// =======================================================

const FormInput = ({ label, placeholder, id, type = 'text', fullWidth = false, value, onChange }) => (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black transition duration-150"
      />
    </div>
);

const DeliveryForm = ({ deliveryDetails, contactInfo, handleDeliveryChange, handleContactChange, setActiveTab, loading }) => (
    <div className="space-y-6">
       <h2 className="text-2xl font-semibold">Delivery Address</h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput id="firstName" label="First Name" placeholder="John" value={deliveryDetails.firstName} onChange={handleDeliveryChange} />
            <FormInput id="lastName" label="Last Name" placeholder="Doe" value={deliveryDetails.lastName} onChange={handleDeliveryChange} />
            <FormInput id="address" label="Address Line 1" placeholder="123 Example St" fullWidth value={deliveryDetails.address} onChange={handleDeliveryChange} />
            <FormInput id="address2" label="Address Line 2 (Optional)" placeholder="Apartment, suite, etc." fullWidth value={deliveryDetails.address2} onChange={handleDeliveryChange} />
            <FormInput id="city" label="City" placeholder="New York" fullWidth value={deliveryDetails.city} onChange={handleDeliveryChange} />
            <FormInput id="state" label="State" placeholder="NY" value={deliveryDetails.state} onChange={handleDeliveryChange} />
            <FormInput id="zip" label="ZIP Code" placeholder="10001" value={deliveryDetails.zip} onChange={handleDeliveryChange} />
            <div className="sm:col-span-2">
                <p className="text-sm text-gray-500 mt-2">United States</p>
            </div>
       </div>

       <h2 className="text-2xl font-semibold pt-6 border-t border-gray-200 mt-8">Contact Information</h2>
       <div className="grid grid-cols-1 gap-4">
           <FormInput id="email" label="Email" placeholder="you@example.com" fullWidth value={contactInfo.email} onChange={handleContactChange} />
           <FormInput id="phone" label="Phone Number" placeholder="(555) 555-5555" fullWidth value={contactInfo.phone} onChange={handleContactChange} />
       </div>

       <button 
        onClick={() => setActiveTab('payment')}
        className="w-full bg-black text-white py-3 rounded-md mt-6 hover:bg-gray-800 transition duration-300 text-lg font-semibold"
        disabled={loading}>
         Continue to Payment
       </button>
    </div>
);

const PaymentForm = ({ setActiveTab, currentDeliveryAddress, handlePlaceOrder, loading, total }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Payment</h2>
            <button onClick={() => setActiveTab('delivery')} className="text-sm font-medium text-gray-600 hover:text-black">
                &larr; Back to Delivery
            </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="font-medium">Ship To</p>
                     <p className="text-sm text-gray-600">{currentDeliveryAddress}</p>
                 </div>
                 <button onClick={() => setActiveTab('delivery')} className="text-sm font-medium text-blue-600 hover:underline">Change</button>
             </div>
        </div>

        <div className="border border-gray-200 p-4 rounded-md text-center">
            <p className="text-sm text-gray-600">You will be redirected to the Razorpay payment gateway upon clicking 'Place Order'.</p>
        </div>
        
        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-black text-white py-3 rounded-md mt-6 hover:bg-gray-800 transition duration-300 text-lg font-semibold flex items-center justify-center"
          disabled={loading}>
          {loading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <>
                <LockIcon />
                Place Order (₹{total.toFixed(2)})
            </>
          )}
        </button>

    </div>
);

// =======================================================
// --- END: MOVED HELPER COMPONENTS ---
// =======================================================


// --- Main App Component ---
export default function CheckoutSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('delivery');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const shipping = 40.00;

  // Form State
  const [deliveryDetails, setDeliveryDetails] = useState({
      firstName: '', lastName: '', address: '', 
      address2: '', city: '', state: '', zip: ''
  });
  const [contactInfo, setContactInfo] = useState({
      email: '', phone: ''
  });

  // Load cart data on component mount
  useEffect(() => {
    // Load Razorpay script dynamically
    const loadRazorpayScript = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    };

    try {
      const storedCart = JSON.parse(localStorage.getItem(MOCK_CART_KEY) || '[]');
      setCartItems(storedCart);
    } catch (error) {
      console.error("Could not load cart from storage:", error);
    }

    loadRazorpayScript();
  }, []);

  // Recalculate totals - Includes the $40 shipping fee
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (cartItems.length > 0 ? shipping : 0);

  // --- HANDLERS ---

  const handleDeliveryChange = (e) => {
    setDeliveryDetails({ ...deliveryDetails, [e.target.id]: e.target.value });
  };

  const handleContactChange = (e) => {
    setContactInfo({ ...contactInfo, [e.target.id]: e.target.value });
  };

  const currentDeliveryAddress = `${deliveryDetails.firstName} ${deliveryDetails.lastName}, ${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.state} ${deliveryDetails.zip}`;


  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
        alert("Your cart is empty. Please add items to place an order.");
        return;
    }
    setLoading(true);

    const authToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    
    if (!authToken) {
        alert("You must be logged in to place an order.");
        setLoading(false);
        return;
    }

    // 1. Prepare Order Payload
    const orderItemsPayload = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price 
    }));

    const orderPayload = {
        items: orderItemsPayload,
    };

    let createdOrder = null;
    try {
        // 2. Create Order on Django Backend (Status PENDING by default)
        const orderResponse = await fetch(`${API_BASE_URL}/orders/`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(orderPayload),
        });

        if (!orderResponse.ok) {
            const text = await orderResponse.text();
            try {
                const errorData = JSON.parse(text);
                if (typeof errorData.items === 'string' && errorData.items.includes("Not enough stock")) {
                     throw new Error(errorData.items);
                }
                throw new Error(errorData.detail || errorData.error || JSON.stringify(errorData) || "Failed to create order on backend.");
            } catch (jsonError) {
                 // Fallback if the response is not JSON (e.g., a 404 HTML page)
                 throw new Error(`Failed to create order. Server returned status ${orderResponse.status}. Please check your Django server is running.`);
            }
        }

        createdOrder = await orderResponse.json();
        console.log("Order created successfully:", createdOrder);

    } catch (error) {
        alert(`Error during order creation: ${error.message}`);
        setLoading(false);
        return;
    }

    let razorpayOrderData = null;
    try {
        // 3. Get Razorpay Order ID from Django Backend
        const razorpayResponse = await fetch(`${API_BASE_URL}/payment/create-order/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ order_id: createdOrder.id }),
        });

        if (!razorpayResponse.ok) {
            const errorData = await razorpayResponse.json();
            throw new Error(errorData.error || "Failed to create Razorpay order.");
        }

        razorpayOrderData = await razorpayResponse.json();
        console.log("Razorpay order created:", razorpayOrderData);

    } catch (error) {
        alert(`Error creating Razorpay order: ${error.message}`);
        setLoading(false);
        return;
    }

    // 4. Initialize and Display Razorpay Payment Modal
    const options = {
        key: RAZORPAY_KEY_ID, // Use the provided key ID
        amount: razorpayOrderData.amount, // This amount already includes the shipping fee
        currency: razorpayOrderData.currency,
        name: razorpayOrderData.name,
        description: `Order ID: ${createdOrder.id}`,
        order_id: razorpayOrderData.razorpay_order_id,
        handler: async (response) => {
            // This function executes on successful payment
            setLoading(true);
            try {
                // 5. Verify Payment on Django Backend
                const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    }),
                });

                if (!verifyResponse.ok) {
                    const errorData = await verifyResponse.json();
                    throw new Error(errorData.error || "Payment verification failed on server.");
                }

                alert("Payment Successful! Your order is now PROCESSING.");
                localStorage.removeItem(MOCK_CART_KEY); // Clear the cart
                setCartItems([]); // Update local state
                
                // FIX: Redirect to the Order History Page after successful payment
                navigate('/orders'); 
                
            } catch (error) {
                alert(`Payment Verification Error: ${error.message}. Please contact support with Order ID ${createdOrder.id}.`);
            } finally {
                setLoading(false);
            }
        },
        prefill: {
            name: `${deliveryDetails.firstName} ${deliveryDetails.lastName}`,
            email: contactInfo.email,
            contact: contactInfo.phone.replace(/[^0-9]/g, '') // Razorpay expects digits only
        },
        theme: {
            color: "#000000"
        }
    };

    // --- FIX FOR WHITE PAGE CRASH (Added try/catch and check) ---
    try {
        if (!window.Razorpay) {
            throw new Error("Razorpay script not loaded. Please try refreshing the page.");
        }

        const rzp1 = new window.Razorpay(options);
        
        // Handle modal closure
        rzp1.on('modal.close', () => {
            alert('Payment process interrupted. Your order status remains PENDING.');
            // Crucial: reset loading if user closes the modal
            setLoading(false); 
        });

        rzp1.open();

    } catch (razorpayError) {
        // Catch synchronous errors from new window.Razorpay() or rzp1.open()
        alert(`Payment Gateway Error: ${razorpayError.message}`);
        setLoading(false);
        return; 
    }
  };


  return (
    <div className="min-h-screen bg-white font-sans">
      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
          {/* --- Left Column: Form --- */}
          <div className="bg-white p-4 sm:p-8 rounded-lg order-2 lg:order-1">
            {activeTab === 'delivery' ? (
                <DeliveryForm 
                    deliveryDetails={deliveryDetails}
                    contactInfo={contactInfo}
                    handleDeliveryChange={handleDeliveryChange}
                    handleContactChange={handleContactChange}
                    setActiveTab={setActiveTab}
                    loading={loading}
                />
            ) : (
                <PaymentForm 
                    setActiveTab={setActiveTab}
                    currentDeliveryAddress={currentDeliveryAddress}
                    handlePlaceOrder={handlePlaceOrder}
                    loading={loading}
                    total={total}
                    LockIcon={LockIcon}
                />
            )}
          </div>

          {/* --- Right Column: Order Summary (UPDATED) --- */}
          <div className="order-1 lg:order-2">
            <div className="bg-white p-4 sm:p-8 rounded-lg">
                <h2 className="text-2xl font-semibold mb-6">Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-6">
                    {cartItems.length === 0 ? (
                        <p className="text-gray-500">Your cart is empty.</p>
                    ) : (
                        cartItems.map(item => (
                            <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "https://placehold.co/80x80/000000/FFFFFF?text=Product";
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{item.name}</p>
                                    <p className="text-sm text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-right flex-shrink-0">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Costs */}
                <div className="mt-8 border-t pt-6 space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Estimated Shipping</span>
                        {/* Only show shipping fee if there are items in the cart */}
                        <span>{cartItems.length > 0 ? `₹${shipping.toFixed(2)}` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg text-black pt-2 border-t mt-3">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}