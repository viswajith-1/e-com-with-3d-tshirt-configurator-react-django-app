import React from 'react';

const UserForm = ({ editingUser, userFormError, setIsUserFormOpen, setEditingUser, handleUserFormSubmit }) => (
  <div className="p-6">
    <h3 className="text-xl font-semibold mb-4">Edit User: {editingUser.username}</h3>
    <form onSubmit={handleUserFormSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          defaultValue={editingUser?.username || ''}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={editingUser?.email || ''}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (optional)</label>
        <input
          type="password"
          id="password"
          name="password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_staff"
          name="is_staff"
          defaultChecked={editingUser?.is_staff || false}
          className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
        />
        <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-700">Is Admin</label>
      </div>
      {userFormError && <div className="text-sm text-red-500 mt-2">{userFormError}</div>}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => { setIsUserFormOpen(false); setEditingUser(null); }}
          className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
);

const UserList = ({ users, handleEditUserClick, handleDeleteUser }) => (
  <div className="p-6">
    <h3 className="text-xl font-semibold mb-4">Registered Users</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-200 text-left text-sm font-semibold text-gray-600">
            <th className="p-3">User ID</th>
            <th className="p-3">Username</th>
            <th className="p-3">Email</th>
            <th className="p-3">Is Admin</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="p-3 text-sm">{user.id}</td>
              <td className="p-3 text-sm">{user.username}</td>
              <td className="p-3 text-sm">{user.email}</td>
              <td className="p-3 text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.is_staff ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_staff ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="p-3 text-sm flex space-x-2">
                <button
                  onClick={() => handleEditUserClick(user)}
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-800 transition-colors font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


const AdminUsers = ({ 
  users, 
  isUserFormOpen, 
  editingUser, 
  userFormError, 
  setIsUserFormOpen, 
  setEditingUser, 
  handleUserFormSubmit,
  handleEditUserClick,
  handleDeleteUser
}) => {
  if (isUserFormOpen && editingUser) {
    return (
      <UserForm 
        editingUser={editingUser} 
        userFormError={userFormError} 
        setIsUserFormOpen={setIsUserFormOpen} 
        setEditingUser={setEditingUser}
        handleUserFormSubmit={handleUserFormSubmit}
      />
    );
  }

  return (
    <UserList 
      users={users} 
      handleEditUserClick={handleEditUserClick} 
      handleDeleteUser={handleDeleteUser} 
    />
  );
};

export default AdminUsers;