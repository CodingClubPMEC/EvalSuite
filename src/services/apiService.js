// API Service - Replaces localStorage functionality with MongoDB backend calls
import hackathonConfig from '../config/hackathonConfig';
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();
    
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
      console.log(`[${requestId}] [REQUEST] ${config.method || 'GET'} ${url}`);
      console.log(`[${requestId}] [CONFIG] Headers:`, config.headers);
      
      if (config.body) {
        console.log(`[${requestId}] [BODY] Request body size: ${config.body.length} characters`);
      }

      const response = await fetch(url, config);
      const duration = Date.now() - startTime;
      
      console.log(`[${requestId}] [RESPONSE] Status: ${response.status} ${response.statusText} (${duration}ms)`);
      console.log(`[${requestId}] [RESPONSE] Headers:`, Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      
      console.log(`[${requestId}] [DATA] Response data received:`, {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        success: data?.success,
        message: data?.message || data?.error
      });

      if (!response.ok) {
        console.error(`[${requestId}] [ERROR] HTTP error ${response.status}:`, data);
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      console.log(`[${requestId}] [SUCCESS] Request completed successfully in ${duration}ms`);
      return data;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`[${requestId}] [ERROR] API request failed after ${duration}ms:`, {
        endpoint,
        method: config.method || 'GET',
        url,
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      // Enhanced error context
      const enhancedError = new Error(`API request failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.requestId = requestId;
      enhancedError.endpoint = endpoint;
      enhancedError.url = url;
      enhancedError.method = config.method || 'GET';
      enhancedError.duration = duration;
      
      throw enhancedError;
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
    const startTime = Date.now();
    const operationId = `save_eval_${juryId}_${Date.now()}`;
    
    try {
      console.log(`[${operationId}] [START] Saving jury evaluation for jury ${juryId}${autoSave ? ' (auto-save)' : ''}`);
      console.log(`[${operationId}] [DATA] Scores data:`, JSON.stringify(scores, null, 2));
      
      // Validate input parameters
      if (!juryId || typeof juryId !== 'string' && typeof juryId !== 'number') {
        throw new Error('Invalid juryId provided');
      }
      
      if (!scores || typeof scores !== 'object') {
        throw new Error('Invalid scores data provided');
      }
      
      // Validate scores structure
      const validCriteria = ['Innovation', 'Feasibility', 'Presentation', 'Impact', 'Technical Quality'];
      const scoresEntries = Object.entries(scores);
      
      if (scoresEntries.length === 0) {
        console.warn(`[${operationId}] [WARNING] No scores provided for jury ${juryId}`);
      }
      
      // Log score validation
      scoresEntries.forEach(([teamId, teamScores]) => {
        if (teamScores && typeof teamScores === 'object') {
          const validScores = Object.keys(teamScores).filter(key => validCriteria.includes(key));
          const invalidScores = Object.keys(teamScores).filter(key => !validCriteria.includes(key));
          
          if (invalidScores.length > 0) {
            console.warn(`[${operationId}] [WARNING] Invalid criteria for team ${teamId}:`, invalidScores);
          }
          
          console.log(`[${operationId}] [TEAM] Team ${teamId} - Valid criteria: ${validScores.length}, Invalid: ${invalidScores.length}`);
        }
      });
      
      console.log(`[${operationId}] [REQUEST] Making API call to /evaluations/jury/${juryId}`);
      
      let response = await this.post(`/evaluations/jury/${juryId}`, {
        scores,
        autoSave
      });
      
      const duration = Date.now() - startTime;
      
      // Enhanced response validation
      if (!response) {
        throw new Error('No response received from server');
      }
      
      if (typeof response.success !== 'boolean') {
        console.warn(`[${operationId}] [WARNING] Unexpected response format - success field missing or invalid`);
        console.log(`[${operationId}] [RESPONSE] Full response:`, JSON.stringify(response, null, 2));
      }
      
      if (response.success) {
        console.log(`[${operationId}] [SUCCESS] Jury evaluation saved successfully in ${duration}ms`);
        console.log(`[${operationId}] [RESPONSE] Message: ${response.message || 'No message'}`);
        
        if (response.data) {
          console.log(`[${operationId}] [DATA] Response data:`, JSON.stringify(response.data, null, 2));
        }
      } else {
        console.error(`[${operationId}] [ERROR] Server returned success: false`);
        console.error(`[${operationId}] [ERROR] Error message: ${response.error || response.message || 'Unknown error'}`);
        throw new Error(response.error || response.message || 'Server returned unsuccessful response');
      }
      
      return response.success;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`[${operationId}] [ERROR] Failed to save jury evaluation after ${duration}ms`);
      console.error(`[${operationId}] [ERROR] Error type: ${error.constructor.name}`);
      console.error(`[${operationId}] [ERROR] Error message: ${error.message}`);
      
      if (error.stack) {
        console.error(`[${operationId}] [ERROR] Stack trace:`, error.stack);
      }
      
      // If there is no active event (common when switching to Atlas), attempt to initialize and retry once
      const noActiveEvent = /No active event found/i.test(error.message || '');
      if (noActiveEvent) {
        try {
          console.warn(`[${operationId}] [RECOVERY] No active event found. Initializing event from config and retrying once...`);
          await this.initializeEventFromConfig(hackathonConfig);
          console.log(`[${operationId}] [RECOVERY] Initialization complete. Retrying save...`);

          const retryResponse = await this.post(`/evaluations/jury/${juryId}`, { scores, autoSave });
          if (retryResponse && retryResponse.success) {
            console.log(`[${operationId}] [RECOVERY] Retry save successful.`);
            return true;
          }
          console.error(`[${operationId}] [RECOVERY] Retry save failed:`, retryResponse);
        } catch (initErr) {
          console.error(`[${operationId}] [RECOVERY] Initialization or retry failed: ${initErr.message}`);
        }
      }

      // Enhanced error handling with specific error types
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error(`[${operationId}] [ERROR] Network error - server may be unreachable`);
        throw new Error(`Network error: Unable to connect to server. Please check your connection.`);
      }
      
      if (error.message.includes('404')) {
        console.error(`[${operationId}] [ERROR] Jury not found (404)`);
        throw new Error(`Jury with ID ${juryId} not found. Please verify the jury ID.`);
      }
      
      if (error.message.includes('400')) {
        console.error(`[${operationId}] [ERROR] Bad request (400) - invalid data format`);
        throw new Error(`Invalid data format. Please check your scores data.`);
      }
      
      if (error.message.includes('500')) {
        console.error(`[${operationId}] [ERROR] Server error (500)`);
        throw new Error(`Server error occurred. Please try again later.`);
      }
      
      // Re-throw with enhanced context
      const enhancedError = new Error(`Failed to save jury evaluation: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.operationId = operationId;
      enhancedError.juryId = juryId;
      enhancedError.autoSave = autoSave;
      enhancedError.duration = duration;
      
      throw enhancedError;
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
    const operationId = `autosave_${juryId}_${Date.now()}`;
    
    try {
      console.log(`[${operationId}] [AUTOSAVE] Starting auto-save for jury ${juryId}`);
      console.log(`[${operationId}] [AUTOSAVE] Scores count: ${Object.keys(scores || {}).length}`);
      
      const result = await this.saveJuryEvaluation(juryId, scores, true);
      
      console.log(`[${operationId}] [AUTOSAVE] Auto-save completed successfully`);
      return result;
      
    } catch (error) {
      console.error(`[${operationId}] [AUTOSAVE] Auto-save failed for jury ${juryId}:`, error.message);
      console.error(`[${operationId}] [AUTOSAVE] Error details:`, {
        errorType: error.constructor.name,
        errorMessage: error.message,
        juryId,
        scoresCount: Object.keys(scores || {}).length
      });
      
      // Don't throw error for auto-save failures to prevent disrupting user experience
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
