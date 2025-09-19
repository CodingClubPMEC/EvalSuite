import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JuryCard from '../components/JuryCard';
import { configManager } from '../config/hackathonConfig';

function Homepage() {
  const sessionInfo = configManager.getSessionInfo();
  const juryProfiles = configManager.getActiveJuryMembers();
  
  // Update document title dynamically
  useEffect(() => {
    const systemName = sessionInfo.systemName || 'EvalSuite';
    const title = sessionInfo.title || 'Professional Evaluation Platform';
    document.title = `${systemName} - ${title}`;
  }, [sessionInfo.systemName, sessionInfo.title]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 relative overflow-hidden" role="banner">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-purple-600/10 animate-pulse-soft" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(249,115,22,0.15),transparent_50%)] animate-pulse-slow" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]" aria-hidden="true"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Main Hero Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 md:p-12 shadow-2xl mb-8 animate-fade-in-up">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-xl">
                  <span className="text-3xl">🏆</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-white via-orange-200 to-orange-300 bg-clip-text text-transparent leading-tight">
                  {sessionInfo.title}
                </h1>
                <p className="text-xl md:text-2xl mb-4 text-gray-300 font-medium">
                  {sessionInfo.subtitle}
                </p>
                <div className="w-32 h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 mx-auto mb-6 rounded-full shadow-lg animate-glow-pulse" aria-hidden="true"></div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30">
                <p className="text-2xl md:text-3xl font-bold text-orange-300 tracking-wider mb-2">
                  {sessionInfo.juryLabel?.toUpperCase() || 'EXPERT EVALUATION'} PLATFORM
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {sessionInfo.systemPurpose || 'Professional evaluation and scoring'} system designed for {sessionInfo.eventType?.toLowerCase() || 'competitive evaluation'}
                </p>
              </div>
            </div>
            
            {/* Action Call-to-Action */}
            <div className="text-center mb-16 animate-fade-in-up">
              <p className="text-gray-400 text-lg mb-6">
                Select your panel profile to begin comprehensive {sessionInfo.participantLabel?.toLowerCase() || 'team'} assessment
              </p>
              <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-6 py-3 border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jury Profiles Section */}
      <main className="flex-1 py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50" role="main">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-xl">
              <span className="text-2xl">🏆</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
              {sessionInfo.evaluationPhase?.toUpperCase() || 'EVALUATION'} PANEL
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-6 rounded-full shadow-lg animate-scale-in" aria-hidden="true"></div>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {sessionInfo.juryLabel || 'Expert evaluators'} ready to assess innovation, technical excellence, and {sessionInfo.eventType?.toLowerCase() || 'competitive solutions'} with precision and fairness.
            </p>
          </div>
          
          {/* Jury Cards Grid */}
          <div className="max-w-7xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8" role="list">
              {juryProfiles.map((jury, index) => (
                <div 
                  key={jury.id} 
                  className="transform hover:scale-105 transition-all duration-300 animate-fade-in-up" 
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <JuryCard jury={jury} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Enhanced Admin Access Section */}
          <section className="text-center animate-slide-in-right" aria-labelledby="admin-access">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl mb-6 shadow-lg">
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <h3 id="admin-access" className="text-slate-700 text-lg font-bold mb-4">System Administrator</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Access comprehensive dashboard for system management and evaluation oversight
                </p>
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-4 font-bold tracking-wider text-sm hover:from-orange-500 hover:to-orange-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:ring-offset-2 group"
                  aria-label="Access administrator dashboard"
                >
                  <span className="mr-2">ADMIN DASHBOARD</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Homepage;