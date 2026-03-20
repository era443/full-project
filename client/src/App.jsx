import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetEmailSent from "./pages/ResetEmailSent";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./admin/AdminDashboard";
import ProductManagement from "./admin/ProductManagement";
import EditProduct from "./admin/EditProduct";
import UserManagement from "./admin/UserManagement";
import AddProduct from "./admin/AddProduct";
import AddUser from "./admin/AddUser";
import EditUser from "./admin/EditUser";
import OrderManagement from "./admin/OrderManagement";
import AdminRoute from "./components/AdminRoute";

import Dashboard from "./pages/user/Dashboard";
import DashboardHome from "./pages/user/DashboardHome";
import MyOrders from "./pages/user/MyOrders";
import Wishlist from "./pages/user/Wishlist";
import Profile from "./pages/user/Profile";
import Invoice from "./pages/user/Invoice";
import { WishlistProvider } from "./context/WishlistContext";
import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

// Simple Protected Route for Users
const UserRoute = () => {
    const { user } = useAuth();
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <WishlistProvider>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-sent" element={<ResetEmailSent />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User Dashboard Routes */}
        <Route element={<UserRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
          <Route path="/invoice/:id" element={<Invoice />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/add" element={<AddUser />} />
          <Route path="/admin/users/edit/:id" element={<EditUser />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </WishlistProvider>
  );
}

export default App;
