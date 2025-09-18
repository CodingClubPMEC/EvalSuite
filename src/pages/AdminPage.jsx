import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  getAllSubmissionStatus, 
  getConsolidatedMarksheet, 
  getLeaderboard,
  getJuryEvaluation,
  resetAllEvaluations
} from '../services/apiService';
import { exportToExcel } from '../utils/excelExport';
import { configManager } from '../config/hackathonConfig';

function AdminPage() {
  const sessionInfo = configManager.getSessionInfo();
  const evaluationCriteria = configManager.getActiveEvaluationCriteria();
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [consolidatedData, setConsolidatedData] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);

  // Update document title dynamically
  useEffect(() => {
    const systemName = sessionInfo.systemName || 'EvalSuite';
    document.title = `${systemName} - Admin Dashboard`;
  }, [sessionInfo.systemName]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statusData, consolidatedData, leaderboardData] = await Promise.all([
        getAllSubmissionStatus(),
        getConsolidatedMarksheet(),
        getLeaderboard()
      ]);
      setSubmissionStatus(statusData);
      setConsolidatedData(consolidatedData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleDownloadConsolidated = async () => {
    try {
      if (!consolidatedData) {
        alert('No consolidated data available to download.');
        return;
      }
      
      // Create export data for consolidated marksheet
      const exportData = {
        consolidated: true,
        teams: consolidatedData.teams,
        juries: consolidatedData.juries,
        criteria: consolidatedData.criteria,
        generatedAt: consolidatedData.generatedAt
      };
      
      await exportToExcel(exportData, 'admin-consolidated');
      alert('Consolidated marksheet downloaded successfully!');
    } catch (error) {
      console.error('Error downloading consolidated marksheet:', error);
      alert('Error downloading consolidated marksheet. Please try again.');
    }
  };

  const handleDownloadIndividualJury = async (juryId, juryName) => {
    try {
      const juryEvaluation = await getJuryEvaluation(juryId);
      if (juryEvaluation && juryEvaluation.isSubmitted) {
        await exportToExcel(juryEvaluation.scores, juryId);
        alert(`${juryName}'s marksheet downloaded successfully!`);
      } else {
        alert(`${juryName} hasn't saved any evaluation data yet.`);
      }
    } catch (error) {
      console.error('Error downloading individual marksheet:', error);
      alert(`Error downloading ${juryName}'s marksheet. Please try again.`);
    }
  };

  const handleDownloadAllIndividual = async () => {
    if (submissionStatus?.completed.length === 0) {
      alert('No completed evaluations to download.');
      return;
    }

    let downloadCount = 0;
    for (const jury of submissionStatus.completed) {
      try {
        const juryEvaluation = await getJuryEvaluation(jury.id);
        if (juryEvaluation && juryEvaluation.isSubmitted) {
          await new Promise(resolve => setTimeout(resolve, downloadCount * 500)); // Stagger downloads
          await exportToExcel(juryEvaluation.scores, jury.id);
          downloadCount++;
        }
      } catch (error) {
        console.error(`Error downloading ${jury.name}'s marksheet:`, error);
      }
    }

    alert(`Downloaded ${downloadCount} individual marksheets.`);
  };

  const handleResetData = () => {
    try {
      const confirmation = window.confirm(
        'Are you sure you want to reset all evaluation data?\n\n' +
        'This will permanently delete:\n' +
        '• All jury evaluations\n' +
        '• All saved scores\n' +
        '• All submission records\n\n' +
        'This action cannot be undone.'
      );
      
      if (confirmation) {
        const doubleConfirmation = window.confirm(
          'This is your final warning.\n\n' +
          'Type YES in the next dialog to confirm reset.'
        );
        
        if (doubleConfirmation) {
          const textConfirmation = window.prompt(
            'Please type "YES" (in capital letters) to confirm the reset:'
          );
          
          if (textConfirmation === 'YES') {
            resetAllEvaluations();
            loadData();
            alert('All evaluation data has been successfully reset.');
          } else {
            alert('Reset cancelled. Invalid confirmation text.');
          }
        } else {
          alert('Reset cancelled.');
        }
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Error resetting data. Please try again or contact support.');
    }
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-8 py-4 font-bold tracking-wide text-sm transition-all duration-300 border-b-3 rounded-t-2xl relative overflow-hidden group ${
        isActive 
          ? 'border-orange-500 text-orange-500 bg-gradient-to-t from-orange-50 to-white shadow-lg' 
          : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${
        isActive ? 'translate-y-0' : ''
      }`}></div>
      <span className="relative z-10">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Enhanced Admin Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-purple-600/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(249,115,22,0.15),transparent_50%)]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-3xl">👨‍💼</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">ADMIN DASHBOARD</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-200">Consolidated {sessionInfo.evaluationPhase || 'Evaluation'} Management</span>
                    <span className="bg-orange-500/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold text-orange-300">{sessionInfo.title} Control Panel</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  to="/config" 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 font-bold tracking-wide text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 group"
                >
                  <span>⚙️</span>
                  <span>SYSTEM CONFIG</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <Link 
                  to="/" 
                  className="text-orange-300 hover:text-white flex items-center font-semibold tracking-wide text-sm transition-all duration-300 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-orange-400/30 hover:border-white/50 hover:bg-white/20 transform hover:scale-105 group"
                >
                  <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  BACK TO HOME
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-6">
          
          {/* Enhanced Tab Navigation */}
          <div className="bg-white rounded-t-3xl shadow-xl border border-gray-200 mb-0 overflow-hidden">
            <div className="flex space-x-0 overflow-x-auto bg-gradient-to-r from-gray-50 to-white">
              <TabButton id="overview" label="📊 OVERVIEW" isActive={activeTab === 'overview'} onClick={setActiveTab} />
              <TabButton id="consolidated" label="📋 CONSOLIDATED MARKSHEET" isActive={activeTab === 'consolidated'} onClick={setActiveTab} />
              <TabButton id="leaderboard" label="🏆 LEADERBOARD" isActive={activeTab === 'leaderboard'} onClick={setActiveTab} />
              <TabButton id="settings" label="⚙️ SETTINGS" isActive={activeTab === 'settings'} onClick={setActiveTab} />
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-xl shadow-2xl p-8 min-h-96">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">{sessionInfo.evaluationPhase?.toUpperCase() || 'EVALUATION'} OVERVIEW</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto"></div>
                </div>

                {submissionStatus && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Total {sessionInfo.juryLabel || 'Evaluators'}</p>
                          <p className="text-3xl font-bold text-blue-800">{submissionStatus.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xl">👥</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-semibold uppercase tracking-wider">Saved</p>
                          <p className="text-3xl font-bold text-green-800">{submissionStatus.submitted}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xl">✅</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-semibold uppercase tracking-wider">Completion</p>
                          <p className="text-3xl font-bold text-orange-800">{submissionStatus.completionPercentage}%</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xl">📈</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    📁 Download Marksheets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleDownloadConsolidated}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 font-bold tracking-wide text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <span>📈</span>
                      <span>CONSOLIDATED MARKSHEET</span>
                    </button>
                    <button
                      onClick={handleDownloadAllIndividual}
                      disabled={!submissionStatus?.completed.length}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 font-bold tracking-wide text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <span>📄</span>
                      <span>ALL INDIVIDUAL MARKSHEETS</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-3 text-center">
                    Individual downloads will be staggered to prevent browser blocking
                  </p>
                </div>

                {/* Submission Status Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Saved Evaluations */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-4">✅ Saved Evaluations</h3>
                    {submissionStatus?.completed.length > 0 ? (
                      <div className="space-y-3">
                        {submissionStatus.completed.map(jury => (
                          <div key={jury.id} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800">{jury.name}</p>
                                <p className="text-sm text-slate-600">{jury.designation}</p>
                                <p className="text-xs text-green-600 font-medium mt-1">
                                  ✓ Last saved: {new Date(jury.submittedAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDownloadIndividualJury(jury.id, jury.name)}
                                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-xs font-semibold flex items-center space-x-1"
                                  title={`Download ${jury.name}'s marksheet`}
                                >
                                  <span>📄</span>
                                  <span>DOWNLOAD</span>
                                </button>
                                <Link
                                  to={`/marking/${jury.id}`}
                                  className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-xs font-semibold flex items-center space-x-1"
                                  title={`View ${jury.name}'s evaluation`}
                                >
                                  <span>👁️</span>
                                  <span>VIEW</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-green-600">No evaluations saved yet</p>
                    )}
                  </div>

                  {/* Not Started Evaluations */}
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="text-lg font-bold text-yellow-800 mb-4">⏳ Not Started</h3>
                    {submissionStatus?.pending.length > 0 ? (
                      <div className="space-y-3">
                        {submissionStatus.pending.map(jury => (
                          <div key={jury.id} className="bg-white rounded-lg p-3 border border-yellow-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-800">{jury.name}</p>
                                <p className="text-sm text-slate-600">{jury.designation}</p>
                              </div>
                              <Link
                                to={`/marking/${jury.id}`}
                                className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors"
                              >
                                VIEW
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-yellow-600">All jury members have started their evaluations! 🎉</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content will be added in next steps */}
            {activeTab === 'consolidated' && (
              <div className="text-center py-12">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Consolidated Marksheet</h3>
                <p className="text-slate-600 mb-6">Complete consolidated marksheet with all jury evaluations</p>
                <button
                  onClick={handleDownloadConsolidated}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 font-bold tracking-wide rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  📥 DOWNLOAD CONSOLIDATED MARKSHEET
                </button>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">🏆 TOP 10 LEADERBOARD</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">
                    Rankings based on average scores from all submitted jury evaluations
                  </p>
                </div>

                {leaderboard && leaderboard.topTeams.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboard.topTeams.map((team, index) => {
                      const rankColors = {
                        0: 'from-yellow-400 to-yellow-600', // 1st place - Gold
                        1: 'from-gray-300 to-gray-500',     // 2nd place - Silver
                        2: 'from-orange-400 to-orange-600'  // 3rd place - Bronze
                      };
                      const bgColor = index < 3 ? rankColors[index] : 'from-slate-500 to-slate-600';
                      
                      return (
                        <div key={team.id} className={`bg-gradient-to-r ${bgColor} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{team.name}</h3>
                                <p className="text-sm opacity-90">{team.projectTitle}</p>
                                <p className="text-xs opacity-80 mt-1">
                                  {team.members.join(', ')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-3xl font-bold mb-1">
                                {parseFloat(team.averageScore).toFixed(1)}
                              </div>
                              <div className="text-sm opacity-90">
                                Avg Score
                              </div>
                              <div className="text-xs opacity-80 mt-1">
                                from {team.submittedJuries} jur{team.submittedJuries === 1 ? 'y' : 'ies'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Score breakdown */}
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                              {evaluationCriteria.map(criteria => (
                                <div key={criteria.name} className="">
                                  <div className="text-lg font-bold">
                                    {parseFloat(team.scores[criteria.name]?.average || 0).toFixed(1)}
                                  </div>
                                  <div className="text-xs opacity-80">
                                    {criteria.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="text-center mt-8 p-4 bg-slate-100 rounded-lg">
                      <p className="text-sm text-slate-600">
                        📅 Generated: {new Date(leaderboard.generatedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Showing top {leaderboard.topTeams.length} of {leaderboard.totalTeams} teams
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">No Evaluations Yet</h3>
                    <p className="text-slate-600">
                      Leaderboard will be available once jury members start submitting their evaluations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="text-center py-12 space-y-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">⚙️ System Settings</h3>
                <div className="max-w-md mx-auto space-y-4">
                  <button
                    onClick={handleResetData}
                    className="w-full bg-red-500 text-white px-6 py-3 font-bold tracking-wide rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    🗑️ RESET ALL DATA
                  </button>
                  <p className="text-sm text-slate-600">
                    This will permanently delete all jury evaluations and reset the system.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminPage;