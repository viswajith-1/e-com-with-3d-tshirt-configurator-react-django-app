import React, { useState } from 'react';

const ProductForm = ({ editingProduct, formError, setIsFormOpen, setEditingProduct, handleProductFormSubmit }) => {
  const [currentImageFile, setCurrentImageFile] = useState(null);

  const handleSubmit = (e) => {
    handleProductFormSubmit(e, currentImageFile);
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">
        {editingProduct ? 'Edit Product' : 'Add New Product'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={editingProduct?.name || ''}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            defaultValue={editingProduct?.description || ''}
            required
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (INR)</label>
            <input
              type="number"
              id="price"
              name="price"
              defaultValue={editingProduct?.price || ''}
              required
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              defaultValue={editingProduct?.stock || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </div>
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={(e) => setCurrentImageFile(e.target.files[0])}
            required={!editingProduct} // Image is only required for new products
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
          />
        </div>
        {formError && <div className="text-sm text-red-500 mt-2">{formError}</div>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => { setIsFormOpen(false); setEditingProduct(null); }}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
          >
            {editingProduct ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

const ProductList = ({ products, handleAddProductClick, handleEditProductClick, handleDeleteProduct }) => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">Manage Products</h3>
      <button
        onClick={handleAddProductClick}
        className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
      >
        Add New Product
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id} className="bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md mb-2" />
            <h4 className="font-bold">{product.name}</h4>
            <p className="text-sm text-gray-600">₹{product.price}</p>
            <p className="text-sm">Stock: {product.stock}</p>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => handleEditProductClick(product)}
              className="flex-1 text-sm bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteProduct(product.id)}
              className="flex-1 text-sm bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);


const AdminProducts = ({ 
  products, 
  isFormOpen, 
  editingProduct, 
  formError, 
  setIsFormOpen, 
  setEditingProduct, 
  handleProductFormSubmit,
  handleEditProductClick,
  handleAddProductClick,
  handleDeleteProduct
}) => {
  if (isFormOpen) {
    return (
      <ProductForm 
        editingProduct={editingProduct} 
        formError={formError} 
        setIsFormOpen={setIsFormOpen} 
        setEditingProduct={setEditingProduct}
        handleProductFormSubmit={handleProductFormSubmit}
      />
    );
  }

  return (
    <ProductList 
      products={products} 
      handleAddProductClick={handleAddProductClick} 
      handleEditProductClick={handleEditProductClick}
      handleDeleteProduct={handleDeleteProduct}
    />
  );
};

export default AdminProducts;