import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { configManager } from '../config/hackathonConfig';
import { LoadingSpinner } from './LoadingComponents';
import { ScoreInput } from '../hooks/useFormValidation.jsx';

const MarksheetTable = memo(function MarksheetTable({ onScoreChange, initialScores = {} }) {
  const [scores, setScores] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState([]);

  // Load dynamic teams and criteria
  useEffect(() => {
    const loadData = () => {
      setTeams(configManager.getActiveTeams());
      setEvaluationCriteria(configManager.getActiveEvaluationCriteria());
    };
    
    loadData();
    
    // Listen for configuration changes (optional - for real-time updates)
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize scores state with either provided initialScores or defaults
  useEffect(() => {
    if (teams.length > 0 && evaluationCriteria.length > 0) {
      const defaultScores = {};
      teams.forEach(team => {
        defaultScores[team.id] = {};
        evaluationCriteria.forEach(criteria => {
          // Use initialScores if available, otherwise default to 0
          defaultScores[team.id][criteria.name] = 
            initialScores[team.id]?.[criteria.name] ?? 0;
        });
      });
      setScores(defaultScores);
      setIsLoading(false);
    }
  }, [initialScores, teams, evaluationCriteria]);

  // Memoize expensive calculations
  const memoizedTotals = useMemo(() => {
    const totals = {};
    teams.forEach(team => {
      if (scores[team.id]) {
        totals[team.id] = evaluationCriteria.reduce((total, criteria) => {
          return total + (scores[team.id][criteria.name] || 0);
        }, 0);
      } else {
        totals[team.id] = 0;
      }
    });
    return totals;
  }, [scores, teams, evaluationCriteria]);

  // Calculate total for a team (now uses memoized values)
  const calculateTotal = useCallback((teamId) => {
    return memoizedTotals[teamId] || 0;
  }, [memoizedTotals]);

  // Handle score change with useCallback for performance
  const handleScoreChange = useCallback((teamId, criteriaName, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const criteria = evaluationCriteria.find(c => c.name === criteriaName);
    const finalValue = Math.min(numValue, criteria.maxMarks);

    setScores(prev => {
      const updatedScores = {
        ...prev,
        [teamId]: {
          ...prev[teamId],
          [criteriaName]: finalValue
        }
      };
      
      // Notify parent component
      if (onScoreChange) {
        onScoreChange(updatedScores);
      }
      
      return updatedScores;
    });
  }, [onScoreChange, evaluationCriteria]);

  // Mobile Card Component for individual team (memoized)
  const TeamCard = memo(({ team, index }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-4 overflow-hidden">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">{index + 1}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm tracking-wide">{team.name}</h3>
            <p className="text-gray-300 text-xs">{team.projectTitle}</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-gray-400 text-xs">{team.members.join(', ')}</p>
        </div>
      </div>
      
      {/* Criteria Scoring */}
      <div className="p-4 space-y-3">
        {evaluationCriteria.map(criteria => (
          <div key={criteria.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-semibold text-slate-800 text-sm">{criteria.name}</p>
              <p className="text-xs text-slate-600">Max: {criteria.maxMarks}</p>
            </div>
            <div className="flex items-center space-x-2">
              <ScoreInput
                teamName={team.name}
                criteriaName={criteria.name}
                maxValue={criteria.maxMarks}
                value={scores[team.id]?.[criteria.name] || ''}
                onChange={(e) => handleScoreChange(team.id, criteria.name, e.target.value)}
              />
              <span className="text-xs text-slate-600">/{criteria.maxMarks}</span>
            </div>
          </div>
        ))}
        
        {/* Total Score */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Total Score</p>
              <p className="text-xs text-slate-600">Max: {evaluationCriteria.reduce((sum, c) => sum + c.maxMarks, 0)}</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-lg shadow-md">
              {calculateTotal(team.id)}
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" color="orange" />
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {teams.map((team, index) => (
          <TeamCard key={team.id} team={team} index={index} />
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gradient-to-r from-slate-900 to-slate-800">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-b-2 border-orange-500">
              📊 TEAM
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-b-2 border-orange-500">
              📁 PROJECT
            </th>
            {evaluationCriteria.map(criteria => (
              <th key={criteria.name} className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider border-b-2 border-orange-500">
                ⭐ {criteria.name}
                <br />
                <span className="text-orange-400 font-semibold">MAX: {criteria.maxMarks}</span>
              </th>
            ))}
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider border-b-2 border-orange-500 bg-gradient-to-r from-orange-500/20 to-orange-600/20">
              📈 TOTAL
              <br />
              <span className="text-orange-300 font-semibold">MAX: {evaluationCriteria.reduce((sum, c) => sum + c.maxMarks, 0)}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y-2 divide-gray-100">
          {teams.map((team, index) => (
            <tr key={team.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-slate-50 border-l-4 border-transparent hover:border-orange-400 transition-all duration-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 tracking-wide">{team.name}</div>
                    <div className="text-xs text-slate-600">
                      {team.members.join(', ')}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-800 font-medium leading-tight">{team.projectTitle}</div>
              </td>
              {evaluationCriteria.map(criteria => (
                <td key={criteria.name} className="px-4 py-4 text-center">
                  <ScoreInput
                    teamName={team.name}
                    criteriaName={criteria.name}
                    maxValue={criteria.maxMarks}
                    value={scores[team.id]?.[criteria.name] || ''}
                    onChange={(e) => handleScoreChange(team.id, criteria.name, e.target.value)}
                  />
                </td>
              ))}
              <td className="px-4 py-4 text-center bg-gradient-to-r from-slate-100 to-gray-100">
                <div className="inline-block px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-lg shadow-md">
                  {calculateTotal(team.id)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default MarksheetTable;