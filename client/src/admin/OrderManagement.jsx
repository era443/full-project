import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order status updated!");
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-700 bg-green-50';
      case 'Shipped':
        return 'text-blue-700 bg-blue-50';
      case 'Processing':
        return 'text-yellow-700 bg-yellow-50';
      case 'Pending':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getOrderCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.orderStatus?.toLowerCase() === status).length;
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus?.toLowerCase() === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage customer orders and track fulfillment status.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export Orders
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All ({getOrderCount('all')})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Pending ({getOrderCount('pending')})
          </button>
          <button
            onClick={() => setActiveTab('processing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'processing'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Processing ({getOrderCount('processing')})
          </button>
          <button
            onClick={() => setActiveTab('shipped')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'shipped'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Shipped ({getOrderCount('shipped')})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'delivered'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Delivered ({getOrderCount('delivered')})
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {order._id.slice(-6).toUpperCase()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{order.user?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{order.orderItems?.length || 0}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">₹{order.totalPrice?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <select 
                         value={order.orderStatus} 
                         onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                         className="text-xs border rounded p-1 max-w-[100px]"
                       >
                         <option value="Pending">Pending</option>
                         <option value="Processing">Processing</option>
                         <option value="Shipped">Shipped</option>
                         <option value="Delivered">Delivered</option>
                       </select>
                      <Link to={`/invoice/${order._id}`} target="_blank" className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors block" title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Link>
                      <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors block" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Order Details <span className="text-sm font-normal text-gray-500 ml-2">#{selectedOrder._id.slice(-6).toUpperCase()}</span>
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
                  <p className="text-sm text-gray-600">Name: <span className="font-medium text-gray-900">{selectedOrder.user?.name || 'Guest'}</span></p>
                  <p className="text-sm text-gray-600">Email: <span className="font-medium text-gray-900">{selectedOrder.user?.email || 'N/A'}</span></p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600 font-medium">{selectedOrder.shippingInfo?.address}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.state}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingInfo?.postalCode}, {selectedOrder.shippingInfo?.country}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOrder.paymentMethod || 'Razorpay'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      selectedOrder.paymentInfo?.status === 'successful' ? 'bg-green-100 text-green-800' : 
                      selectedOrder.paymentInfo?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.paymentInfo?.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  {selectedOrder.paymentInfo?.id && (
                    <div className="col-span-2">
                       <p className="text-xs text-gray-500">Transaction ID</p>
                       <p className="text-sm font-mono text-gray-900">{selectedOrder.paymentInfo.id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 font-medium text-gray-600">Product</th>
                        <th className="px-4 py-2 font-medium text-gray-600">Qty</th>
                        <th className="px-4 py-2 font-medium text-gray-600 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.orderItems?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-gray-900 text-right">₹{item.price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <th colSpan="2" className="px-4 py-3 text-right font-medium text-gray-700">Total Amounts</th>
                        <th className="px-4 py-3 text-right text-lg font-bold text-orange-600">₹{selectedOrder.totalPrice?.toLocaleString()}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
