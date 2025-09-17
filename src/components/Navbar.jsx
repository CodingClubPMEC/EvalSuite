import { memo } from 'react';
import { configManager } from '../config/hackathonConfig';

const Navbar = memo(function Navbar() {
  const sessionInfo = configManager.getSessionInfo();
  
  return (
    <nav className="bg-slate-900 text-white shadow-lg border-b border-orange-500" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left: Logo and College Name */}
          <div className="flex items-center space-x-4">
            <img 
              src={sessionInfo.logoPath} 
              alt={`${sessionInfo.organizationShort} Logo`} 
              className="h-12 w-12 rounded-lg bg-white/10 p-1"
            />
            <div className="text-lg md:text-xl font-bold text-white">
              {sessionInfo.organization}
            </div>
          </div>
          
          {/* Right: System Info */}
          <div className="text-right">
            <div className="text-sm font-bold text-orange-400">
              {sessionInfo.systemName || 'EvalSuite'}
            </div>
            <div className="text-xs text-gray-300">
              {sessionInfo.year}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;