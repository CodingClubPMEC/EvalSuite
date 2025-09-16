// Data Storage Utility for Jury Evaluations
import { configManager } from '../config/hackathonConfig';
import { juryProfiles, teams, evaluationCriteria } from '../data/juryData';

const STORAGE_KEY = 'sih_jury_evaluations';

// Initialize storage structure
const initializeStorage = () => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    const currentJuries = configManager.getActiveJuryMembers();
    const currentTeams = configManager.getActiveTeams();
    const currentCriteria = configManager.getActiveEvaluationCriteria();
    
    const initialData = {
      evaluations: {},
      lastUpdated: new Date().toISOString(),
      isCompleted: false,
      configVersion: configManager.getSessionInfo().year
    };
    
    // Initialize empty evaluations for all active juries
    currentJuries.forEach(jury => {
      initialData.evaluations[jury.id] = {
        juryInfo: jury,
        scores: {},
        submittedAt: null,
        isSubmitted: false
      };
      
      // Initialize empty scores for each active team
      currentTeams.forEach(team => {
        initialData.evaluations[jury.id].scores[team.id] = {};
        currentCriteria.forEach(criteria => {
          initialData.evaluations[jury.id].scores[team.id][criteria.name] = 0;
        });
      });
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  
  const data = JSON.parse(existingData);
  
  // Check if configuration has changed and update storage accordingly
  const currentVersion = configManager.getSessionInfo().year;
  if (data.configVersion !== currentVersion) {
    // Configuration changed, need to update storage structure
    return updateStorageForNewConfig(data);
  }
  
  return data;
};

// Update storage structure when configuration changes
const updateStorageForNewConfig = (existingData) => {
  const currentJuries = configManager.getActiveJuryMembers();
  const currentTeams = configManager.getActiveTeams();
  const currentCriteria = configManager.getActiveEvaluationCriteria();
  
  // Preserve existing evaluation data where possible
  const updatedData = {
    ...existingData,
    lastUpdated: new Date().toISOString(),
    configVersion: configManager.getSessionInfo().year
  };
  
  // Update jury evaluations structure
  const newEvaluations = {};
  
  currentJuries.forEach(jury => {
    // Preserve existing data if jury existed before
    const existingJuryData = existingData.evaluations[jury.id];
    
    newEvaluations[jury.id] = {
      juryInfo: jury,
      scores: {},
      submittedAt: existingJuryData?.submittedAt || null,
      isSubmitted: existingJuryData?.isSubmitted || false
    };
    
    // Update team scores structure
    currentTeams.forEach(team => {
      newEvaluations[jury.id].scores[team.id] = {};
      
      currentCriteria.forEach(criteria => {
        // Preserve existing score if it exists
        const existingScore = existingJuryData?.scores?.[team.id]?.[criteria.name];
        newEvaluations[jury.id].scores[team.id][criteria.name] = existingScore || 0;
      });
    });
  });
  
  updatedData.evaluations = newEvaluations;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
};

// Get all evaluation data
export const getAllEvaluations = () => {
  return initializeStorage();
};

// Save jury evaluation (allows multiple saves/updates)
export const saveJuryEvaluation = (juryId, scores) => {
  const data = getAllEvaluations();
  data.evaluations[juryId].scores = scores;
  data.evaluations[juryId].isSubmitted = true; // Mark as having data
  data.evaluations[juryId].submittedAt = new Date().toISOString();
  data.evaluations[juryId].lastModified = new Date().toISOString();
  data.lastUpdated = new Date().toISOString();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

// Get specific jury evaluation
export const getJuryEvaluation = (juryId) => {
  const data = getAllEvaluations();
  return data.evaluations[juryId] || null;
};

// Get consolidated marksheet (all juries combined)
export const getConsolidatedMarksheet = () => {
  const data = getAllEvaluations();
  const consolidated = {
    teams: [],
    juries: juryProfiles,
    criteria: evaluationCriteria,
    generatedAt: new Date().toISOString()
  };

  teams.forEach(team => {
    const teamData = {
      ...team,
      scores: {},
      totalScore: 0,
      averageScore: 0,
      juryScores: {}
    };

    let totalSum = 0;
    let submittedJuries = 0;

    // Collect scores from all juries
    juryProfiles.forEach(jury => {
      const juryEval = data.evaluations[jury.id];
      if (juryEval && juryEval.isSubmitted) {
        submittedJuries++;
        let juryTotal = 0;
        
        teamData.juryScores[jury.id] = {
          juryName: jury.name,
          scores: {},
          total: 0
        };

        evaluationCriteria.forEach(criteria => {
          const score = juryEval.scores[team.id]?.[criteria.name] || 0;
          teamData.juryScores[jury.id].scores[criteria.name] = score;
          juryTotal += score;
          
          if (!teamData.scores[criteria.name]) {
            teamData.scores[criteria.name] = [];
          }
          teamData.scores[criteria.name].push(score);
        });
        
        teamData.juryScores[jury.id].total = juryTotal;
        totalSum += juryTotal;
      }
    });

    // Calculate averages for each criteria
    evaluationCriteria.forEach(criteria => {
      if (teamData.scores[criteria.name]) {
        const sum = teamData.scores[criteria.name].reduce((a, b) => a + b, 0);
        teamData.scores[criteria.name] = {
          average: submittedJuries > 0 ? (sum / submittedJuries).toFixed(2) : 0,
          individual: teamData.scores[criteria.name]
        };
      }
    });

    teamData.totalScore = totalSum;
    teamData.averageScore = submittedJuries > 0 ? (totalSum / submittedJuries).toFixed(2) : 0;
    teamData.submittedJuries = submittedJuries;

    consolidated.teams.push(teamData);
  });

  // Sort teams by average score (descending)
  consolidated.teams.sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));

  return consolidated;
};

