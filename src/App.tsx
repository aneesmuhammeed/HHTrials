import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { AuthProvider } from './contexts/AuthContext';
import { SavedToursProvider } from './contexts/SavedToursContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import SavedTours from './pages/SavedTours';
import GoogleCallback from './pages/GoogleCallback';
import Admin from './pages/Admin';
import Developers from './pages/Developers.tsx';
import ServerWakeScreen from './components/ServerWakeScreen';

function App() {
  const hasApi = Boolean(import.meta.env.VITE_API_BASE_URL);
  const showDevelopersPage = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEVELOPERS_PAGE === 'true';
  const [serverReady, setServerReady] = useState(!hasApi);

  const handleServerReady = useCallback(() => {
    setServerReady(true);
  }, []);

  if (!serverReady) {
    return (
      <AuthProvider>
        <SavedToursProvider>
          <ServerWakeScreen onReady={handleServerReady} />
        </SavedToursProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <SavedToursProvider>
        <Router>
          <div className="min-h-screen bg-white flex flex-col" style={{ animation: 'fadeIn 0.6s ease' }}>
            <ScrollToTop />
            <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/google/callback" element={<GoogleCallback />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/saved-tours" element={<SavedTours />} />
            <Route path="/admin" element={<Admin />} />
            <Route
              path="/developers"
              element={showDevelopersPage ? <Developers /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

            <Footer />
          </div>
        </Router>
      </SavedToursProvider>
    </AuthProvider>
  );
}

export default App;
