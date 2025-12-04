import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Correcting component paths by assuming a common file extension (.jsx)
import Navbar from "./components/Common/Navbar.jsx";
import HeroSection from "./components/HomePage/HeroSection.jsx";
import FeatureSection from "./components/HomePage/FeatureSection.jsx";
import Footer from "./components/Common/Footer.jsx";
import ProductSection from "./components/ProductPage/ProductSection.jsx";
import TshirtSection from "./components/HomePage/TshirtSection.jsx";
import CartSection from "./components/CartPage/CartSection.jsx";
import AuthSection from "./components/AuthPage/AuthSection.jsx";
import CheckoutSection from "./components/CheckoutPage/CheckoutSection.jsx";
import AdminDashboard from "./components/AdminPage/AdminDashboard.jsx";
import OrderHistoryPage from "./components/OrderPage/OrderHistoryPage.jsx";
import SearchResultsPage from "./components/SearchPage/SearchResults.jsx";
import CustomizationSection from "./components/CustomizePage/CustomizationSection.jsx";
import Drone from "./components/HomePage/Drone.jsx";

// Component containing routing logic and access to React Router hooks
function MainAppContent() {
  // useLocation is valid here because MainAppContent is rendered inside BrowserRouter
  const location = useLocation(); 

  const noNavBarPaths = ["/admin"];

  // Normalize the current path for comparison (e.g., handles /admin/ or /admin)
  const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");
  const isNavBarVisible = !noNavBarPaths.includes(currentPath);

  return (
    <>
      {/* Navbar visibility logic based on path */}
      {isNavBarVisible && <Navbar />} 
      
      <Routes>
        {/* Home Page Route */}
        <Route
          path="/"
          element={
            <>
              {/* <HeroSection /> */}
              <Drone />
              <FeatureSection />
              <TshirtSection />
              <Footer />
            </>
          }
        />

        {/* Other Routes */}
        <Route path="/tshirtsection" element={<TshirtSection />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/cart" element={<CartSection />} />
        <Route path="/auth" element={<AuthSection />} />
        <Route path="/checkout" element={<CheckoutSection />} />
        <Route path="/product/:id" element={<ProductSection />} />
        <Route path="/orders" element={<OrderHistoryPage />} /> 
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
        <Route path="/customization" element={<CustomizationSection/>} />
      </Routes>
    </>
  );
}


// App component wraps the logic in the Router
function App() {
  return (
    <BrowserRouter>
      {/* Renders the content and handles the Navbar visibility */}
      <MainAppContent />
    </BrowserRouter>
  );
}

export default App;
