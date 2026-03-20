import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          toast.error("Invoice not found");
          navigate('/dashboard/orders');
        }
      } catch (err) {
        toast.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  useEffect(() => {
    if (!loading && order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, order]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
  if (!order) return null;

  return (
    <div className="bg-white min-h-screen text-slate-800 p-8 font-sans max-w-4xl mx-auto print:p-0">
       <style>{`
         @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            @page { margin: 1cm; }
         }
       `}</style>
      <div className="print-area border rounded-lg p-8 print:border-none print:p-0">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
           <div>
             <h1 className="text-3xl font-bold text-orange-600">Shree Om</h1>
             <p className="text-sm text-gray-500 mt-1">Hardware Manufacturing & Distribution</p>
             <p className="text-sm text-gray-500">123 Industrial Area, Phase 1</p>
             <p className="text-sm text-gray-500">contact@shreeom.com</p>
           </div>
           <div className="text-right">
             <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">Invoice</h2>
             <p className="text-sm font-medium mt-1">Order #: {order._id.slice(-6).toUpperCase()}</p>
             <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
             <p className="text-sm mt-2">
                 <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${order.paymentInfo?.status === 'successful' || order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                     {(order.paymentInfo?.id === 'cash_on_delivery' || order.paymentInfo?.id === 'COD') && order.orderStatus !== 'Delivered' ? 'UNPAID (COD)' : 'PAID'}
                 </span>
             </p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
           <div>
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To / Shipping Address</h3>
             <p className="font-semibold">{order.user?.name || 'Customer'}</p>
             <p className="text-sm text-gray-600 mt-1">{order.shippingInfo?.address}</p>
             <p className="text-sm text-gray-600">{order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.postalCode}</p>
             <p className="text-sm text-gray-600">{order.shippingInfo?.country}</p>
           </div>
           <div className="text-right">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Info</h3>
             <p className="text-sm">{(order.paymentInfo?.id === 'cash_on_delivery' || order.paymentInfo?.id === 'COD') ? 'Cash on Delivery' : 'Razorpay'}</p>
             {order.paymentInfo?.id && order.paymentInfo?.id !== 'cash_on_delivery' && order.paymentInfo?.id !== 'COD' && (
                <p className="text-xs text-gray-500 font-mono mt-1">Txn: {order.paymentInfo.id}</p>
             )}
           </div>
        </div>

        <table className="w-full text-left border-collapse mb-8">
           <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                 <th className="py-3 px-4 font-semibold text-gray-700">Item</th>
                 <th className="py-3 px-4 font-semibold text-gray-700 text-center">Qty</th>
                 <th className="py-3 px-4 font-semibold text-gray-700 text-right">Price</th>
                 <th className="py-3 px-4 font-semibold text-gray-700 text-right">Total</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
              {order.orderItems.map((item, idx) => (
                 <tr key={idx}>
                    <td className="py-4 px-4">
                       <p className="font-medium text-gray-800">{item.name}</p>
                    </td>
                    <td className="py-4 px-4 text-center">{item.quantity}</td>
                    <td className="py-4 px-4 text-right">₹{item.price.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-medium">₹{(item.price * item.quantity).toLocaleString()}</td>
                 </tr>
              ))}
           </tbody>
        </table>

        <div className="flex justify-end border-t pt-6">
           <div className="w-64">
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                 <span>Subtotal</span>
                 <span>₹{(order.totalPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                 <span>Shipping</span>
                 <span>₹0</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                 <span className="font-bold text-gray-800">Total</span>
                 <span className="font-bold text-orange-600 text-xl">₹{order.totalPrice.toLocaleString()}</span>
              </div>
           </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-400 border-t pt-8">
           Thank you for shopping with Shree Om Hardware! 
           <button onClick={() => window.close()} className="block mx-auto mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded print:hidden hover:bg-gray-200">Close Window</button>
        </div>
      </div>
    </div>
  );
}
