import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import TryNow from './Components/Trynow';
import Transformations from './Components/Transformations';
import Pricing from './Components/Pricing';
import Contact from './Components/Contact';
import Home from './Components/Home';
import SignIn from './Components/SignIn';
import SignUp from './Components/SignUp';
import DashboardLayout from './User/DashboardLayout';
import AdminLayout from './Admin/AdminLayout';
import CheckoutPage from './Components/CheckoutPage';

// Separate component so we can use useLocation inside Router
const AppContent = () => {
  const location = useLocation();

  // Hide navbar on dashboard, admin and checkout routes
  const hideNavbar = location.pathname.startsWith('/dashboard') || 
                     location.pathname.startsWith('/admin') ||
                     location.pathname.startsWith('/checkout');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/" element={<Home />} />
        <Route path="/try-now" element={<TryNow />} />
        <Route path="/gallery" element={<Transformations />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;