import { configManager } from '../config/hackathonConfig';

function Navbar() {
  const sessionInfo = configManager.getSessionInfo();
  
  return (
    <nav className="bg-slate-900 text-white shadow-2xl border-b-2 border-orange-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            {/* Organization Logo */}
            <div className="flex-shrink-0">
              <img 
                src={sessionInfo.logoPath} 
                alt={`${sessionInfo.organizationShort} Logo`} 
                className="h-12 w-12 rounded-lg bg-white/10 p-1 shadow-lg"
              />
            </div>
            
            <div className="text-xl font-bold tracking-wide">
              🏆 SIH JURY MARKING
            </div>
            <div className="hidden lg:block w-px h-6 bg-orange-500"></div>
            <div className="hidden lg:block text-sm font-medium text-gray-300">
              {sessionInfo.organization}
            </div>
          </div>
          <div className="text-sm font-medium text-orange-400">
            HACKATHON {sessionInfo.year}
          </div>
        </div>
        {/* Mobile college name */}
        <div className="md:hidden mt-2 text-xs text-gray-300 font-medium">
          {sessionInfo.organization}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;