import { Link } from 'react-router-dom';

function JuryCard({ jury }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 hover:border-orange-400 relative overflow-hidden group">
      {/* 3D Shadow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Orange Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 w-full"></div>
      
      <div className="p-6 relative z-10">
        {/* Initials Badge */}
        <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <span className="text-white font-bold text-xl tracking-wide">{jury.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        
        {/* Jury Info */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-800 tracking-wide group-hover:text-slate-900 transition-colors">{jury.name}</h3>
          <p className="text-slate-600 text-sm font-medium">{jury.designation}</p>
          <p className="text-orange-600 text-xs font-bold uppercase tracking-wider">{jury.department}</p>
        </div>
        
        {/* Action Button */}
        <div className="mt-6">
          <Link
            to={`/marking/${jury.id}`}
            className="block w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 px-4 font-bold tracking-wider text-sm hover:from-orange-500 hover:to-orange-600 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ⚡ START EVALUATION
          </Link>
        </div>
      </div>
    </div>
  );
}

export default JuryCard;