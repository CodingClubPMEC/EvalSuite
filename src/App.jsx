import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import MarkingPage from './pages/MarkingPage'
import AdminPage from './pages/AdminPage'
import ConfigPage from './pages/ConfigPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/marking/:juryId" element={<MarkingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
