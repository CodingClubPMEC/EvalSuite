import { useState, useEffect } from 'react';
import { teams, evaluationCriteria } from '../data/juryData';

function MarksheetTable({ onScoreChange }) {
  const [scores, setScores] = useState({});

  // Initialize scores state
  useEffect(() => {
    const initialScores = {};
    teams.forEach(team => {
      initialScores[team.id] = {};
      evaluationCriteria.forEach(criteria => {
        initialScores[team.id][criteria.name] = 0;
      });
    });
    setScores(initialScores);
  }, []);

  // Calculate total for a team
  const calculateTotal = (teamId) => {
    if (!scores[teamId]) return 0;
    return evaluationCriteria.reduce((total, criteria) => {
      return total + (scores[teamId][criteria.name] || 0);
    }, 0);
  };

  // Handle score change
  const handleScoreChange = (teamId, criteriaName, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const criteria = evaluationCriteria.find(c => c.name === criteriaName);
    const finalValue = Math.min(numValue, criteria.maxMarks);

    setScores(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [criteriaName]: finalValue
      }
    }));

    // Notify parent component
    if (onScoreChange) {
      const updatedScores = {
        ...scores,
        [teamId]: {
          ...scores[teamId],
          [criteriaName]: finalValue
        }
      };
      onScoreChange(updatedScores);
    }
  };

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
                  <input
                    type="number"
                    min="0"
                    max={criteria.maxMarks}
                    value={scores[team.id]?.[criteria.name] || ''}
                    onChange={(e) => handleScoreChange(team.id, criteria.name, e.target.value)}
                    className="w-16 px-2 py-2 text-center border-2 border-gray-300 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-lg shadow-sm hover:border-slate-400 transition-colors duration-200"
                    placeholder="0"
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
}

export default MarksheetTable;