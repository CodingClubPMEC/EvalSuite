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
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Team
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Project Title
            </th>
            {evaluationCriteria.map(criteria => (
              <th key={criteria.name} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                {criteria.name}
                <br />
                <span className="text-gray-400">({criteria.maxMarks})</span>
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Total
              <br />
              <span className="text-gray-400">({evaluationCriteria.reduce((sum, c) => sum + c.maxMarks, 0)})</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teams.map(team => (
            <tr key={team.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{team.name}</div>
                <div className="text-sm text-gray-500">
                  {team.members.join(', ')}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{team.projectTitle}</div>
              </td>
              {evaluationCriteria.map(criteria => (
                <td key={criteria.name} className="px-4 py-4 text-center">
                  <input
                    type="number"
                    min="0"
                    max={criteria.maxMarks}
                    value={scores[team.id]?.[criteria.name] || ''}
                    onChange={(e) => handleScoreChange(team.id, criteria.name, e.target.value)}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
              ))}
              <td className="px-4 py-4 text-center font-bold text-lg">
                {calculateTotal(team.id)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MarksheetTable;