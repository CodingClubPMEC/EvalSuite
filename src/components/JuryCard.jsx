import { Link } from 'react-router-dom';
import { memo } from 'react';

const JuryCard = memo(function JuryCard({ jury }) {
  return (
    <article className="bg-gradient-to-br from-white via-gray-50 to-white shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 ease-out border border-gray-200 hover:border-orange-300 relative overflow-hidden group rounded-3xl h-full flex flex-col" role="article" aria-labelledby={`jury-${jury.id}-name`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-all duration-500" aria-hidden="true"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" aria-hidden="true"></div>
      
      <div className="p-8 relative z-10 flex flex-col h-full">
        {/* Enhanced Profile Section */}
        <div className="text-center mb-6 flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="text-white font-black text-2xl tracking-wide relative z-10">{jury.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
        </div>
        
        {/* Fixed Height Content Area */}
        <div className="flex-1 flex flex-col justify-between text-center">
          <div className="space-y-3 mb-6">
            <h3 id={`jury-${jury.id}-name`} className="text-xl font-black text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors duration-300 leading-tight min-h-[3rem] flex items-center justify-center">{jury.name}</h3>
            <div className="space-y-2 min-h-[4rem] flex flex-col justify-center">
              <p className="text-slate-600 text-sm font-semibold transition-all duration-300 group-hover:text-slate-700 bg-slate-100 rounded-full px-4 py-2 inline-block" aria-label={`Designation: ${jury.designation}`}>{jury.designation}</p>
              <p className="text-orange-600 text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:text-orange-500 block" aria-label={`Department: ${jury.department}`}>{jury.department}</p>
            </div>
          </div>
          
          {/* Enhanced Action Button - Fixed at bottom */}
          <div className="mt-auto">
            <Link
              to={`/marking/${jury.id}`}
              className="block w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-4 px-6 font-bold tracking-wider text-sm hover:from-orange-500 hover:to-orange-600 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:ring-offset-2 rounded-2xl group relative overflow-hidden"
              aria-label={`Start evaluation for ${jury.name}`}
              role="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>⚡</span>
                <span>START EVALUATION</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
});

export default JuryCard;