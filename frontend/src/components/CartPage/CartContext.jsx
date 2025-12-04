import React, { createContext, useState, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Function to add a product
  const addToCart = (productToAdd) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === productToAdd.id && item.selectedSize === productToAdd.selectedSize
      );

      if (existingItemIndex > -1) {
        // If item and size exists, increase quantity
        return prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If new item/size, add it with quantity 1
        return [...prevItems, { ...productToAdd, quantity: 1 }];
      }
    });
  };

  // Function to remove or change quantity
  const updateQuantity = (id, size, newQuantity) => {
    setCartItems(prevItems => {
      const targetIndex = prevItems.findIndex(
        item => item.id === id && item.selectedSize === size
      );

      if (targetIndex === -1) return prevItems; // Item not found

      if (newQuantity <= 0) {
        // Remove item if quantity is zero or less
        return prevItems.filter((_, index) => index !== targetIndex);
      } else {
        // Update quantity
        return prevItems.map((item, index) =>
          index === targetIndex
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
    });
  };

  const removeFromCart = (id, size) => {
    setCartItems(prevItems => 
        prevItems.filter(item => !(item.id === id && item.selectedSize === size))
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};