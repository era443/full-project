import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error(data.message || 'Error deleting product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
        </div>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <Link to="/admin/products/add">
            <button className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={product.image || product.images?.[0]?.url || "https://placehold.co/100x100?text=No+Img"} alt="" className="w-12 h-12 object-cover rounded bg-orange-50 border" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-bold ${product.stock <= 5 ? "text-red-500 bg-red-50 px-2 py-1 flex items-center gap-1 rounded inline-flex" : "text-gray-900"}`}>
                        {product.stock} {product.stock <= 5 && <span className="text-[10px] uppercase font-bold tracking-wider ml-1">(Low)</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/edit/${product._id}`}>
                        <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="h-4 w-4" />
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
            className="inline-block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
