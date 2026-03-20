import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Users, ShoppingCart, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: [],
    lowStock: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [ordersRes, productsRes, usersRes] = await Promise.all([
          fetch('http://localhost:5000/api/orders', { headers }),
          fetch('http://localhost:5000/api/products', { headers }),
          fetch('http://localhost:5000/api/users', { headers })
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const usersData = await usersRes.json();

        if (ordersData.success && productsData.success && usersData.success) {
          setStats({
            totalSales: ordersData.totalAmount || 0,
            totalOrders: ordersData.orders?.length || 0,
            totalUsers: usersData.users?.length || 0,
            totalProducts: productsData.count || productsData.products?.length || 0,
            recentOrders: ordersData.orders?.slice(0, 5).reverse() || [],
            lowStock: productsData.products?.filter(p => p.stock < 10).slice(0, 5) || []
          });
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Link to="/admin">
            <div className="bg-orange-500 text-white p-6 rounded-lg hover:bg-orange-600 transition-colors cursor-pointer">
              <TrendingUp className="h-6 w-6 mb-2" />
              <h3 className="font-semibold text-sm">Dashboard</h3>
            </div>
          </Link>
          <Link to="/admin/products">
            <div className="bg-white p-6 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200">
              <Package className="h-6 w-6 mb-2 text-gray-700" />
              <h3 className="font-semibold text-sm text-gray-900">Products</h3>
            </div>
          </Link>
          <Link to="/admin/orders">
            <div className="bg-white p-6 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200">
              <ShoppingCart className="h-6 w-6 mb-2 text-gray-700" />
              <h3 className="font-semibold text-sm text-gray-900">Orders</h3>
            </div>
          </Link>
          <Link to="/admin/users">
            <div className="bg-white p-6 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200">
              <Users className="h-6 w-6 mb-2 text-gray-700" />
              <h3 className="font-semibold text-sm text-gray-900">Users</h3>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSales.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl font-bold">₹</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? <p className="text-sm text-gray-500">No orders yet.</p> : stats.recentOrders.map((o) => (
                <div key={o._id} className="flex justify-between items-center pb-4 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Order #{o._id?.toString().slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{o.orderItems?.length || 0} items • ₹{o.totalPrice}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    o.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                    o.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {o.orderStatus || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Low Stock Alerts</h3>
            <div className="space-y-4">
              {stats.lowStock.length === 0 ? <p className="text-sm text-gray-500">No inventory alerts.</p> : stats.lowStock.map((item, i) => (
                <div key={item._id} className="flex justify-between items-center pb-4 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Only {item.stock} units left</p>
                  </div>
                  <Link to={`/admin/products/edit/${item._id}`} className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 font-medium transition-colors">
                    Add Stock
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
