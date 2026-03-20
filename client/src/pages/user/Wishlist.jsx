import { useContext } from "react";
import { Link } from "react-router-dom";
import WishlistContext from "../../context/WishlistContext";
import ProductCard from "../../components/ProductCard";
import { HeartCrack } from "lucide-react";

export default function Wishlist() {
  const { wishlist } = useContext(WishlistContext);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-full">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-slate-800">My Wishlist</h2>
        <p className="text-gray-500 text-sm mt-1">Products you saved for later</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="p-16 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
            <HeartCrack className="w-10 h-10" />
          </div>
          <p className="text-gray-500 font-medium mb-6 text-lg">Your wishlist is completely empty.</p>
          <Link to="/products" className="bg-orange-500 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors shadow-sm">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
