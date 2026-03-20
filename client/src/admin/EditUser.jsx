import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const u = data.user;
                setFormData({
                    fullName: u.name || '',
                    email: u.email || '',
                    phone: u.phone || '',
                    role: u.role === 'admin' ? 'Admin' : 'User',
                    status: u.is_verified ? 'Active' : 'Inactive'
                });
            } else {
                toast.error("User not found");
                navigate('/admin/users');
            }
        } catch (error) {
            toast.error("Failed to load user");
        } finally {
            setLoading(false);
        }
    };
    fetchUser();
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
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: formData.fullName,
                email: formData.email, // Read only generally, but sending it just in case backend expects
                phone: formData.phone,
                role: formData.role.toLowerCase(),
                status: formData.status.toLowerCase()
            })
        });
        const data = await res.json();
        
        if (data.success) {
            toast.success('User updated successfully!');
            navigate('/admin/users');
        } else {
            toast.error(data.message || 'Failed to update user');
        }
    } catch (err) {
        toast.error("Server error");
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading user...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Phone */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Role */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
