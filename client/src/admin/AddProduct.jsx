import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    stock: '',
    price: '',
    shortDescription: '',
    fullDescription: '',
    material: '',
    finish: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
        let finalImageUrl = '';

        if (imageFile) {
            const uploadData = new FormData();
            uploadData.append('image', imageFile);

            const uploadRes = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });
            const uploadResult = await uploadRes.json();
            
            if (uploadResult.success) {
                finalImageUrl = uploadResult.imageUrl;
            } else {
                toast.error(uploadResult.message || 'Image upload failed');
                return;
            }
        } else {
            toast.error('Please upload an image');
            return;
        }

        const res = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: formData.name,
                price: Number(formData.price),
                description: formData.fullDescription,
                category: formData.category,
                stock: Number(formData.stock),
                material: formData.material,
                finish: formData.finish,
                seller: 'Shree Om Hardware',
                images: [{ public_id: 'img_dummy', url: finalImageUrl }]
            })
        });
        const data = await res.json();
        
        if (data.success) {
            toast.success('Product created successfully!');
            navigate('/admin/products');
        } else {
            toast.error(data.message || 'Error creating product');
        }
    } catch (err) {
        console.error(err);
        toast.error('Failed to connect to server');
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <div className="text-sm text-gray-500">
            <Link to="/admin/products" className="hover:text-gray-700">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-orange-500">Add New</span>
          </div>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
                required
              >
                <option value="">Select Category</option>
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



            {/* Product Image */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                      const file = e.target.files[0];
                      if(file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                      }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-lg border border-gray-200" />
                )}
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
              <select
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
                required
              >
                <option value="">Select Material</option>
                <option value="Stainless Steel">Stainless Steel</option>
                <option value="Brass">Brass</option>
                <option value="Zinc Alloy">Zinc Alloy</option>
                <option value="Aluminum Alloy">Aluminum Alloy</option>
              </select>
            </div>

            {/* Finish */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finish
              </label>
              <select
                name="finish"
                value={formData.finish}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
                required
              >
                <option value="">Select Finish</option>
                <option value="Chrome">Chrome</option>
                <option value="Matt Black">Matt Black</option>
                <option value="Gold">Gold</option>
                <option value="Nickel">Nickel</option>
                <option value="Antique">Antique</option>
              </select>
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
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
