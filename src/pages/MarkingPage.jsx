import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MarksheetTable from '../components/MarksheetTable';
import { juryProfiles } from '../data/juryData';
import { exportToExcel } from '../utils/excelExport';

function MarkingPage() {
  const { juryId } = useParams();
  const [scores, setScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Find jury information
  const jury = juryProfiles.find(j => j.id === parseInt(juryId));

  if (!jury) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Jury Not Found</h2>
            <Link 
              to="/" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleScoreChange = (newScores) => {
    setScores(newScores);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Export to Excel
      exportToExcel(scores, juryId);
      
      // Show success message
      alert('Marksheet saved successfully! The Excel file has been downloaded.');
    } catch (error) {
      console.error('Error saving marksheet:', error);
      alert('Error saving marksheet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Jury Information Section */}
      <div className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-6">
            <img 
              src={jury.image} 
              alt={jury.name} 
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{jury.name}</h1>
              <p className="text-lg text-gray-600">{jury.designation}</p>
              <p className="text-sm text-blue-600">{jury.department}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to Homepage
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Marksheet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Marksheet Section */}
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Team Evaluation</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <MarksheetTable onScoreChange={handleScoreChange} />
          </div>
          
          {/* Instructions */}
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Enter marks for each team according to the evaluation criteria</li>
              <li>• Maximum marks for each criteria are shown in brackets</li>
              <li>• Total scores are calculated automatically</li>
              <li>• Click "Save Marksheet" to export the data to an Excel file</li>
              <li>• You can modify scores anytime before saving</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default MarkingPage;