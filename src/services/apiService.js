// API Service - Replaces localStorage functionality with MongoDB backend calls
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, { 
      method: 'POST', 
      body: data 
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, { 
      method: 'PUT', 
      body: data 
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    try {
      return await this.get('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', message: error.message };
    }
  }

  // Initialize database (equivalent to initializeStorage)
  async initializeDatabase() {
    try {
      const response = await this.post('/events/initialize', {});
      return response.data;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Get all evaluation data (replaces getAllEvaluations)
  async getAllEvaluations() {
    try {
      const response = await this.get('/events/active');
      return {
        evaluations: this.transformEventToEvaluations(response.data),
        lastUpdated: response.data.updatedAt,
        isCompleted: response.data.status === 'completed',
        configVersion: '2025'
      };
    } catch (error) {
      console.error('Failed to get all evaluations:', error);
      // Return empty structure if no active event found
      return {
        evaluations: {},
        lastUpdated: new Date().toISOString(),
        isCompleted: false,
        configVersion: '2025'
      };
    }
  }

  // Transform Event data to match localStorage structure
  transformEventToEvaluations(eventData) {
    const evaluations = {};
    
    if (eventData && eventData.juries) {
      eventData.juries.forEach(jury => {
        const scores = {};
        jury.teamEvaluations.forEach(team => {
          scores[team.teamId] = {
            Innovation: team.individualMarks.Innovation.score,
            Feasibility: team.individualMarks.Feasibility.score,
            Presentation: team.individualMarks.Presentation.score,
            Impact: team.individualMarks.Impact.score,
            'Technical Quality': team.individualMarks['Technical Quality'].score
          };
        });

        evaluations[jury.juryId] = {
          juryInfo: {
            id: jury.juryId,
            name: jury.name,
            designation: jury.designation,
            department: jury.department,
            email: jury.email,
            expertise: jury.expertise
          },
          scores: scores,
          submittedAt: jury.lastActivity,
          isSubmitted: jury.totalTeamsEvaluated > 0
        };
      });
    }

    return evaluations;
  }

  // Save jury evaluation (replaces saveJuryEvaluation)
  async saveJuryEvaluation(juryId, scores, autoSave = false) {
    try {
      const response = await this.post(`/evaluations/jury/${juryId}`, {
        scores,
        autoSave
      });
      
      return response.success;
    } catch (error) {
      console.error('Failed to save jury evaluation:', error);
      throw error;
    }
  }

  // Get specific jury evaluation (replaces getJuryEvaluation)
  async getJuryEvaluation(juryId) {
    try {
      const response = await this.get(`/events/active/jury/${juryId}`);
      
      if (response.success && response.data) {
        return {
          juryInfo: response.data.jury,
          scores: response.data.scores,
          submittedAt: response.data.lastSaved,
          lastUpdated: response.data.lastSaved,
          isSubmitted: response.data.statistics.totalTeamsEvaluated > 0
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get jury evaluation:', error);
      return null;
    }
  }

  // Get consolidated marksheet (replaces getConsolidatedMarksheet)
  async getConsolidatedMarksheet() {
    try {
      const response = await this.get('/events/active/consolidated');
      return response.data;
    } catch (error) {
      console.error('Failed to get consolidated marksheet:', error);
      throw error;
    }
  }

  // Get leaderboard (replaces getLeaderboard)
  async getLeaderboard() {
    try {
      const response = await this.get('/events/active/leaderboard');
      return {
        topTeams: response.data.leaderboard.slice(0, 10),
        generatedAt: response.data.generatedAt,
        totalTeams: response.data.leaderboard.length
      };
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  // Get all submission status (replaces getAllSubmissionStatus)
  async getAllSubmissionStatus() {
    try {
      const response = await this.get('/evaluations/status');
      
      if (response.success && response.data) {
        const juriesStatus = response.data.juriesStatus;
        const completed = juriesStatus.filter(jury => jury.isComplete);
        const pending = juriesStatus.filter(jury => !jury.isComplete);
        
        return {
          total: juriesStatus.length,
          submitted: completed.length,
          pending: pending.map(jury => ({
            id: jury.juryId,
            name: jury.juryName,
            designation: jury.designation,
            department: jury.department
          })),
          completed: completed.map(jury => ({
            id: jury.juryId,
            name: jury.juryName,
            designation: jury.designation,
            department: jury.department,
            submittedAt: jury.lastActivity
          })),
          isAllCompleted: completed.length === juriesStatus.length,
          completionPercentage: response.data.summary.overallCompletion
        };
      }

      return {
        total: 0,
        submitted: 0,
        pending: [],
        completed: [],
        isAllCompleted: false,
        completionPercentage: 0
      };
    } catch (error) {
      console.error('Failed to get submission status:', error);
      throw error;
    }
  }

  // Auto-save functionality
  async autoSave(juryId, scores) {
    try {
      return await this.saveJuryEvaluation(juryId, scores, true);
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't throw error for auto-save failures
      return false;
    }
  }

  // Get storage info (for compatibility with existing components)
  async getStorageInfo() {
    try {
      const healthCheck = await this.healthCheck();
      const isConnected = healthCheck.status === 'OK' && healthCheck.database === 'Connected';
      
      return {
        hasMainData: isConnected,
        hasBackup: true, // MongoDB provides backup capabilities
        mainDataValid: isConnected,
        lastUpdated: new Date().toISOString(),
        lastBackup: new Date().toISOString(),
        storageSupported: true,
        estimatedSize: 0, // Not applicable for database
        connectionStatus: isConnected ? 'Connected' : 'Disconnected'
      };
    } catch (error) {
      return {
        hasMainData: false,
        hasBackup: false,
        mainDataValid: false,
        lastUpdated: null,
        lastBackup: null,
        storageSupported: false,
        estimatedSize: 0,
        connectionStatus: 'Error'
      };
    }
  }

  // Export data (for backup purposes)
  async exportAllData() {
    try {
      const consolidated = await this.getConsolidatedMarksheet();
      const exportData = {
        ...consolidated,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        source: 'MongoDB'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evalsuite_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, message: `Export failed: ${error.message}` };
    }
  }

  // Initialize event with configuration data
  async initializeEventFromConfig(config) {
    try {
      const response = await this.post('/events/initialize', {
        title: config.session?.title || 'INTERNAL HACKATHON',
        subtitle: config.session?.subtitle || 'for Smart India Hackathon',
        year: config.session?.year || '2025',
        organization: config.session?.organization || 'Organization',
        juries: config.juryMembers || [],
        teams: config.teams || [],
        evaluationCriteria: config.evaluationCriteria || []
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to initialize event from config:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export compatibility functions to match localStorage interface
export const getAllEvaluations = () => apiService.getAllEvaluations();
export const saveJuryEvaluation = (juryId, scores) => apiService.saveJuryEvaluation(juryId, scores, false);
export const getJuryEvaluation = (juryId) => apiService.getJuryEvaluation(juryId);
export const getConsolidatedMarksheet = () => apiService.getConsolidatedMarksheet();
export const getLeaderboard = () => apiService.getLeaderboard();
export const getAllSubmissionStatus = () => apiService.getAllSubmissionStatus();
export const getStorageInfo = () => apiService.getStorageInfo();
export const exportAllData = () => apiService.exportAllData();

// Auto-save specific function
export const autoSaveEvaluation = (juryId, scores) => apiService.autoSave(juryId, scores);

// Reset all evaluations (admin function)
export const resetAllEvaluations = () => {
  // This would need to be implemented as an API endpoint
  console.warn('resetAllEvaluations not yet implemented for MongoDB backend');
  throw new Error('Reset functionality not yet implemented for database backend');
};

// Cleanup functions (for compatibility with ConfigPage)
export const cleanupJuryEvaluationData = (juryId) => {
  console.warn('cleanupJuryEvaluationData not yet implemented for MongoDB backend');
  // This would need to be implemented as an API endpoint
};

export const cleanupTeamEvaluationData = (teamId) => {
  console.warn('cleanupTeamEvaluationData not yet implemented for MongoDB backend');
  // This would need to be implemented as an API endpoint
};

export const cleanupCriteriaEvaluationData = (criteriaName) => {
  console.warn('cleanupCriteriaEvaluationData not yet implemented for MongoDB backend');
  // This would need to be implemented as an API endpoint
};

// New API-specific exports
export { apiService };
export default apiService;
