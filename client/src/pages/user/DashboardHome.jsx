import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Package } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    wishlistItems: 0
  });

  useEffect(() => {
    // In a real app, fetch these stats from the backend.
    // We'll mock wishlist and reward points for now, fetch real orders.
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5000/api/orders/myorders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const orders = data.orders;
          setStats(prev => ({
            ...prev,
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Pending').length
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    // Also read wishlist from local storage
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setStats(prev => ({
      ...prev,
      wishlistItems: storedWishlist.length
    }));

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Hello, {user?.name}!</h2>
        <p className="text-gray-500 mt-1">Welcome back to your dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: stats.totalOrders },
          { label: "Pending Orders", value: stats.pendingOrders },
          { label: "Wishlist Items", value: stats.wishlistItems }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-3xl font-bold text-orange-500 mb-2">{stat.value}</span>
            <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-slate-800">Recent Orders</h3>
        </div>
        
        {stats.totalOrders === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Package className="w-8 h-8" />
            </div>
            <p className="text-gray-500 font-medium mb-4">No orders yet</p>
            <Link to="/products" className="bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            <Link to="/dashboard/orders" className="text-orange-500 hover:underline">View all orders</Link>
          </div>
        )}
      </div>
    </div>
  );
}
