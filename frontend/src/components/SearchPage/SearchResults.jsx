import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios'; // Import axios for fetching data

// --- API Configuration ---
const API_BASE_URL = "http://localhost:8000/api";

// --- Mock Data (Removing it, but keeping the structure for reference) ---
// const MOCK_PRODUCTS = [ ... ]; 

const FILTER_OPTIONS = {
  Size: ["XS", "S", "M", "L", "XL"],
  Color: ["Black", "White", "Gray", "Blue", "Pink"],
};

// --- Icons (Same as before) ---
const FilterIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>
);

// --- Product Card Component (Minor update for image URL/price display) ---

const ProductCard = ({ product }) => {
  // Simple check for price to mimic Nike's price styling
  const isSale = parseFloat(product.price) < 5000 && parseFloat(product.price) > 0;

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <div className="flex flex-col h-full">
        {/* Product Image Area */}
        <div className="bg-gray-100 mb-2 overflow-hidden aspect-square">
          <img
            // Use the actual image field from the backend
            src={product.image || `https://placehold.co/400x400/f3f4f6/9ca3af?text=Image+Missing`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/400x400/f3f4f6/9ca3af?text=T-Shirt`;
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col text-sm flex-grow">
          {isSale && (
            <p className="text-red-600 font-medium mb-1">On Sale</p>
          )}
          <h3 className="font-semibold text-gray-900 leading-tight">
            {product.name}
          </h3>
          <p className="text-gray-500 mt-1 mb-2">T-Shirt</p>
          
          {/* Price */}
          <div className="mt-auto pt-1">
            <p className="font-bold text-gray-900">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};


// --- Filter Sidebar Component (Same as before) ---
const FilterSidebar = ({ selectedFilters, onFilterChange, onClearAll }) => {
  
  const FilterGroup = ({ title, options }) => (
    <div className="border-b border-gray-200 py-6">
      <h4 className="text-lg font-semibold mb-3">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center">
            <input
              id={`filter-${title}-${option}`}
              name={`${title.toLowerCase()}`}
              type="checkbox"
              checked={selectedFilters[title.toLowerCase()]?.includes(option)}
              onChange={() => onFilterChange(title.toLowerCase(), option)}
              className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <label
              htmlFor={`filter-${title}-${option}`}
              className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-gray-900"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const activeFiltersCount = Object.values(selectedFilters).flat().length;

  return (
    <div className="p-4 lg:p-0">
      <div className="hidden lg:block">
        <h3 className="text-xl font-bold mb-6">Filter Results</h3>
        {/* Only Size and Color remain */}
        {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
          <FilterGroup key={key} title={key} options={options} />
        ))}
      </div>

      {/* Clear All Button for Desktop */}
      {activeFiltersCount > 0 && (
        <button
          onClick={onClearAll}
          className="hidden lg:block mt-6 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-700 transition duration-150"
        >
          Clear All Filters ({activeFiltersCount})
        </button>
      )}
    </div>
  );
};

// --- Main Component: Fetches and displays products ---
function ProductGridDisplay() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ? searchParams.get('q').toLowerCase() : '';
  
  // NEW STATE: To hold all products fetched from the backend
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortOption, setSortOption] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // NEW EFFECT: Fetch products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch ALL products from your backend endpoint
            const response = await axios.get(`${API_BASE_URL}/products/`);
            setAllProducts(response.data);
        } catch (err) {
            setError("Failed to fetch products. Check backend API status.");
            console.error("Error fetching products:", err);
        } finally {
            setIsLoading(false);
        }
    };
    fetchProducts();
  }, []); // Empty dependency array means it runs once on mount

  // Handlers (Same as before)
  const handleFilterChange = (key, value) => {
    const filterKey = key.toLowerCase();
    setSelectedFilters(prev => {
      const currentValues = prev[filterKey] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value) // Remove
        : [...currentValues, value]; // Add
      
      const newState = { ...prev, [filterKey]: updatedValues };
      if (updatedValues.length === 0) {
        delete newState[filterKey];
      }
      return newState;
    });
  };

  const handleClearAll = () => {
    setSelectedFilters({});
  };

  // Filter and Sort Logic - NOW filters the fetched 'allProducts'
  const processedProducts = useMemo(() => {
    let results = allProducts.filter(product => {
      
      // 1. Apply Search Query Filter
      if (searchQuery) {
        // Check if product name or description contains the query
        const nameMatch = product.name.toLowerCase().includes(searchQuery);
        const descriptionMatch = product.description.toLowerCase().includes(searchQuery);
        
        if (!nameMatch && !descriptionMatch) {
            return false; 
        }
      }
      
      // 2. Apply Sidebar Filters
      let matches = true;
      for (const [key, values] of Object.entries(selectedFilters)) {
        if (values.length > 0) {
          const filterKey = key.toLowerCase();
          
          // NOTE: Your backend 'Product' model doesn't have explicit 'color' or 'size' fields.
          // For now, we'll skip complex attribute filtering and just use the mock filter logic.
          // In a real app, you'd check a dedicated `product.color` or `product.sizes` array/field.

          // Since the mock data logic expects 'color' and 'size' arrays, 
          // we'll assume the product object might have a simple `color` property 
          // and skip `size` filtering for now, as it's complex without backend support.
          
          if (filterKey === 'color') {
              // Simple text matching on a hypothetical color field
              if (!product.color || !values.includes(product.color)) {
                  matches = false;
                  break;
              }
          }
          // The stock product model doesn't support the 'size' filter easily, so we skip it.
          // You would need to add a `sizes` field to your Django model for this to work robustly.
        }
      }
      return matches;
    });

    // Apply sorting
    results.sort((a, b) => {
      // Convert price to number for sorting
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);

      if (sortOption === 'newest') return new Date(b.created_at) - new Date(a.created_at); 
      if (sortOption === 'price-low') return priceA - priceB;
      if (sortOption === 'price-high') return priceB - priceA;
      return 0;
    });
    
    return results;
  }, [allProducts, selectedFilters, sortOption, searchQuery]); 

  // Dynamically set the page title based on the search query
  const pageTitle = searchQuery 
    ? `Search Results for "${searchQuery}"` 
    : "All Products";

  const productCount = processedProducts.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading products...</div>
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
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wider">
            {pageTitle}
          </h1>
          <p className="text-lg text-gray-500 mt-1">
            {productCount} {productCount === 1 ? 'Item' : 'Items'} Found
          </p>
          
          {searchQuery && (
              <p className="text-sm text-gray-600 mt-2">
                  Showing results for: <span className="font-semibold capitalize">{searchQuery}</span>
              </p>
          )}
        </header>

        <div className="lg:grid lg:grid-cols-4 lg:gap-x-12">
          
          <div className="flex justify-between items-center lg:hidden border-b border-gray-200 pb-4 mb-4">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FilterIcon className="w-5 h-5" />
              <span>Filter ({Object.values(selectedFilters).flat().length})</span>
            </button>
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="py-1 px-3 border border-gray-300 rounded-full text-sm focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low-High</option>
              <option value="price-high">Price: High-Low</option>
            </select>
          </div>
          
          <div className="hidden lg:block lg:col-span-1 border-r border-gray-200 lg:pr-6">
            <FilterSidebar 
              selectedFilters={selectedFilters} 
              onFilterChange={handleFilterChange} 
              onClearAll={handleClearAll}
            />
          </div>

          <div className="lg:col-span-3">
            
            <div className="hidden lg:flex justify-end items-center mb-6">
              <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 mr-3">
                Sort By:
              </label>
              <select
                id="sort-by"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="py-2 px-4 border border-gray-300 rounded-full text-sm focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low-High</option>
                <option value="price-high">Price: High-Low</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:grid-cols-3 lg:gap-x-8">
              {productCount > 0 ? (
                processedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-gray-500">
                  <p className="text-xl font-semibold mb-2">
                    {searchQuery 
                        ? `No products found matching "${searchQuery}" and current filters.`
                        : "No products match your filters."
                    }
                  </p>
                  <button onClick={handleClearAll} className="text-gray-900 underline hover:text-gray-700">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 z-40 bg-white overflow-y-auto transform transition-transform duration-300 ease-in-out lg:hidden"
        >
          <div className="px-4 py-6 sm:px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Filter</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <XIcon className="w-6 h-6 text-gray-900" />
              </button>
            </div>
            
            <FilterSidebar 
              selectedFilters={selectedFilters} 
              onFilterChange={handleFilterChange} 
              onClearAll={handleClearAll}
            />

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 sm:-mx-6">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 text-lg font-bold text-white bg-gray-900 rounded-full hover:bg-gray-700 transition duration-150"
              >
                View {productCount} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the component that uses the hooks
export default function SearchResultsPage() {
  return <ProductGridDisplay />;
}