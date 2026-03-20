import { createContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [dbLoaded, setDbLoaded] = useState(false);

  // Fetch from DB when user logs in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5000/api/users/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.wishlist) {
            setWishlist(data.wishlist);
          }
        } catch (err) {
          console.error("Error fetching wishlist", err);
        } finally {
            setDbLoaded(true);
        }
      } else {
        setWishlist([]); // Clear wishlist if logged out
        setDbLoaded(true);
      }
    };
    fetchWishlist();
  }, [user]);

  // General sync to DB function
  const syncWishlistToDB = async (updatedWishlist) => {
    if (!user) return; // DB sync only if logged in
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/users/wishlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ wishlist: updatedWishlist })
      });
    } catch (err) {
      console.error("Error syncing wishlist", err);
    }
  };

  const addToWishlist = (product) => {
    if (!user) {
      toast.error("Please login to use the Wishlist.");
      return;
    }

    const productId = String(product._id || product.id);
    const isExist = wishlist.find((item) => String(item._id || item.id) === productId);
    
    if (isExist) {
        toast.info("Product is already in your wishlist!");
        return;
    }

    const newWishlist = [...wishlist, product];
    setWishlist(newWishlist);
    syncWishlistToDB(newWishlist);
    toast.success("Added to wishlist!");
  };

  const removeFromWishlist = (productId) => {
    if (!user) return;
    const pId = String(productId);
    const newWishlist = wishlist.filter((item) => String(item._id || item.id) !== pId);
    setWishlist(newWishlist);
    syncWishlistToDB(newWishlist);
    toast.success("Removed from wishlist");
  };
  
  const isInWishlist = (productId) => {
      if (!productId) return false;
      const pId = String(productId);
      return wishlist.some(item => String(item._id || item.id) === pId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        dbLoaded // Optional, can be used by UI during strict initial loads
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export default WishlistContext;
