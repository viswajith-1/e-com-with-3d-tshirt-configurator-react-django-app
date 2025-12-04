import React from 'react';

const AdminCategories = ({ products, error, handleCategoryToggle }) => {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Manage T-shirt Categories</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-200 text-left text-sm font-semibold text-gray-600">
              <th className="p-3">Product Name</th>
              <th className="p-3 text-center">Featured</th>
              <th className="p-3 text-center">Trending</th>
              <th className="p-3 text-center">Best Seller</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="p-3 text-sm">{product.name}</td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={product.is_featured}
                    onChange={() => handleCategoryToggle(product.id, 'is_featured')}
                    className="h-5 w-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={product.is_trending}
                    onChange={() => handleCategoryToggle(product.id, 'is_trending')}
                    className="h-5 w-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={product.is_bestseller}
                    onChange={() => handleCategoryToggle(product.id, 'is_bestseller')}
                    className="h-5 w-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default AdminCategories;