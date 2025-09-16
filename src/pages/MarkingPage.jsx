import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MarksheetTable from '../components/MarksheetTable';
import { juryProfiles } from '../data/juryData';
import { saveJuryEvaluation, getJuryEvaluation } from '../utils/dataStorage';

function MarkingPage() {
  const { juryId } = useParams();
  const [scores, setScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Find jury information
  const jury = juryProfiles.find(j => j.id === parseInt(juryId));

  // Load existing evaluation data
  useEffect(() => {
    if (jury) {
      const existingEvaluation = getJuryEvaluation(parseInt(juryId));
      if (existingEvaluation) {
        setScores(existingEvaluation.scores);
        setLastSaved(existingEvaluation.submittedAt);
      }
    }
  }, [juryId, jury]);

  if (!jury) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
          <div className="text-center bg-white rounded-xl shadow-2xl p-12 border border-gray-200 max-w-md mx-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-2xl font-bold">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-wide">JURY NOT FOUND</h2>
            <p className="text-slate-600 mb-6 text-sm">
              The requested jury profile could not be located. Please return to the panel selection.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 font-bold tracking-wide text-sm hover:from-orange-500 hover:to-orange-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              ← RETURN TO PANEL
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
      // Save evaluation to localStorage
      await saveJuryEvaluation(parseInt(juryId), scores);
      const currentTime = new Date().toISOString();
      setLastSaved(currentTime);
      
      // Show success message
      alert('Evaluation saved successfully! You can modify and save again anytime.');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Error saving evaluation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save functionality
  const handleAutoSave = async () => {
    try {
      await saveJuryEvaluation(parseInt(juryId), scores);
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Auto-save when scores change (debounced)
  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      const timeoutId = setTimeout(handleAutoSave, 2000); // Auto-save after 2 seconds of inactivity
      return () => clearTimeout(timeoutId);
    }
  }, [scores]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Jury Information Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Jury Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">{jury.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-wide mb-1">{jury.name}</h1>
                  <p className="text-sm text-gray-300 font-medium">{jury.designation}</p>
                  <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">{jury.department}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="text-orange-400 hover:text-white flex items-center font-medium tracking-wide text-sm transition-colors duration-200 px-4 py-2 rounded-lg border border-orange-400/30 hover:border-white/30"
                >
                  ← BACK TO PANEL
                </Link>
                
                {/* Save Status Indicator */}
                {lastSaved && (
                  <div className="text-xs text-gray-300 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-1">
                      <span>✓</span>
                      <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-orange-400 font-medium">
                      Auto-save enabled
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 font-bold tracking-wide text-sm disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center space-x-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>SAVE EVALUATION</span>
                </>
              )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marksheet Section */}
      <div className="flex-1 py-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-wide">
              ⚡ EVALUATION MATRIX
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-4"></div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Comprehensive team assessment across all evaluation criteria. Enter scores carefully and review before export.
            </p>
          </div>
          
          {/* Evaluation Table */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            <MarksheetTable onScoreChange={handleScoreChange} />
          </div>
          
          {/* Guidelines Card */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-orange-50 to-slate-50 rounded-xl p-6 border border-orange-200 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">📋</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-3 text-lg tracking-wide">EVALUATION GUIDELINES</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-slate-700 text-sm">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>Score each team according to defined criteria</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>Maximum marks shown in brackets - enforce limits</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>Totals calculated automatically</span>
                      </li>
                    </ul>
                    <ul className="space-y-2 text-slate-700 text-sm">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>Export results when evaluation complete</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>Scores can be modified until export</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>Review all entries before final submission</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default MarkingPage;