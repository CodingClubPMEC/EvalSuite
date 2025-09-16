import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import MarkingPage from './pages/MarkingPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/marking/:juryId" element={<MarkingPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
