import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MarksheetTable from '../components/MarksheetTable';
import { LoadingSpinner, PageLoading } from '../components/LoadingComponents';
import { useDebounce } from '../hooks/useDebounce';
import { saveJuryEvaluation, getJuryEvaluation, autoSaveEvaluation } from '../services/apiService';
import { configManager } from '../config/hackathonConfig';

// Lazy load non-critical components
const DataPersistenceStatus = lazy(() => import('../components/DataPersistenceStatus'));

function MarkingPage() {
  const sessionInfo = configManager.getSessionInfo();
  const { juryId } = useParams();
  const [scores, setScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get jury profiles dynamically
  const juryProfiles = configManager.getActiveJuryMembers();
  
  // Find jury information
  const jury = juryProfiles.find(j => j.id === parseInt(juryId));

  // Update document title dynamically
  useEffect(() => {
    const systemName = sessionInfo.systemName || 'EvalSuite';
    if (jury) {
      document.title = `${systemName} - ${jury.name} Evaluation`;
    } else {
      document.title = `${systemName} - Evaluation Page`;
    }
  }, [sessionInfo.systemName, jury]);

  // Auto-save functionality with improved debouncing
  const handleAutoSave = async () => {
    if (!autoSaveEnabled || Object.keys(scores).length === 0) return;
    
    try {
      setIsSaving(true);
      await autoSaveEvaluation(parseInt(juryId), scores);
      const currentTime = new Date().toISOString();
      setLastSaved(currentTime);
      setHasUnsavedChanges(false);
      setError(null); // Clear any previous errors
      console.log('Auto-save successful at:', currentTime);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setError('Auto-save failed. Please save manually.');
    } finally {
      setIsSaving(false);
    }
  };

  // Setup debounced auto-save - MUST be called before any conditional returns
  const { debouncedCallback: debouncedAutoSave, cancel: cancelAutoSave } = useDebounce(
    handleAutoSave,
    2000 // 2 seconds delay for better responsiveness
  );

  // Load existing evaluation data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (jury) {
          const existingEvaluation = await getJuryEvaluation(parseInt(juryId));
          if (existingEvaluation && existingEvaluation.scores) {
            setScores(existingEvaluation.scores);
            setLastSaved(existingEvaluation.submittedAt || existingEvaluation.lastUpdated);
            setHasUnsavedChanges(false);
            console.log('Loaded existing evaluation:', existingEvaluation);
          } else {
            console.log('No existing evaluation found, starting fresh');
          }
        }
      } catch (err) {
        setError('Failed to load evaluation data');
        console.error('Error loading evaluation data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [juryId, jury]);

  // Auto-save when scores change (debounced)
  useEffect(() => {
    if (Object.keys(scores).length > 0 && autoSaveEnabled && hasUnsavedChanges) {
      debouncedAutoSave();
    }
    
    // Cleanup on unmount
    return () => {
      cancelAutoSave();
    };
  }, [scores, autoSaveEnabled, hasUnsavedChanges, debouncedAutoSave, cancelAutoSave]);

  // Save data when page becomes hidden (user switches tabs/minimizes)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && Object.keys(scores).length > 0) {
        // Save immediately when page becomes hidden
        try {
          await saveJuryEvaluation(parseInt(juryId), scores);
        } catch (error) {
          console.error('Failed to save on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [scores, juryId]);

  // Save data before page unload (user closes tab/refreshes)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(scores).length > 0) {
        // Save immediately before unload (best effort - may not complete)
        saveJuryEvaluation(parseInt(juryId), scores).catch(error => {
          console.error('Failed to save before unload:', error);
        });

        // Show confirmation dialog if there are unsaved changes
        if (hasUnsavedChanges) {
          const message = 'You have unsaved evaluation data. Are you sure you want to leave?';
          e.preventDefault();
          e.returnValue = message;
          return message;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [scores, juryId, hasUnsavedChanges]);

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

  if (isLoading) {
    return <PageLoading message="Loading evaluation data..." />;
  }

  const handleScoreChange = (newScores) => {
    setScores(newScores);
    setHasUnsavedChanges(true);
    
    // Immediate background save (non-blocking)
    if (autoSaveEnabled) {
      setTimeout(async () => {
        try {
          await autoSaveEvaluation(parseInt(juryId), newScores);
          console.log('Immediate save successful');
        } catch (error) {
          console.error('Immediate save failed:', error);
        }
      }, 100); // Small delay to avoid blocking UI
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Save evaluation to database
      await saveJuryEvaluation(parseInt(juryId), scores);
      const currentTime = new Date().toISOString();
      setLastSaved(currentTime);
      setHasUnsavedChanges(false);
      
      // Show success message
      alert('Evaluation saved successfully! You can modify and save again anytime.');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      setError('Error saving evaluation. Please try again.');
      alert('Error saving evaluation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Enhanced Jury Information Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-purple-600/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(249,115,22,0.15),transparent_50%)]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-6">
              {/* Enhanced Jury Info */}
              <div className="flex items-center space-x-6 animate-slide-in-right">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl animate-scale-in">
                  <span className="text-white font-black text-2xl">{jury.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{jury.name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-200">{jury.designation}</span>
                    <span className="bg-orange-500/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold text-orange-300">{jury.department}</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex items-center space-x-4 animate-fade-in">
                <Link 
                  to="/" 
                  className="text-orange-300 hover:text-white flex items-center font-semibold tracking-wide text-sm transition-all duration-300 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-orange-400/30 hover:border-white/50 hover:bg-white/20 transform hover:scale-105 group"
                >
                  <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  BACK TO PANEL
                </Link>
                
                {/* Save Status Indicator */}
                {(lastSaved || hasUnsavedChanges) && (
                  <div className={`text-xs text-gray-300 backdrop-blur-sm rounded-lg px-3 py-2 ${
                    hasUnsavedChanges 
                      ? 'bg-yellow-500/20 border border-yellow-400/30' 
                      : 'bg-white/10'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <span>{hasUnsavedChanges ? '⚠️' : '✓'}</span>
                      <span>
                        {hasUnsavedChanges 
                          ? 'Unsaved changes' 
                          : `Last saved: ${new Date(lastSaved).toLocaleTimeString()}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`font-medium ${
                        hasUnsavedChanges ? 'text-yellow-300' : 'text-orange-400'
                      }`}>
                        Auto-save: {autoSaveEnabled ? 'ON' : 'OFF'}
                      </div>
                      <button
                        onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                        className="text-xs px-2 py-1 rounded border border-white/20 hover:bg-white/10 transition-colors"
                        aria-label={`Turn auto-save ${autoSaveEnabled ? 'off' : 'on'}`}
                      >
                        {autoSaveEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 font-bold tracking-wide text-sm disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center space-x-2 rounded-lg shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
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

      {/* Enhanced Main Content */}
      <div className="flex-1 py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-6">
          {/* Error Message */}
          {error && (
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center space-x-4 shadow-lg">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          {/* Enhanced Section Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-xl">
              <span className="text-2xl">⚡</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
              {sessionInfo.title.toUpperCase()} EVALUATION MATRIX
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-6 rounded-full shadow-lg animate-glow-pulse"></div>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive {sessionInfo.participantLabel?.toLowerCase() || 'team'} assessment for {sessionInfo.subtitle} {sessionInfo.year}. Enter scores carefully and review before export.
            </p>
          </div>
          

          
          {/* Enhanced Evaluation Table */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-scale-in mb-12">
            <MarksheetTable 
              onScoreChange={handleScoreChange} 
              initialScores={scores}
            />
          </div>
          
          {/* Enhanced Guidelines Card */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 via-white to-slate-50 rounded-3xl p-8 border border-orange-200 shadow-xl">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white font-bold text-2xl">📋</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-800 mb-4 text-2xl tracking-tight">{sessionInfo.title.toUpperCase()} EVALUATION GUIDELINES</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700 font-medium">Score each {sessionInfo.participantLabel?.toLowerCase() || 'team'} according to defined criteria</span>
                      </div>
                      <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700 font-medium">Maximum marks shown in brackets - enforce limits</span>
                      </div>
                      <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700 font-medium">Totals calculated automatically</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700 font-medium">Export results when evaluation complete</span>
                      </div>
                      <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700 font-medium">Scores can be modified until export</span>
                      </div>
                      <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700 font-medium">Review all entries before final submission</span>
                      </div>
                    </div>
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