import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import ProductCard from "../components/ProductCard";
import CartContext from "../context/CartContext";
import WishlistContext from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { ShoppingCart, Heart, Truck, ShieldCheck, ChevronRight, Star, Minus, Plus, Check } from "lucide-react";

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { user } = useAuth();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("description");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductData = async () => {
        setLoading(true);
        try {
            let currentProd = null;
            if (!location.state?.product || location.state?.product._id !== id) {
                const res = await fetch(`http://localhost:5000/api/products/${id}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.product);
                    setSelectedImage(data.product.images?.[0]?.url || data.product.image);
                    currentProd = data.product;
                } else {
                    toast.error("Failed to load product");
                }
            } else {
                currentProd = location.state.product;
                setProduct(currentProd);
                setSelectedImage(location.state.product.images?.[0]?.url || location.state.product.image);
            }

            if (currentProd) {
                const resAll = await fetch("http://localhost:5000/api/products");
                const dataAll = await resAll.json();
                if (dataAll.success) {
                    let related = dataAll.products
                        .filter(p => p.category === currentProd.category && p._id !== currentProd._id);
                    if (related.length === 0) {
                        related = dataAll.products.filter(p => p._id !== currentProd._id);
                    }
                    setRelatedProducts(related.slice(0, 4));
                }
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
        } finally {
            setLoading(false);
            setQty(1);
            setTab("description");
        }
    };
    
    fetchProductData();
  }, [id, location.state]);

  function dec() {
    setQty((q) => Math.max(1, q - 1));
  }

  function inc() {
    setQty((q) => q + 1);
  }

  const handleAddToCart = () => {
    if (product) {
       addToCart(product, qty);
       toast.success(`${qty}x ${product.name} added to cart`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
       addToCart(product, qty);
       navigate('/checkout'); // directly to checkout
    }
  };

  const isWishlisted = wishlist.some((w) => {
      const matchId = product?._id || product?.id;
      return String(w._id || w.id) === String(matchId);
  });

  const toggleWishlist = () => {
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product._id || product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to write a review");
    
    setSubmittingReview(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/products/${product._id}/review`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
        });
        const data = await res.json();
        if (data.success) {
            toast.success("Review submitted!");
            setProduct(data.product);
            setReviewComment("");
        } else {
            toast.error(data.message || "Failed to submit review");
        }
    } catch(err) {
        toast.error("Error submitting review");
    } finally {
        setSubmittingReview(false);
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
       </div>
     );
  }
  
  if (!product) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
         <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product not found.</h2>
         <Link to="/products" className="text-orange-500 hover:text-orange-600 underline">Continue Shopping</Link>
       </div>
     );
  }

  const discountVal = product.oldPrice > product.price 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-16 font-sans">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm text-gray-400">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/products" className="hover:text-orange-500 transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-md">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Main Product Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left: Image Gallery */}
            <div className="w-full lg:w-1/2 p-6 lg:border-r border-gray-100">
              <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 md:w-24 shrink-0">
                    {product.images.map((img, idx) => {
                      const imgUrl = img.url || img;
                      const isSelected = selectedImage === imgUrl;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(imgUrl)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all duration-200 shrink-0 w-20 md:w-full ${
                            isSelected ? "border-orange-500 ring-2 ring-orange-100" : "border-gray-100 hover:border-gray-300 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`view-${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Main View */}
                <div className="flex-1 rounded-2xl bg-gray-50 flex items-center justify-center p-4 min-h-[400px] lg:min-h-[500px] relative group overflow-hidden">
                  {discountVal > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm shadow-red-500/20">
                      {discountVal}% OFF
                    </div>
                  )}
                  <button 
                    onClick={toggleWishlist}
                    className={`absolute top-4 right-4 p-3 rounded-full z-10 transition-all shadow-sm ${
                      isWishlisted 
                        ? 'bg-red-50 text-red-500 border border-red-100' 
                        : 'bg-white text-gray-400 border border-gray-100 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                  <img
                    src={selectedImage || "https://placehold.co/600x600?text=No+Image"}
                    alt={product.name}
                    className="w-full h-full object-contain max-h-[500px] transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold tracking-wider text-orange-600 uppercase bg-orange-50 px-2.5 py-1 rounded">
                  {product.category || "Hardware"}
                </span>
                <span className={`text-sm font-medium px-2.5 py-1 rounded flex items-center gap-1 ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                   {product.stock > 0 ? <><Check className="w-3.5 h-3.5" /> In Stock</> : "Out of Stock"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-amber-400">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5" fill={star <= Math.round(product.ratings || 0) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{product.ratings ? product.ratings.toFixed(1) : "0.0"} Rating</span>
                <span className="text-gray-300">•</span>
                <button onClick={() => setTab("reviews")} className="text-sm text-gray-500 hover:text-orange-500 hover:underline transition-colors">
                  {product.numOfReviews || 0} Reviews
                </button>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-extrabold text-gray-900">₹{product.price}</span>
                  {product.oldPrice > product.price && (
                    <span className="text-xl text-gray-400 line-through mb-1">₹{product.oldPrice}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Short Description */}
              <div className="prose prose-sm text-gray-600 mb-8 border-b border-gray-100 pb-8">
                <p className="line-clamp-3">{product.description}</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-4">Quantity</span>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full w-32 shadow-inner">
                    <button 
                      onClick={dec} 
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors"
                      disabled={qty <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      readOnly
                      className="flex-1 bg-transparent text-center font-medium text-gray-900 focus:outline-none appearance-none"
                    />
                    <button 
                      onClick={inc} 
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors"
                      disabled={qty >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    Only {product.stock} left in stock!
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                {product.stock > 0 ? (
                  <>
                    <button 
                      onClick={handleAddToCart} 
                      className="flex-1 bg-white border-2 border-orange-500 text-orange-600 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-all duration-200"
                    >
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </button>
                    <button 
                      onClick={handleBuyNow} 
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Buy Now
                    </button>
                  </>
                ) : (
                  <button 
                    disabled 
                    className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 px-6 rounded-xl cursor-not-allowed border border-gray-200"
                  >
                    Currently Unavailable
                  </button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span>Secure Checkout</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar border-b border-gray-100 px-6 pt-4">
            {['description', 'specs', 'reviews'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors duration-200 ${
                  tab === t 
                    ? "border-orange-500 text-orange-600" 
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {t === 'reviews' ? `Reviews (${product.numOfReviews || 0})` : t}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Description Tab */}
            {tab === "description" && (
              <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed">
                {product.description.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
            )}

            {/* Specs Tab */}
            {tab === "specs" && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Technical Specifications</h3>
                <dl className="grid grid-flow-row text-sm">
                  {[
                    { label: "Category", value: product.category },
                    { label: "Material", value: product.material },
                    { label: "Finish", value: product.finish }
                  ].map((spec, i) => spec.value && (
                    <div key={i} className="grid grid-cols-3 py-4 border-b border-gray-100 last:border-0 items-center">
                      <dt className="text-gray-500 font-medium">{spec.label}</dt>
                      <dd className="col-span-2 text-gray-900 font-semibold">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Reviews Tab */}
            {tab === "reviews" && (
              <div className="max-w-3xl">
                <div className="flex items-end justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-orange-500">{product.ratings ? product.ratings.toFixed(1) : "0.0"}</span>
                    <div className="flex flex-col text-sm text-gray-500 font-medium">
                      <span>out of 5</span>
                      <span>Based on {product.numOfReviews || 0} reviews</span>
                    </div>
                  </div>
                </div>

                {(!product.reviews || product.reviews.length === 0) ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100 border-dashed">
                    <p className="text-gray-500 mb-4 font-medium">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-6 mb-10">
                    {product.reviews.map(r => (
                      <div key={r._id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <span className="font-bold text-gray-900 block">{r.name}</span>
                               {r.purchased && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1 mt-0.5"><Check className="w-3 h-3"/> Verified Purchase</span>}
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                             {[1,2,3,4,5].map((star) => (
                                <Star key={star} className="w-4 h-4" fill={star <= r.rating ? "currentColor" : "none"} />
                             ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-3 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Form */}
                {user ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                    <h4 className="font-bold text-xl mb-6 text-gray-900">Write a Review</h4>
                    <form onSubmit={handleReviewSubmit}>
                       <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                          <div className="flex gap-2">
                             {[1,2,3,4,5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className={`p-2 rounded-lg transition-colors ${reviewRating >= star ? 'text-amber-400 bg-amber-50' : 'text-gray-300 hover:text-amber-300'}`}
                                >
                                  <Star className="w-8 h-8" fill={reviewRating >= star ? "currentColor" : "none"} />
                                </button>
                             ))}
                          </div>
                       </div>
                       <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Review Summary</label>
                          <textarea 
                            value={reviewComment} 
                            onChange={e => setReviewComment(e.target.value)} 
                            required 
                            rows={4} 
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none" 
                            placeholder="What did you like or dislike?"
                          />
                       </div>
                       <button 
                         disabled={submittingReview} 
                         type="submit" 
                         className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-colors"
                       >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                       </button>
                    </form>
                  </div>
                ) : (
                  <div className="mt-8 bg-orange-50 text-orange-800 p-6 rounded-xl border border-orange-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">Leave a Review</h4>
                      <p className="text-sm opacity-80">You must be logged in to share your thoughts.</p>
                    </div>
                    <button onClick={() => navigate('/login')} className="bg-white text-orange-600 font-bold px-6 py-2 rounded shadow-sm hover:bg-orange-50 transition-colors">
                      Log In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                 <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
                 <p className="text-gray-500 text-sm mt-1">Discover similar products from this category</p>
              </div>
              <Link to="/products" className="group flex items-center gap-1 text-orange-600 font-semibold hover:text-orange-700 transition-colors">
                 View All 
                 <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((r) => (
                <div key={r._id || r.id} className="transition-transform duration-300 hover:-translate-y-1">
                  <ProductCard product={r} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProductDetail;
