import { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Error reading cart from localStorage", error);
      return [];
    }
  });

  // Pull cart from DB upon login
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch('http://localhost:5000/api/users/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();

          if (data.success && data.cart) {
            // Check if user has an existing local cart that was created before logging in.
            const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
            if (localCart.length > 0) {
              // Priority given to local cart if it exists (allows picking up items offline before login)
              // If we wanted to merge, we would do complex duplicate checks. 
              // Simplest approach: Push local directly to DB to save it. 
              syncCartToDB(localCart);
            } else {
              // Otherwise load their previously saved DB cart into state and local.
              setCartItems(data.cart);
              localStorage.setItem("cart", JSON.stringify(data.cart));
            }
          }
        } catch (err) {
          console.error("Error fetching db cart", err);
        }
      }
    };
    fetchCart();
  }, [user]);

  // Persists to DB whenever cart is updated (if user is logged in)
  const syncCartToDB = async (itemsToSync) => {
    // Save locally first to keep things instant and offline-friendly
    setCartItems(itemsToSync);
    localStorage.setItem("cart", JSON.stringify(itemsToSync));

    if (user) {
      try {
        const token = localStorage.getItem("token");
        await fetch('http://localhost:5000/api/users/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cart: itemsToSync })
        });
      } catch (err) {
        console.error("Error syncing cart to DB", err);
      }
    }
  };

  const addToCart = (product, quantity = 1) => {
    let newItems;
    const existingItem = cartItems.find((item) => item.product === (product._id || product.id));

    if (existingItem) {
      newItems = cartItems.map((item) =>
        item.product === (product._id || product.id)
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [
        ...cartItems,
        {
          product: product._id || product.id,
          name: product.name,
          image: product.image || (product.images && product.images[0]?.url) || "/placeholder.jpg",
          price: product.price,
          stock: product.stock,
          quantity: quantity,
        },
      ];
    }
    syncCartToDB(newItems);
  };

  const removeFromCart = (id) => {
    const newItems = cartItems.filter((item) => item.product !== id);
    syncCartToDB(newItems);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    const newItems = cartItems.map((item) => (item.product === id ? { ...item, quantity } : item));
    syncCartToDB(newItems);
  };

  const clearCart = () => {
    syncCartToDB([]); // Clears from DB and local
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
