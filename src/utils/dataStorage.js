// Data Storage Utility for Jury Evaluations
import { configManager } from '../config/hackathonConfig';

const STORAGE_KEY = 'sih_jury_evaluations';
const BACKUP_STORAGE_KEY = 'sih_jury_evaluations_backup';

// Validate stored data structure
const validateStoredData = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (!data.evaluations || typeof data.evaluations !== 'object') return false;
  if (!data.lastUpdated) return false;
  
  // Validate each jury evaluation structure
  for (const juryId in data.evaluations) {
    const evaluation = data.evaluations[juryId];
    if (!evaluation.juryInfo || !evaluation.scores || typeof evaluation.scores !== 'object') {
      return false;
    }
  }
  
  return true;
};

// Create backup of current data
const createBackup = (data) => {
  try {
    const backup = {
      data: data,
      timestamp: new Date().toISOString(),
      version: '2025'
    };
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup));
  } catch (error) {
    console.warn('Failed to create backup:', error);
  }
};

// Restore from backup if main data is corrupted
const restoreFromBackup = () => {
  try {
    const backupStr = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backupStr) {
      const backup = JSON.parse(backupStr);
      if (backup.data && validateStoredData(backup.data)) {
        console.log('Restored data from backup');
        return backup.data;
      }
    }
  } catch (error) {
    console.warn('Failed to restore from backup:', error);
  }
  return null;
};

// Safe localStorage operations with error handling
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

const safeGetItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return null;
  }
};

// Initialize storage structure
const initializeStorage = () => {
  const existingData = safeGetItem(STORAGE_KEY);
  
  // Try to validate existing data
  if (existingData && validateStoredData(existingData)) {
    const currentVersion = '2025';
    if (existingData.configVersion !== currentVersion) {
      // Configuration changed, need to update storage structure
      return updateStorageForNewConfig(existingData);
    }
    return existingData;
  }
  
  // If existing data is invalid, try to restore from backup
  if (existingData && !validateStoredData(existingData)) {
    console.warn('Corrupted data detected, attempting to restore from backup...');
    const restoredData = restoreFromBackup();
    if (restoredData) {
      safeSetItem(STORAGE_KEY, restoredData);
      return restoredData;
    }
  }
  
  // Create fresh data structure
  const currentJuries = configManager.getActiveJuryMembers();
  const currentTeams = configManager.getActiveTeams();
  const currentCriteria = configManager.getActiveEvaluationCriteria();
  
  const initialData = {
    evaluations: {},
    lastUpdated: new Date().toISOString(),
    isCompleted: false,
    configVersion: '2025'
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
  
  safeSetItem(STORAGE_KEY, initialData);
  return initialData;
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
    configVersion: '2025'
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
  
  // Create backup before saving
  createBackup(updatedData);
  safeSetItem(STORAGE_KEY, updatedData);
  return updatedData;
};

// Get all evaluation data
export const getAllEvaluations = () => {
  return initializeStorage();
};

// Save jury evaluation (allows multiple saves/updates)
export const saveJuryEvaluation = (juryId, scores) => {
  try {
    const data = getAllEvaluations();
    
    // Ensure jury evaluation exists
    if (!data.evaluations[juryId]) {
      const jury = configManager.getActiveJuryMembers().find(j => j.id === juryId);
      if (!jury) {
        throw new Error(`Jury with ID ${juryId} not found`);
      }
      
      data.evaluations[juryId] = {
        juryInfo: jury,
        scores: {},
        submittedAt: null,
        isSubmitted: false
      };
    }
    
    // Create backup before modifying
    createBackup(data);
    
    data.evaluations[juryId].scores = { ...scores }; // Clone scores to avoid reference issues
    data.evaluations[juryId].isSubmitted = true; // Mark as having data
    data.evaluations[juryId].submittedAt = new Date().toISOString();
    data.evaluations[juryId].lastModified = new Date().toISOString();
    data.lastUpdated = new Date().toISOString();
    
    const success = safeSetItem(STORAGE_KEY, data);
    if (!success) {
      throw new Error('Failed to save to localStorage');
    }
    
    console.log('Evaluation saved successfully for jury:', juryId);
    return true;
  } catch (error) {
    console.error('Save evaluation error:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

// Get specific jury evaluation
export const getJuryEvaluation = (juryId) => {
  const data = getAllEvaluations();
  return data.evaluations[juryId] || null;
};

// Get consolidated marksheet (all juries combined)
export const getConsolidatedMarksheet = () => {
  const data = getAllEvaluations();
  const teams = configManager.getActiveTeams();
  const evaluationCriteria = configManager.getActiveEvaluationCriteria();
  const juryProfiles = configManager.getActiveJuryMembers();
  
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
  const juryProfiles = configManager.getActiveJuryMembers();
  
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
    createBackup(data);
    delete data.evaluations[juryId];
    data.lastUpdated = new Date().toISOString();
    safeSetItem(STORAGE_KEY, data);
  }
};

// Clean up evaluation data when team is deleted
export const cleanupTeamEvaluationData = (teamId) => {
  const data = getAllEvaluations();
  const currentJuries = configManager.getActiveJuryMembers();
  
  createBackup(data);
  
  // Remove team scores from all jury evaluations
  currentJuries.forEach(jury => {
    if (data.evaluations[jury.id] && data.evaluations[jury.id].scores[teamId]) {
      delete data.evaluations[jury.id].scores[teamId];
    }
  });
  
  data.lastUpdated = new Date().toISOString();
  safeSetItem(STORAGE_KEY, data);
};

// Clean up evaluation data when criteria is deleted
export const cleanupCriteriaEvaluationData = (criteriaName) => {
  const data = getAllEvaluations();
  const currentJuries = configManager.getActiveJuryMembers();
  const currentTeams = configManager.getActiveTeams();
  
  createBackup(data);
  
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
  safeSetItem(STORAGE_KEY, data);
};

// Reset all data (admin function)
export const resetAllEvaluations = () => {
  const data = getAllEvaluations();
  createBackup(data); // Backup before reset
  localStorage.removeItem(STORAGE_KEY);
  return initializeStorage();
};

// Storage health utilities
export const getStorageInfo = () => {
  const mainData = safeGetItem(STORAGE_KEY);
  const backupData = safeGetItem(BACKUP_STORAGE_KEY);
  
  return {
    hasMainData: !!mainData,
    hasBackup: !!backupData,
    mainDataValid: mainData ? validateStoredData(mainData) : false,
    lastUpdated: mainData?.lastUpdated || null,
    lastBackup: backupData?.timestamp || null,
    storageSupported: typeof(Storage) !== 'undefined',
    estimatedSize: mainData ? JSON.stringify(mainData).length : 0
  };
};

// Export data for manual backup
export const exportAllData = () => {
  const data = getAllEvaluations();
  const exportData = {
    ...data,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sih_evaluation_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import data from manual backup
export const importData = (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    if (!validateStoredData(data)) {
      throw new Error('Invalid data format');
    }
    
    // Create backup of current data before importing
    const currentData = getAllEvaluations();
    createBackup(currentData);
    
    // Import the new data
    const success = safeSetItem(STORAGE_KEY, data);
    if (!success) {
      throw new Error('Failed to save imported data');
    }
    
    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    return { success: false, message: `Import failed: ${error.message}` };
  }
};
