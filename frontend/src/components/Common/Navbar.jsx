import React, { useState, memo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- SVG ICON COMPONENTS (Memoized for performance) ---

const SearchIcon = memo(({ className = "h-6 w-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
));


// MODIFIED ShoppingBagIcon component to use red badge
const ShoppingBagIcon = memo(({ count = 0 }) => (
  <div className="relative">
    <svg 
      className="h-6 w-6 stroke-2 text-gray-800"
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" /> 
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
    
    {count > 0 && (
      <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-600 text-white text-xs font-bold leading-none transform translate-x-1/4 -translate-y-1/4 ring-2 ring-white">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </div>
));

const MenuIcon = memo(() => (
  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
));

const XIcon = memo(() => (
    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
));

// SWAPPED: Now contains the Admin Dashboard Icon SVG
const OrderHistoryIcon = memo(({ className = "h-6 w-6" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l10 5-10 5-10-5 10-5z" />
        <path d="M2 12l10 5 10-5" />
        <path d="M2 17l10 5 10-5" />
    </svg>
));

// SWAPPED: Now contains the Order History Icon SVG
const AdminDashboardIcon = memo(({ className = "h-6 w-6" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
));


// --- DATA & STYLES ---
// CORRECTED: Added fragment identifiers for smooth scrolling to sections
const navLinks = [
  { href: '/tshirtsection', text: 'New & Featured' },
  { href: '/tshirtsection', text: 'Trending' },
  { href: '/tshirtsection', text: 'Best Sellers' },
  { href: '/customization', text: 'Customize' },
];

const desktopLinkClasses = "text-base font-medium text-gray-600 hover:text-black hover:underline underline-offset-8 decoration-2";
const mobileLinkClasses = "text-lg font-medium text-gray-600 hover:text-black";

// Component for the Nexus brand text
const NexusBrand = memo(({ size = "lg" }) => (
    <span className={`font-extrabold text-black ${size === 'lg' ? 'text-2xl sm:text-3xl tracking-tight' : 'text-xl'}`}>
        NEXUS
    </span>
));

// --- NAVBAR SUB-COMPONENTS ---

// MODIFIED: Added search functionality props
const MainNav = memo(({ onMenuToggle, cartItemCount, isLoggedIn, isAdmin, username, onLogout, onSearchSubmit, searchTerm, onSearchChange }) => {
  return (
    <nav className="bg-white px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center justify-between h-16">
        {/* Replaced Logo with Nexus text */}
        <Link to="/" className="flex-shrink-0">
            <NexusBrand size="lg" />
        </Link>
        
        <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-8">
          {navLinks.map(link => (
            // NOTE: Using <a> tag here as the links are internal fragment identifiers
            <a key={link.text} href={link.href} className={desktopLinkClasses}>{link.text}</a>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Search Bar */}
            <form 
                onSubmit={onSearchSubmit} 
                className="hidden lg:flex items-center bg-gray-100 rounded-full px-3 py-1.5"
            >
                <button aria-label="Search" className="p-1 text-gray-600 hover:text-black">
                    <SearchIcon className="h-5 w-5"/>
                </button>
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="bg-transparent focus:outline-none text-sm w-28"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </form>
            
            {/* Mobile Search Button - Clicking this will now toggle a separate search input on mobile */}
            <button 
                onClick={() => onSearchChange(searchTerm)} // A simple click on mobile won't navigate, but it could open a modal (which we don't build here). Sticking to input on mobile menu.
                aria-label="Search" 
                className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
            >
                <SearchIcon />
            </button>
            <Link to="/cart" aria-label="Shopping Bag" className="relative p-2 rounded-full hover:bg-gray-100">
                <ShoppingBagIcon count={cartItemCount} />
            </Link>
            
            {/* Conditional rendering for Logged-in state (Desktop) */}
            {isLoggedIn ? (
                <>
                    {/* NEW: Admin Dashboard Icon (now using the Order History visual) */}
                    {isAdmin && (
                        <Link to="/admin" aria-label="Admin Dashboard" className="p-2 rounded-full hover:bg-gray-100 hidden lg:block">
                            <AdminDashboardIcon />
                        </Link>
                    )}

                    {/* Order History Icon (now using the Admin Dashboard visual) */}
                    <Link to="/orders" aria-label="Order History" className="p-2 rounded-full hover:bg-gray-100 hidden lg:block">
                        <OrderHistoryIcon />
                    </Link>
                    
                    {/* "Hi, [Username]" */}
                    <span className="text-sm font-medium text-gray-600 hidden lg:block whitespace-nowrap">
                        Hi, {username}
                    </span>
                    
                    {/* Logout Button */}
                    <button 
                        onClick={onLogout} 
                        className="text-sm font-medium text-gray-600 hover:text-black hidden lg:block"
                    >
                        Logout
                    </button>
                </>
            ) : (
                /* Show Sign In link only if NOT logged in */
                <Link to="/auth" className="text-sm font-medium text-gray-600 hover:text-black hidden lg:block">
                    Sign In
                </Link>
            )}

            <button onClick={onMenuToggle} aria-label="Open main menu" className="p-2 rounded-md inline-flex items-center justify-center text-gray-700 hover:bg-gray-100 lg:hidden">
              <MenuIcon />
            </button>
        </div>
      </div>
    </nav>
  );
});

const PromoBar = memo(() => {
  return (
    <div className="bg-gray-100 text-center py-2 px-4">
        <p className="text-xs sm:text-sm text-gray-800">
          New Members Enjoy 15% Off On The Nexus App. Use: APP15 
          <a href="#" className="font-semibold underline ml-1 sm:ml-2">Download Now</a>
        </p>
    </div>
  );
});

// MODIFIED: Added search functionality props to MobileMenu
const MobileMenu = memo(({ isOpen, onClose, isLoggedIn, isAdmin, onLogout, onSearchSubmit, searchTerm, onSearchChange }) => {
    if (!isOpen) return null;

    return (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={onClose}>
            <div className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    {/* Replaced Logo with Nexus text */}
                    <Link to="/"><NexusBrand size="sm" /></Link>
                    <button onClick={onClose} aria-label="Close menu" className="p-2 -mr-2"><XIcon /></button>
                </div>

                {/* Mobile Search Input */}
                <form onSubmit={(e) => { onSearchSubmit(e); onClose(); }} className="flex items-center mb-6 border border-gray-300 rounded-full px-3 py-1">
                    <button type="submit" aria-label="Search" className="p-1 text-gray-600 hover:text-black">
                        <SearchIcon className="h-5 w-5"/>
                    </button>
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="bg-transparent focus:outline-none text-base w-full"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </form>

                <nav className="flex flex-col space-y-4">
                  {navLinks.map(link => (
                    // NOTE: Using <a> tag here as the links are internal fragment identifiers
                    <a key={link.text} href={link.href} onClick={onClose} className={mobileLinkClasses}>{link.text}</a>
                  ))}
                </nav>
                
                {/* NEW: Mobile Admin Dashboard Link */}
                {isLoggedIn && isAdmin && (
                    <Link to="/admin" onClick={onClose} className={`mt-4 ${mobileLinkClasses}`}>Admin Dashboard</Link>
                )}

                {/* Mobile Order History Link */}
                {isLoggedIn && (
                    <Link to="/orders" onClick={onClose} className={`mt-4 ${mobileLinkClasses}`}>Order History</Link>
                )}

                 <div className="absolute bottom-6 left-6 right-6 flex flex-col space-y-2 text-sm">
                    {/* Conditional button for mobile (Sign In or Logout) */}
                    {isLoggedIn ? (
                        <button 
                            onClick={onLogout} 
                            className="font-semibold py-2 px-3 border border-gray-300 rounded-full text-center hover:bg-gray-50"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link 
                            to="/auth" 
                            onClick={onClose}
                            className="font-semibold py-2 px-3 border border-gray-300 rounded-full text-center hover:bg-gray-50"
                        >
                            Sign In
                        </Link>
                    )}
                 </div>
            </div>
        </div>
    );
});

// --- MAIN NAVBAR EXPORT ---

const MOCK_CART_KEY = 'mockCart'; 

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0); 
  // NEW: State for auth status, user name, and admin status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // NEW
  
  // NEW: Search State
  const [searchTerm, setSearchTerm] = useState('');

  const getCartCount = () => {
    try {
      const storedCart = JSON.parse(localStorage.getItem(MOCK_CART_KEY) || '[]');
      const totalCount = storedCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalCount);
    } catch (error) {
      console.error("Could not read cart count:", error);
      setCartItemCount(0);
    }
  };

  // NEW: Function to check login status, username, and admin status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('username');
    const storedIsAdmin = localStorage.getItem('is_admin') === 'true'; // Convert string to boolean
    
    if (token && storedUsername) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
        setIsAdmin(storedIsAdmin); // Set admin status
    } else {
        setIsLoggedIn(false);
        setUsername('');
        setIsAdmin(false); // Clear admin status on logout
    }
  };

  // Logout handler
  const handleLogout = () => {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('username');
    
    // Update state
    setIsLoggedIn(false);
    setUsername('');
    setIsAdmin(false); // Ensure admin status is cleared
    
    // Close mobile menu if it's open
    closeMenu();
    
    // Redirect to home page
    navigate('/'); 
  };
  
  // NEW: Search Submission Handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        // Navigate to the search results page with the query parameter 'q'
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
    closeMenu();
  };


  useEffect(() => {
    getCartCount();
    checkAuthStatus();
    
    // Poll the cart and auth status periodically 
    const interval = setInterval(() => {
        getCartCount();
        checkAuthStatus();
    }, 500); 
    
    return () => clearInterval(interval);
  }, []); 

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="font-sans antialiased text-gray-800">
        <header className="relative z-10">
            <MainNav 
                onMenuToggle={toggleMenu} 
                cartItemCount={cartItemCount}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin} // PASS NEW PROP
                username={username}
                onLogout={handleLogout}
                // NEW: Search Props
                onSearchSubmit={handleSearchSubmit} 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            <PromoBar />
        </header>
        <MobileMenu 
            isOpen={isMenuOpen} 
            onClose={closeMenu} 
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin} // PASS NEW PROP
            onLogout={handleLogout}
            // NEW: Search Props
            onSearchSubmit={handleSearchSubmit} 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
        />
    </div>
  );
}