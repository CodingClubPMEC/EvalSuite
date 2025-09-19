import { memo } from 'react';
import { configManager } from '../config/hackathonConfig';

const Footer = memo(function Footer() {
  const sessionInfo = configManager.getSessionInfo();
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 border-t-4 border-orange-500 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-600/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(249,115,22,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-xl font-bold">★</span>
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full"></div>
          </div>
          
          {/* Main Footer Content */}
          <div className="space-y-4">
            <p className="text-lg font-black tracking-wider text-white">
              © {sessionInfo.year} {sessionInfo.title} HACKATHON - {sessionInfo.organizationShort}
            </p>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-w-md mx-auto">
              <p className="text-sm font-bold text-orange-300 mb-2">
                {sessionInfo.organization}
              </p>
              <p className="text-xs text-gray-300 font-medium">
                {sessionInfo.systemPurpose?.toUpperCase() || 'EVALUATION SYSTEM'}
              </p>
            </div>
            
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-full px-6 py-3 border border-orange-400/30">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-orange-300 font-bold">
                {sessionInfo.subtitle.toUpperCase()} {sessionInfo.year}
              </p>
            </div>
          </div>
          
          {/* Enhanced Credits Section */}
          <div className="pt-6 border-t border-white/20 mt-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
              <p className="text-sm text-gray-300 mb-2">
                💻 Developed by <span className="text-orange-400 font-bold">Coding Design and Development Club</span>
              </p>
              <p className="text-xs text-gray-400">
                Crafted with precision for competitive evaluation
              </p>
              <div className="flex items-center justify-center space-x-2 mt-3">
                <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-orange-300 font-medium">Professional • Secure • Efficient</span>
                <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;