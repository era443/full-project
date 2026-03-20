import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  User as UserIcon, 
  KeyRound, 
  LogOut 
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null; // Or redirect

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Orders", path: "/dashboard/orders", icon: Package },
    { name: "Wishlist", path: "/dashboard/wishlist", icon: Heart },
    { name: "Profile", path: "/dashboard/profile", icon: UserIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">My Dashboard</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 text-center">
            <div className="w-20 h-20 bg-orange-500 rounded-full text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h3 className="font-bold text-slate-800">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex flex-col p-2 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? "bg-orange-500 text-white" 
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
              
              <button 
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-red-500 hover:bg-red-50 transition-colors w-full text-left mt-2 border-t border-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
