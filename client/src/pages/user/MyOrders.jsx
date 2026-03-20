import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { PackageOpen } from "lucide-react";

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5000/api/orders/myorders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          // Sort by newest first
          setOrders(data.orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
          toast.error("Failed to load orders");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading orders...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-slate-800">My Orders</h2>
        <p className="text-gray-500 text-sm mt-1">View and track your previous orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <PackageOpen className="w-8 h-8" />
          </div>
          <p className="text-gray-500 font-medium mb-4">You haven't placed any orders yet</p>
          <Link to="/products" className="bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <div key={order._id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
                <div>
                  <p className="font-semibold text-slate-800">Order ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-orange-500">₹{order.totalPrice}</p>
                    <p className="text-xs text-gray-400">{order.paymentInfo.status}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                      <Link to={`/invoice/${order._id}`} target="_blank" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 hover:text-orange-600 transition-colors shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 13L12 16L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 19H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        PDF Invoice
                      </Link>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product}`}>
                        <p className="font-medium inline-block text-slate-800 hover:text-orange-500 truncate w-full">{item.name}</p>
                      </Link>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
