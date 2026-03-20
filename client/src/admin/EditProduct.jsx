import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    stock: '',
    price: '',
    salePrice: '',
    imageUrl: '',
    shortDescription: '',
    fullDescription: '',
    material: '',
    finish: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`);
            const data = await res.json();
            if (data.success) {
                const p = data.product;
                setFormData({
                    name: p.name || '',
                    sku: p._id || '', // or actual SKU if in schema
                    category: p.category || '',
                    stock: p.stock || 0,
                    price: p.price || 0,
                    salePrice: p.oldPrice || '',
                    imageUrl: p.image || (p.images && p.images[0]?.url) || '',
                    shortDescription: p.description || '',
                    fullDescription: p.description || '',
                    material: p.material || '',
                    finish: p.finish || ''
                });
            } else {
                toast.error("Product not found");
                navigate('/admin/products');
            }
        } catch (error) {
            toast.error("Failed to load product");
        } finally {
            setLoading(false);
        }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: formData.name,
                category: formData.category,
                stock: Number(formData.stock),
                price: Number(formData.price),
                description: formData.fullDescription,
                material: formData.material,
                finish: formData.finish,
                image: formData.imageUrl
            })
        });
        const data = await res.json();
        
        if (data.success) {
            toast.success('Product updated successfully!');
            navigate('/admin/products');
        } else {
            toast.error(data.message || 'Failed to update product');
        }
    } catch (err) {
        toast.error("Server error");
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading product...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* SKU */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="Door Handles">Door Handles</option>
                <option value="Locks">Locks</option>
                <option value="Hinges">Hinges</option>
                <option value="Tower Bolts">Tower Bolts</option>
              </select>
            </div>

            {/* Stock */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Price */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Sale Price */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price (₹) (Optional)
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Image URL */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Select
                </button>
              </div>
            </div>

            {/* Short Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Full Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Material */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Finish */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finish
              </label>
              <input
                type="text"
                name="finish"
                value={formData.finish}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
