import { useState, useEffect } from 'react';
import axios from 'axios';
// Assuming you are using react-router-dom for navigation
import { useNavigate } from 'react-router-dom';
import AdminStats from './AdminStats';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';

const API_BASE_URL = 'http://localhost:8000/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Product Management States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState('');

  // User Management States
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormError, setUserFormError] = useState('');

  const accessToken = localStorage.getItem('access_token');
  const navigate = useNavigate(); // Hook for navigation

  const fetchProducts = async () => {
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/products/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
      setProducts(productsResponse.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please check your permissions.');
    }
  };

  const fetchUsers = async () => {
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/admin/users/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
      setUsers(usersResponse.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUserFormError('Failed to load users. Please check your permissions.');
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const authHeaders = { 'Authorization': `Bearer ${accessToken}` };
      const [statsResponse, productsResponse, ordersResponse, usersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats/`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/products/`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/admin/orders/`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/admin/users/`, { headers: authHeaders }),
      ]);

      setStats(statsResponse.data);
      setProducts(productsResponse.data);
      setOrders(ordersResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load dashboard data. Please check your permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);


  // --- Logout Handler (FIXED) ---
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Clear any other user-related items you store
    navigate('/'); // Redirect to the root path
  };


  // --- Product Handlers ---

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
    setFormError('');
    setActiveTab('products');
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
    setFormError('');
    setImageFile(null);
    setActiveTab('products');
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${productId}/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        setFormError('Failed to delete product.');
      }
    }
  };

  const handleProductFormSubmit = async (e, currentImageFile) => {
    e.preventDefault();
    setFormError('');

    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('description', e.target.description.value);
    formData.append('price', e.target.price.value);
    formData.append('stock', e.target.stock.value);

    if (currentImageFile) {
      formData.append('image', currentImageFile);
    } else if (!editingProduct) {
      setFormError('Image is required for new products.');
      return;
    }

    try {
      const productHeaders = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' };
      if (editingProduct) {
        await axios.patch(`${API_BASE_URL}/products/${editingProduct.id}/`, formData, { headers: productHeaders });
      } else {
        await axios.post(`${API_BASE_URL}/products/`, formData, { headers: productHeaders });
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err.response?.data);
      setFormError('Failed to save product. Check the form data.');
    }
  };

  // --- User Handlers ---

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
    setUserFormError('');
    setActiveTab('users');
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/users/${userId}/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setUserFormError('Failed to delete user.');
      }
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setUserFormError('');

    const userData = {
      username: e.target.username.value,
      email: e.target.email.value,
      is_staff: e.target.is_staff.checked,
    };

    const password = e.target.password.value;
    if (password) {
      userData.password = password;
    }

    try {
      const userHeaders = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
      // User update endpoint is /admin/users/<int:user_id>/
      // which uses the PATCH method, as defined in your backend structure (List/Update/Destroy is typical for generics.RetrieveUpdateDestroyAPIView)
      // Since your backend uses generics.ListAPIView, you might need a custom view or a ViewSet for PATCH/DELETE.
      // Based on your previous logic, we'll assume a PATCH to the user detail URL:
      await axios.patch(`${API_BASE_URL}/admin/users/${editingUser.id}/`, userData, { headers: userHeaders });
      setIsUserFormOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err.response?.data);
      setUserFormError('Failed to save user. Check the form data. (Ensure backend supports PATCH on this URL)');
    }
  };

  // --- Category Handler ---

  const handleCategoryToggle = async (productId, category) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        const payload = {};
        payload[category] = !product[category];
        const categoryHeaders = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
        await axios.patch(`${API_BASE_URL}/products/${productId}/`, payload, { headers: categoryHeaders });
        fetchProducts();
      }
    } catch (err) {
      console.error('Error toggling category:', err);
      setError('Failed to update product category.');
    }
  };

  // --- Order Handler ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderHeaders = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
      // This URL matches the one you defined in urls.py: path('admin/orders/<int:order_id>/status/', ...)
      await axios.patch(`${API_BASE_URL}/admin/orders/${orderId}/status/`, { status: newStatus }, { headers: orderHeaders });

      // Optimistically update the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setError('');
    } catch (err) {
      console.error('Error updating order status:', err.response?.data);
      setError('Failed to update order status. Check API/permissions.');
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Loading...</div>;
    }
    if (error && activeTab !== 'orders' && activeTab !== 'users') {
      return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    switch (activeTab) {
      case 'stats':
        return <AdminStats stats={stats} />;
      case 'products':
        return (
          <AdminProducts
            products={products}
            isFormOpen={isFormOpen}
            editingProduct={editingProduct}
            formError={formError}
            imageFile={imageFile}
            setIsFormOpen={setIsFormOpen}
            setEditingProduct={setEditingProduct}
            setImageFile={setImageFile}
            handleProductFormSubmit={handleProductFormSubmit}
            handleEditProductClick={handleEditProductClick}
            handleAddProductClick={handleAddProductClick}
            handleDeleteProduct={handleDeleteProduct}
          />
        );
      case 'categories':
        return (
          <AdminCategories
            products={products}
            error={error}
            handleCategoryToggle={handleCategoryToggle}
          />
        );
      case 'orders':
        return <AdminOrders orders={orders} handleUpdateOrderStatus={handleUpdateOrderStatus} generalError={error} />;
      case 'users':
        return (
          <AdminUsers
            users={users}
            isUserFormOpen={isUserFormOpen}
            editingUser={editingUser}
            userFormError={userFormError}
            setIsUserFormOpen={setIsUserFormOpen}
            setEditingUser={setEditingUser}
            handleUserFormSubmit={handleUserFormSubmit}
            handleEditUserClick={handleEditUserClick}
            handleDeleteUser={handleDeleteUser}
          />
        );
      default:
        return null;
    }
  };

  // Helper to reset form states when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsFormOpen(false);
    setIsUserFormOpen(false);
    setEditingProduct(null);
    setEditingUser(null);
    setError('');
  };

  const NavButton = ({ tab, children }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
              </div>
            </div>

            {/* Desktop Tabs and Logout (flex layout) - Hidden on small screens (md:flex) */}
            <div className="hidden md:flex items-center space-x-4">
              <NavButton tab="stats">Stats</NavButton>
              <NavButton tab="products">Products</NavButton>
              <NavButton tab="categories">T-shirt Categories</NavButton>
              <NavButton tab="orders">Orders</NavButton>
              <NavButton tab="users">Users</NavButton>
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                Logout
              </button>
            </div>

            {/* Mobile-only Logout (Visible only on small screens) */}
            <div className="flex md:hidden items-center">
                <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                    Logout
                </button>
            </div>
          </div>

          {/* Mobile Tab Navigation Section (Horizontal Scroll) - Visible only on small screens (md:hidden) */}
          <div className="py-2 overflow-x-auto whitespace-nowrap md:hidden border-t border-gray-100">
            <div className="flex space-x-4">
              <NavButton tab="stats">Stats</NavButton>
              <NavButton tab="products">Products</NavButton>
              <NavButton tab="categories">T-shirt Categories</NavButton>
              <NavButton tab="orders">Orders</NavButton>
              <NavButton tab="users">Users</NavButton>
              {/* Logout is handled in the main flex container on mobile */}
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;