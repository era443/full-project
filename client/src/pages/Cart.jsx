import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <div key={item.product || index} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 items-center">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
              
              <div className="flex-1">
                <Link to={`/product/${item.product}`}>
                  <h3 className="font-semibold text-slate-800 hover:text-orange-500">{item.name}</h3>
                </Link>
                <div className="text-orange-600 font-bold mt-1">₹{item.price}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md overflow-hidden">
                  <button onClick={() => updateQuantity(item.product, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100 transition-colors">-</button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100 transition-colors">+</button>
                </div>
                <button onClick={() => removeFromCart(item.product)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors" aria-label="Remove item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({getCartCount()} items)</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Estimate</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Estimate</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t my-4 pt-4">
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span className="text-orange-600">₹{getCartTotal()}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors font-semibold shadow-sm"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
