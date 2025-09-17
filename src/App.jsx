import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { registerServiceWorker, usePWA } from './hooks/usePWA'
import OfflineIndicator from './components/OfflineIndicator'
import { PageLoading } from './components/LoadingComponents'
import { addResourceHints } from './utils/performanceOptimizations'

// Lazy load pages for code splitting
const Homepage = lazy(() => import('./pages/Homepage'))
const MarkingPage = lazy(() => import('./pages/MarkingPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ConfigPage = lazy(() => import('./pages/ConfigPage'))

function App() {
  const { isOnline } = usePWA();

  // Register service worker and apply performance optimizations on app startup
  useEffect(() => {
    registerServiceWorker();
    addResourceHints(); // Add performance-enhancing resource hints
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
          {/* Offline Indicator */}
          <OfflineIndicator isOnline={isOnline} />
          
          <Suspense fallback={<PageLoading message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/marking/:juryId" element={<MarkingPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/config" element={<ConfigPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
