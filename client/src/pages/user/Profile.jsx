import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function Profile() {
  const { user, login } = useAuth(); // login might overwrite user state if we pass token again, or we can just update local component state
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        password: ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-slate-800">My Profile</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-orange-500 rounded-full text-white flex items-center justify-center text-4xl font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{user?.name}</h3>
            <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
              Role: {user?.role || 'user'}
            </span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep same"
                className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
             <button type="submit" disabled={loading} className="bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors disabled:opacity-70">
               {loading ? "Updating..." : "Update Profile"}
             </button>
             <p className="text-xs text-gray-400">Updating profile will refresh the page to sync your new data.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
