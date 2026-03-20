import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
// We don't strictly need to "import" Razorpay if loaded from script, but we'll use window.Razorpay

function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    postalCode: "",
    phoneNo: "",
    country: "India"
  });
  
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to proceed with checkout");
      navigate("/login", { state: { from: "/checkout" } });
    } else if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [user, cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({ ...shippingInfo, [name]: value });
  };

  // Helper to load Razorpay script
  const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderItems, totalPrice) => {
    try {
        const token = localStorage.getItem("token");
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            setLoading(false);
            return;
        }

        // 1. Create order on backend
        const result = await fetch("http://localhost:5000/api/payment/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ amount: totalPrice })
        });
        
        const data = await result.json();

        if (!data.success) {
            toast.error("Server error. Are you online?");
            setLoading(false);
            return;
        }

        const { amount, id: order_id, currency } = data.order;

        // Fetch Razorpay public Key ID from backend
        const keyRes = await fetch("http://localhost:5000/api/payment/key");
        const keyData = await keyRes.json();

        // 2. Initialize Razorpay Modal
        const options = {
            key: keyData.key, // Used dynamic key from server
            amount: amount.toString(),
            currency: currency,
            name: "Shree Om Hardware",
            description: "Checkout Transaction",
            image: "https://placehold.co/100x100?text=SO", // optionally our logo
            order_id: order_id,
            handler: async function (response) {
                try {
                    // 3. Verify Payment
                    const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            orderCreationId: order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                        }),
                    });

                    const verifyStatus = await verifyRes.json();
                    
                    if (verifyStatus.success) {
                        // 4. Save actual order in our DB as "Paid"
                        saveOrderToDB(orderItems, totalPrice, {
                            id: response.razorpay_payment_id,
                            status: "Paid"
                        });
                    } else {
                        toast.error("Payment verification failed!");
                        setLoading(false);
                    }
                } catch (error) {
                    toast.error("Error verifying payment");
                    setLoading(false);
                }
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: shippingInfo.phoneNo,
            },
            theme: {
                color: "#f97316", // orange-500
            },
            modal: {
                ondismiss: function() {
                  setLoading(false);
                  toast.info("Payment cancelled.");
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

    } catch (err) {
        toast.error(err.message);
        setLoading(false);
    }
  };

  const saveOrderToDB = async (orderItems, totalPrice, paymentInfo) => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              orderItems,
              shippingInfo,
              itemsPrice: totalPrice,
              taxPrice: 0,
              shippingPrice: 0,
              totalPrice: Math.round(totalPrice),
              paymentInfo
            })
        });

        const data = await res.json();

        if (data.success) {
            toast.success("Order placed successfully!");
            clearCart();
            navigate("/dashboard/orders");
        } else {
            toast.error(data.message || "Failed to place order");
            setLoading(false);
        }
      } catch (error) {
          console.error("Order error:", error);
          toast.error("Server error. Please try again.");
          setLoading(false);
      }
  };


  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderItems = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item.product
    }));
      
    const totalPrice = getCartTotal();

    if (paymentMethod === "Razorpay") {
        await handleRazorpayPayment(orderItems, Math.round(totalPrice));
    } else {
        await saveOrderToDB(orderItems, Math.round(totalPrice), { id: "cash_on_delivery", status: "Pending" });
    }
  };

  if (!user || cartItems.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={placeOrder} className="space-y-6 bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Shipping Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phoneNo"
              required
              value={shippingInfo.phoneNo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="+91 "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              required
              rows="3"
              value={shippingInfo.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="123 Street Name, Apartment, etc."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                required
                value={shippingInfo.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                required
                value={shippingInfo.postalCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mt-8 mb-4 border-b pb-2">Payment Method</h2>
          <div className="space-y-3">
             <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'Razorpay' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Razorpay" 
                  checked={paymentMethod === "Razorpay"} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="accent-orange-500 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Razorpay (Cards / UPI / NetBanking)</span>
                    <svg width="60" height="16" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="24" rx="4" fill="#02042B"/>
                      <path d="M28.3 7h-6v10h2v-4.3h3l2.8 4.3h2.3l-3.2-4.6c1.3-.4 2.2-1.7 2.2-3.1 0-1.8-1.3-2.3-3.1-2.3zm-4 4V8.5h3.9c.7 0 1.2.3 1.2 1.2 0 .9-.5 1.3-1.2 1.3h-3.9z" fill="#fff"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Secure online payment via Razorpay.</span>
                </div>
             </label>

             <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="COD" 
                  checked={paymentMethod === "COD"} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="accent-orange-500 w-4 h-4"
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-800">Cash on Delivery</span><br/>
                  <span className="text-xs text-gray-500">Pay when you receive the items.</span>
                </div>
             </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 text-white font-semibold flex justify-center items-center py-3 rounded-md hover:bg-orange-600 transition-colors disabled:bg-opacity-70 mt-6"
          >
            {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
                paymentMethod === "Razorpay" ? `Pay ₹${getCartTotal()} Securely` : "Place Order via COD"
            )}
          </button>
        </form>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 h-fit sticky top-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.product} className="flex gap-4 items-center bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-white" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-semibold text-orange-600">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
              <span className="font-medium">₹{getCartTotal()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Handling Fee</span>
              <span className="font-medium">₹0</span>
            </div>
            <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-200">
              <span className="text-slate-800">Total</span>
              <span className="text-orange-600">₹{getCartTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
