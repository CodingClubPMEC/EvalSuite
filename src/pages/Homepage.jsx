import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JuryCard from '../components/JuryCard';
import { configManager } from '../config/hackathonConfig';
import { juryProfiles } from '../data/juryData';

function Homepage() {
  const sessionInfo = configManager.getSessionInfo();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
              {sessionInfo.title}
            </h1>
            <p className="text-lg mb-2 text-gray-300 font-medium">
              {sessionInfo.subtitle}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-4"></div>
            <p className="text-xl mb-2 text-orange-400 font-semibold tracking-wider">
              JURY EVALUATION PLATFORM
            </p>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed mb-2">
            Professional jury marking system designed for competitive evaluation.
            Select your panel profile to begin comprehensive team assessment.
          </p>
          <p className="text-orange-300 text-sm font-semibold tracking-wide">
            {sessionInfo.organization}
          </p>
        </div>
      </div>

      {/* Jury Profiles Section */}
      <div className="flex-1 py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-wide">
              🏆 EVALUATION PANEL
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-4"></div>
            <p className="text-slate-600 max-w-lg mx-auto">
              Expert jury members ready to evaluate innovation, technical excellence, and competitive solutions.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {juryProfiles.map((jury) => (
                <JuryCard key={jury.id} jury={jury} />
              ))}
            </div>
            
            {/* Admin Access */}
            <div className="mt-12 text-center">
              <div className="inline-block p-4 bg-slate-100 rounded-lg border border-slate-200">
                <p className="text-slate-600 text-sm mb-3 font-medium">System Administrator Access</p>
                <Link
                  to="/admin"
                  className="inline-block bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 font-bold tracking-wider text-sm hover:from-orange-500 hover:to-orange-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  👨‍💼 ADMIN DASHBOARD
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Homepage;