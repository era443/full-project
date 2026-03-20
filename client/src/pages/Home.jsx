import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch all products and simply sort them on client for simplicity, 
        // to save touching backend route signatures for now.
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        if (data.success && data.products) {
          // Sort by highest ratings or numOfReviews if they exist, otherwise fallback to standard length
          const sorted = [...data.products].sort((a, b) => {
             const aScore = (a.ratings || 0) * (a.numOfReviews || 1);
             const bScore = (b.ratings || 0) * (b.numOfReviews || 1);
             return bScore - aScore;
          });
          setFeatured(sorted.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const goProducts = () => navigate("/products");
  const goContact = () => navigate("/contact");

  return (
    <div className="bg-gray-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Premium Hardware Parts</h1>
            <p className="mt-2 text-gray-600">Manufacturing high-quality door handles, locks, hinges, and hardware accessories since 2010</p>
            <div className="mt-6 flex gap-3">
              <button onClick={goProducts} className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">Shop Now</button>
              <button onClick={goContact} className="border border-gray-200 px-4 py-2 rounded-md">Contact Us</button>
            </div>
          </div>

          <div className="hidden md:block">
            <img src="https://placehold.co/600x360?text=Hardware+Factory" alt="Hero" className="w-full rounded-md object-cover" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Featured Products (Most Popular)</h2>
          <button onClick={goProducts} className="text-sm text-orange-500 hover:text-orange-600 transition-colors">View All {'>'}</button>
        </div>

        {loading ? (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.length > 0 ? (
                  featured.map(product => (
                      <ProductCard key={product._id} product={product} />
                  ))
              ) : (
                  <p className="text-gray-500 text-center col-span-4">No featured products found.</p>
              )}
            </div>
        )}
      </section>
    </div>
  );
}

export default Home;