// Get leaderboard (top 10)
export const getLeaderboard = () => {
  const consolidated = getConsolidatedMarksheet();
  return {
    topTeams: consolidated.teams.slice(0, 10),
    generatedAt: consolidated.generatedAt,
    totalTeams: consolidated.teams.length
  };
};

// Check if all juries have submitted
export const getAllSubmissionStatus = () => {
  const data = getAllEvaluations();
  const status = {
    total: juryProfiles.length,
    submitted: 0,
    pending: [],
    completed: []
  };

  juryProfiles.forEach(jury => {
    const juryEval = data.evaluations[jury.id];
    if (juryEval && juryEval.isSubmitted) {
      status.submitted++;
      status.completed.push({
        ...jury,
        submittedAt: juryEval.submittedAt
      });
    } else {
      status.pending.push(jury);
    }
  });

  status.isAllCompleted = status.submitted === status.total;
  status.completionPercentage = ((status.submitted / status.total) * 100).toFixed(1);

  return status;
};

// Clean up evaluation data when jury is deleted
export const cleanupJuryEvaluationData = (juryId) => {
  const data = getAllEvaluations();
  if (data.evaluations[juryId]) {
    delete data.evaluations[juryId];
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

// Clean up evaluation data when team is deleted
export const cleanupTeamEvaluationData = (teamId) => {
  const data = getAllEvaluations();
  const currentJuries = configManager.getActiveJuryMembers();
  
  // Remove team scores from all jury evaluations
  currentJuries.forEach(jury => {
    if (data.evaluations[jury.id] && data.evaluations[jury.id].scores[teamId]) {
      delete data.evaluations[jury.id].scores[teamId];
    }
  });
  
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Clean up evaluation data when criteria is deleted
export const cleanupCriteriaEvaluationData = (criteriaName) => {
  const data = getAllEvaluations();
  const currentJuries = configManager.getActiveJuryMembers();
  const currentTeams = configManager.getActiveTeams();
  
  // Remove criteria scores from all evaluations
  currentJuries.forEach(jury => {
    if (data.evaluations[jury.id]) {
      currentTeams.forEach(team => {
        if (data.evaluations[jury.id].scores[team.id] && 
            data.evaluations[jury.id].scores[team.id][criteriaName] !== undefined) {
          delete data.evaluations[jury.id].scores[team.id][criteriaName];
        }
      });
    }
  });
  
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Reset all data (admin function)
export const resetAllEvaluations = () => {
  localStorage.removeItem(STORAGE_KEY);
  return initializeStorage();
};
