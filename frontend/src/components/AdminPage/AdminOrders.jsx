import React from 'react';

const AdminOrders = ({ orders, handleUpdateOrderStatus, generalError }) => {
  const STATUS_OPTIONS = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (orderId, e) => {
    const newStatus = e.target.value;
    handleUpdateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">User Orders</h3>
      {generalError && <div className="text-sm text-red-500 mb-4">{generalError}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-200 text-left text-sm font-semibold text-gray-600">
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="p-3 text-sm">{order.id}</td>
                <td className="p-3 text-sm">{order.customer.username}</td>
                <td className="p-3 text-sm">₹{order.total_price}</td>
                <td className="p-3 text-sm">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e)}
                    className={`p-1 text-xs font-semibold rounded-md border appearance-none cursor-pointer ${getStatusColor(order.status)}`}
                    style={{ minWidth: '120px' }}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;