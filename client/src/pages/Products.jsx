import ProductCard from "../components/ProductCard";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

function Products() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [price, setPrice] = useState(5000);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedFinishes, setSelectedFinishes] = useState([]);
  const [minRating, setMinRating] = useState(0);
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        } else {
          toast.error("Failed to load products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
     setSearchQuery(new URLSearchParams(location.search).get("search") || "");
  }, [location.search]);

  // Category Toggle Handler
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleMaterialToggle = (material) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };
  
  const handleFinishToggle = (finish) => {
    setSelectedFinishes(prev => 
      prev.includes(finish) 
        ? prev.filter(f => f !== finish)
        : [...prev, finish]
    );
  };

  // Combined Filters
  useEffect(() => {
    let filtered = products.filter(p => p.price <= price);
    
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(p => selectedMaterials.includes(p.material));
    }
    if (selectedFinishes.length > 0) {
      filtered = filtered.filter(p => selectedFinishes.includes(p.finish));
    }
    if (minRating > 0) {
      filtered = filtered.filter(p => p.ratings >= minRating);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [price, selectedCategories, selectedMaterials, selectedFinishes, minRating, products, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
      (currentPage - 1) * productsPerPage, 
      currentPage * productsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 bg-white p-4 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500"><circle cx="12" cy="12" r="10" stroke="#F6873E" strokeWidth="1.5"/></svg>Filters</h3>

          <div className="mb-6">
            <h4 className="font-medium flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8H9L12 2Z" fill="#F6873E"/></svg>Categories</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              <li className="flex items-center justify-between">
                 <label className="flex items-center gap-2">
                   <input type="checkbox" checked={selectedCategories.includes('Door Handles')} onChange={() => handleCategoryToggle('Door Handles')} className="accent-orange-500" /> Door Handles
                 </label>
              </li>
              <li className="flex items-center justify-between">
                 <label className="flex items-center gap-2">
                   <input type="checkbox" checked={selectedCategories.includes('Locks')} onChange={() => handleCategoryToggle('Locks')} className="accent-orange-500" /> Locks
                 </label>
              </li>
              <li className="flex items-center justify-between">
                 <label className="flex items-center gap-2">
                   <input type="checkbox" checked={selectedCategories.includes('Hinges')} onChange={() => handleCategoryToggle('Hinges')} className="accent-orange-500" /> Hinges
                 </label>
              </li>
              <li className="flex items-center justify-between">
                 <label className="flex items-center gap-2">
                   <input type="checkbox" checked={selectedCategories.includes('Tower Bolts')} onChange={() => handleCategoryToggle('Tower Bolts')} className="accent-orange-500" /> Tower Bolts
                 </label>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-medium">Price Range</h4>
            <div className="mt-2 text-sm text-gray-600">₹0 <span className="float-right">₹5000</span></div>
            <input type="range" min="0" max="5000" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full mt-3" />
            <div className="mt-2 text-sm text-gray-800 font-semibold">₹{price}</div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="3" fill="#F6873E"/></svg>Material</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedMaterials.includes('Stainless Steel')} onChange={() => handleMaterialToggle('Stainless Steel')} className="accent-orange-500"/> Stainless Steel</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedMaterials.includes('Brass')} onChange={() => handleMaterialToggle('Brass')} className="accent-orange-500"/> Brass</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedMaterials.includes('Zinc Alloy')} onChange={() => handleMaterialToggle('Zinc Alloy')} className="accent-orange-500"/> Zinc Alloy</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedMaterials.includes('Aluminum Alloy')} onChange={() => handleMaterialToggle('Aluminum Alloy')} className="accent-orange-500"/> Aluminum Alloy</label></li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-medium flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L20 8V16L12 22L4 16V8L12 2Z" fill="#F6873E"/></svg>Finish</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedFinishes.includes('Chrome')} onChange={() => handleFinishToggle('Chrome')} className="accent-orange-500"/> Chrome</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedFinishes.includes('Matt Black')} onChange={() => handleFinishToggle('Matt Black')} className="accent-orange-500"/> Matt Black</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedFinishes.includes('Gold')} onChange={() => handleFinishToggle('Gold')} className="accent-orange-500"/> Gold</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedFinishes.includes('Nickel')} onChange={() => handleFinishToggle('Nickel')} className="accent-orange-500"/> Nickel</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" checked={selectedFinishes.includes('Antique')} onChange={() => handleFinishToggle('Antique')} className="accent-orange-500"/> Antique</label></li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-medium flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.3L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.3Z" fill="#F6873E"/></svg>Minimum Rating</h4>
            <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="mt-2 w-full border rounded px-3 py-2 text-sm">
              <option value={0}>All Ratings</option>
              <option value={4}>4.0 & up</option>
              <option value={3}>3.0 & up</option>
              <option value={2}>2.0 & up</option>
            </select>
          </div>

          <button onClick={() => { setSearchQuery(""); setPrice(5000); setSelectedCategories([]); setSelectedMaterials([]); setSelectedFinishes([]); setMinRating(0); }} className="w-full border border-gray-200 hover:bg-gray-50 rounded py-2 text-sm">Clear All Filters</button>
        </aside>

        <main className="lg:col-span-3">
          {searchQuery && (
              <div className="mb-4 text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100 flex justify-between items-center">
                  <p>Showing results for: <span className="font-semibold text-gray-900">"{searchQuery}"</span></p>
                  <button onClick={() => setSearchQuery("")} className="text-orange-500 hover:text-orange-700 text-sm font-medium">Clear Search</button>
              </div>
          )}
          
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
             </div>
          ) : filteredProducts.length === 0 ? (
             <div className="text-center py-10 text-gray-500">No products found matching your filters.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 bg-white py-4 rounded-lg shadow-sm border border-gray-100">
                  <button 
                    onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none px-2 no-scrollbar">
                    {Array.from({ length: totalPages }).map((_, i) => (
                       <button 
                         key={i}
                         onClick={() => {
                            setCurrentPage(i + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                         }}
                         className={`min-w-[32px] h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30 border-orange-500' : 'hover:bg-gray-50 border border-gray-200 text-gray-600'}`}
                       >
                         {i + 1}
                       </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Products;
