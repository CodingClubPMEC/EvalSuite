import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { hackathonConfig, configManager } from '../config/hackathonConfig';
import { 
  cleanupJuryEvaluationData, 
  cleanupTeamEvaluationData, 
  cleanupCriteriaEvaluationData 
} from '../utils/dataStorage';

function ConfigPage() {
  const [activeTab, setActiveTab] = useState('session');
  const [sessionConfig, setSessionConfig] = useState(hackathonConfig.session);
  const [juryMembers, setJuryMembers] = useState(hackathonConfig.juryMembers);
  const [teams, setTeams] = useState(hackathonConfig.teams);
  const [evaluationCriteria, setEvaluationCriteria] = useState(hackathonConfig.evaluationCriteria);
  const [isEditing, setIsEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(null);

  // Form states for adding new items
  const [newJuryForm, setNewJuryForm] = useState({
    name: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    expertise: ''
  });

  const [newTeamForm, setNewTeamForm] = useState({
    name: '',
    members: '',
    projectTitle: '',
    category: ''
  });

  const [newCriteriaForm, setNewCriteriaForm] = useState({
    name: '',
    maxMarks: 0,
    description: '',
    weight: 0
  });

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-bold tracking-wide text-sm transition-all duration-200 border-b-2 ${
        isActive 
          ? 'border-orange-500 text-orange-500 bg-orange-50' 
          : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );

  const handleSessionUpdate = (field, value) => {
    const updated = { ...sessionConfig, [field]: value };
    setSessionConfig(updated);
    configManager.updateSessionInfo(updated);
  };

  const handleAddJury = () => {
    if (newJuryForm.name && newJuryForm.designation) {
      const juryData = {
        ...newJuryForm,
        expertise: newJuryForm.expertise.split(',').map(e => e.trim()).filter(e => e)
      };
      
      const newJury = configManager.addJuryMember(juryData);
      setJuryMembers([...juryMembers, newJury]);
      setNewJuryForm({
        name: '',
        designation: '',
        department: '',
        email: '',
        phone: '',
        expertise: ''
      });
      setShowAddForm(null);
      alert('Jury member added successfully!');
    }
  };

  const handleAddTeam = () => {
    if (newTeamForm.name && newTeamForm.members && newTeamForm.projectTitle) {
      const teamData = {
        ...newTeamForm,
        members: newTeamForm.members.split(',').map(m => m.trim()).filter(m => m)
      };
      
      const newTeam = configManager.addTeam(teamData);
      setTeams([...teams, newTeam]);
      setNewTeamForm({
        name: '',
        members: '',
        projectTitle: '',
        category: ''
      });
      setShowAddForm(null);
      alert('Team added successfully!');
    }
  };

  const handleAddCriteria = () => {
    if (newCriteriaForm.name && newCriteriaForm.maxMarks > 0) {
      const maxId = Math.max(...evaluationCriteria.map(c => c.id), 0);
      const newCriteria = {
        id: maxId + 1,
        ...newCriteriaForm,
        maxMarks: parseInt(newCriteriaForm.maxMarks),
        weight: parseInt(newCriteriaForm.weight),
        isActive: true
      };
      
      hackathonConfig.evaluationCriteria.push(newCriteria);
      setEvaluationCriteria([...evaluationCriteria, newCriteria]);
      setNewCriteriaForm({
        name: '',
        maxMarks: 0,
        description: '',
        weight: 0
      });
      setShowAddForm(null);
      alert('Evaluation criteria added successfully!');
    }
  };

  const toggleJuryStatus = (juryId) => {
    const jury = juryMembers.find(j => j.id === juryId);
    if (jury) {
      configManager.updateJuryMember(juryId, { isActive: !jury.isActive });
      setJuryMembers(juryMembers.map(j => 
        j.id === juryId ? { ...j, isActive: !j.isActive } : j
      ));
    }
  };

  const deleteJury = (juryId) => {
    const jury = juryMembers.find(j => j.id === juryId);
    if (jury && window.confirm(`Are you sure you want to permanently delete ${jury.name}? This action cannot be undone and will remove all their evaluation data.`)) {
      if (configManager.deleteJuryMember(juryId)) {
        // Clean up evaluation data
        cleanupJuryEvaluationData(juryId);
        setJuryMembers(juryMembers.filter(j => j.id !== juryId));
        alert('Jury member deleted successfully!');
      } else {
        alert('Error deleting jury member.');
      }
    }
  };

  const toggleTeamStatus = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      configManager.updateTeam(teamId, { isActive: !team.isActive });
      setTeams(teams.map(t => 
        t.id === teamId ? { ...t, isActive: !t.isActive } : t
      ));
    }
  };

  const toggleCriteriaStatus = (criteriaId) => {
    const criteria = evaluationCriteria.find(c => c.id === criteriaId);
    if (criteria) {
      configManager.updateEvaluationCriteria(criteriaId, { isActive: !criteria.isActive });
      setEvaluationCriteria(evaluationCriteria.map(c => 
        c.id === criteriaId ? { ...c, isActive: !c.isActive } : c
      ));
    }
  };

  const deleteTeam = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (team && window.confirm(`Are you sure you want to permanently delete ${team.name}? This action cannot be undone and will remove all their evaluation data.`)) {
      if (configManager.deleteTeam(teamId)) {
        // Clean up evaluation data
        cleanupTeamEvaluationData(teamId);
        setTeams(teams.filter(t => t.id !== teamId));
        alert('Team deleted successfully!');
      } else {
        alert('Error deleting team.');
      }
    }
  };

  const deleteCriteria = (criteriaId) => {
    const criteria = evaluationCriteria.find(c => c.id === criteriaId);
    if (criteria && window.confirm(`Are you sure you want to permanently delete "${criteria.name}" criteria? This action cannot be undone and will remove all related scoring data.`)) {
      if (configManager.deleteEvaluationCriteria(criteriaId)) {
        // Clean up evaluation data
        cleanupCriteriaEvaluationData(criteria.name);
        setEvaluationCriteria(evaluationCriteria.filter(c => c.id !== criteriaId));
        alert('Evaluation criteria deleted successfully!');
      } else {
        alert('Error deleting evaluation criteria.');
      }
    }
  };

  const downloadConfig = () => {
    const config = configManager.exportConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hackathon-config-${config.session.year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          if (configManager.importConfig(config)) {
            // Refresh all states
            setSessionConfig(hackathonConfig.session);
            setJuryMembers(hackathonConfig.juryMembers);
            setTeams(hackathonConfig.teams);
            setEvaluationCriteria(hackathonConfig.evaluationCriteria);
            alert('Configuration imported successfully!');
          } else {
            alert('Invalid configuration file format.');
          }
        } catch (error) {
          alert('Error reading configuration file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">⚙️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-wide mb-1">SYSTEM CONFIGURATION</h1>
                  <p className="text-sm text-gray-300 font-medium">Manage Hackathon Setup for {sessionConfig.year}</p>
                  <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">Admin Panel</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  to="/admin" 
                  className="text-orange-400 hover:text-white flex items-center font-medium tracking-wide text-sm transition-colors duration-200 px-4 py-2 rounded-lg border border-orange-400/30 hover:border-white/30"
                >
                  ← BACK TO ADMIN
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          
          {/* Configuration Backup/Restore */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              💾 Configuration Backup & Restore
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={downloadConfig}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 font-bold tracking-wide text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                📥 DOWNLOAD CONFIG
              </button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={uploadConfig}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 font-bold tracking-wide text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  📤 UPLOAD CONFIG
                </button>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              Backup your configuration before making changes. Upload a previous config to restore settings.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-t-xl shadow-lg border-b border-gray-200 mb-0">
            <div className="flex space-x-0 overflow-x-auto">
              <TabButton id="session" label="🏛️ SESSION INFO" isActive={activeTab === 'session'} onClick={setActiveTab} />
              <TabButton id="jury" label="👥 JURY MEMBERS" isActive={activeTab === 'jury'} onClick={setActiveTab} />
              <TabButton id="teams" label="🚀 TEAMS" isActive={activeTab === 'teams'} onClick={setActiveTab} />
              <TabButton id="criteria" label="📊 EVALUATION CRITERIA" isActive={activeTab === 'criteria'} onClick={setActiveTab} />
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-xl shadow-2xl p-8 min-h-96">
            
            {/* Session Info Tab */}
            {activeTab === 'session' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">🏛️ SESSION CONFIGURATION</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hackathon Year</label>
                    <input
                      type="text"
                      value={sessionConfig.year}
                      onChange={(e) => handleSessionUpdate('year', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={sessionConfig.title}
                      onChange={(e) => handleSessionUpdate('title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={sessionConfig.subtitle}
                      onChange={(e) => handleSessionUpdate('subtitle', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Organization</label>
                    <input
                      type="text"
                      value={sessionConfig.organization}
                      onChange={(e) => handleSessionUpdate('organization', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Organization Short Name</label>
                    <input
                      type="text"
                      value={sessionConfig.organizationShort}
                      onChange={(e) => handleSessionUpdate('organizationShort', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Logo Path</label>
                    <input
                      type="text"
                      value={sessionConfig.logoPath}
                      onChange={(e) => handleSessionUpdate('logoPath', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                      placeholder="/path/to/logo.png"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Jury Members Tab */}
            {activeTab === 'jury' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">👥 JURY MEMBERS</h2>
                    <p className="text-slate-600">Manage evaluation panel for hackathon {sessionConfig.year}</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(showAddForm === 'jury' ? null : 'jury')}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 font-bold tracking-wide text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ➕ ADD JURY MEMBER
                  </button>
                </div>

                {/* Add Jury Form */}
                {showAddForm === 'jury' && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
                    <h3 className="text-lg font-bold text-green-800 mb-4">Add New Jury Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newJuryForm.name}
                        onChange={(e) => setNewJuryForm({...newJuryForm, name: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="text"
                        placeholder="Designation"
                        value={newJuryForm.designation}
                        onChange={(e) => setNewJuryForm({...newJuryForm, designation: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="text"
                        placeholder="Department"
                        value={newJuryForm.department}
                        onChange={(e) => setNewJuryForm({...newJuryForm, department: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newJuryForm.email}
                        onChange={(e) => setNewJuryForm({...newJuryForm, email: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={newJuryForm.phone}
                        onChange={(e) => setNewJuryForm({...newJuryForm, phone: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      <input
                        type="text"
                        placeholder="Expertise (comma separated)"
                        value={newJuryForm.expertise}
                        onChange={(e) => setNewJuryForm({...newJuryForm, expertise: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={handleAddJury}
                        className="bg-green-600 text-white px-6 py-2 font-bold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ✅ ADD JURY
                      </button>
                      <button
                        onClick={() => setShowAddForm(null)}
                        className="bg-gray-500 text-white px-6 py-2 font-bold rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        ❌ CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {/* Jury List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {juryMembers.map(jury => (
                    <div key={jury.id} className={`rounded-xl p-6 border shadow-lg transition-all duration-300 ${
                      jury.isActive 
                        ? 'bg-white border-gray-200 hover:shadow-xl' 
                        : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {jury.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleJuryStatus(jury.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              jury.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {jury.isActive ? '✅ ACTIVE' : '❌ INACTIVE'}
                          </button>
                          <button
                            onClick={() => deleteJury(jury.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors duration-200"
                            title={`Delete ${jury.name}`}
                          >
                            🗑️ DELETE
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{jury.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{jury.designation}</p>
                      <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-3">{jury.department}</p>
                      
                      {jury.expertise && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 mb-1">Expertise:</p>
                          <div className="flex flex-wrap gap-1">
                            {jury.expertise.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        <p>📧 {jury.email}</p>
                        <p>📱 {jury.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">🚀 PARTICIPATING TEAMS</h2>
                    <p className="text-slate-600">Manage teams for hackathon {sessionConfig.year}</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(showAddForm === 'team' ? null : 'team')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 font-bold tracking-wide text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ➕ ADD TEAM
                  </button>
                </div>

                {/* Add Team Form */}
                {showAddForm === 'team' && (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">Add New Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Team Name"
                        value={newTeamForm.name}
                        onChange={(e) => setNewTeamForm({...newTeamForm, name: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={newTeamForm.category}
                        onChange={(e) => setNewTeamForm({...newTeamForm, category: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Members (comma separated)"
                        value={newTeamForm.members}
                        onChange={(e) => setNewTeamForm({...newTeamForm, members: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={newTeamForm.projectTitle}
                        onChange={(e) => setNewTeamForm({...newTeamForm, projectTitle: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={handleAddTeam}
                        className="bg-blue-600 text-white px-6 py-2 font-bold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ✅ ADD TEAM
                      </button>
                      <button
                        onClick={() => setShowAddForm(null)}
                        className="bg-gray-500 text-white px-6 py-2 font-bold rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        ❌ CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {/* Teams List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teams.map(team => (
                    <div key={team.id} className={`rounded-xl p-6 border shadow-lg transition-all duration-300 ${
                      team.isActive 
                        ? 'bg-white border-gray-200 hover:shadow-xl' 
                        : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{team.id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleTeamStatus(team.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              team.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {team.isActive ? '✅ ACTIVE' : '❌ INACTIVE'}
                          </button>
                          <button
                            onClick={() => deleteTeam(team.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors duration-200"
                            title={`Delete ${team.name}`}
                          >
                            🗑️ DELETE
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{team.name}</h3>
                      <p className="text-sm text-slate-600 mb-2 font-medium">{team.projectTitle}</p>
                      {team.category && (
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-3">{team.category}</p>
                      )}
                      
                      <div className="mb-3">
                        <p className="text-xs text-slate-500 mb-1">Team Members:</p>
                        <div className="text-xs text-slate-700">
                          {team.members.map((member, index) => (
                            <span key={index} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-100 rounded">
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluation Criteria Tab */}
            {activeTab === 'criteria' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">📊 EVALUATION CRITERIA</h2>
                    <p className="text-slate-600">Define scoring parameters for hackathon {sessionConfig.year}</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(showAddForm === 'criteria' ? null : 'criteria')}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 font-bold tracking-wide text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ➕ ADD CRITERIA
                  </button>
                </div>

                {/* Add Criteria Form */}
                {showAddForm === 'criteria' && (
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 mb-6">
                    <h3 className="text-lg font-bold text-purple-800 mb-4">Add New Evaluation Criteria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Criteria Name"
                        value={newCriteriaForm.name}
                        onChange={(e) => setNewCriteriaForm({...newCriteriaForm, name: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="number"
                        placeholder="Maximum Marks"
                        value={newCriteriaForm.maxMarks}
                        onChange={(e) => setNewCriteriaForm({...newCriteriaForm, maxMarks: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newCriteriaForm.description}
                        onChange={(e) => setNewCriteriaForm({...newCriteriaForm, description: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="number"
                        placeholder="Weight %"
                        value={newCriteriaForm.weight}
                        onChange={(e) => setNewCriteriaForm({...newCriteriaForm, weight: e.target.value})}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={handleAddCriteria}
                        className="bg-purple-600 text-white px-6 py-2 font-bold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        ✅ ADD CRITERIA
                      </button>
                      <button
                        onClick={() => setShowAddForm(null)}
                        className="bg-gray-500 text-white px-6 py-2 font-bold rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        ❌ CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {/* Criteria List */}
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-lg p-4 mb-4">
                    <p className="text-lg font-bold text-slate-800">
                      Total Maximum Marks: <span className="text-orange-600">{configManager.getTotalMaxMarks()}</span>
                    </p>
                  </div>
                  
                  {evaluationCriteria.map(criteria => (
                    <div key={criteria.id} className={`rounded-xl p-6 border shadow-lg transition-all duration-300 ${
                      criteria.isActive 
                        ? 'bg-white border-gray-200 hover:shadow-xl' 
                        : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-slate-800">{criteria.name}</h3>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-bold">
                            MAX: {criteria.maxMarks}
                          </span>
                          <button
                            onClick={() => toggleCriteriaStatus(criteria.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              criteria.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {criteria.isActive ? '✅ ACTIVE' : '❌ INACTIVE'}
                          </button>
                          <button
                            onClick={() => deleteCriteria(criteria.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors duration-200"
                            title={`Delete ${criteria.name} criteria`}
                          >
                            🗑️ DELETE
                          </button>
                        </div>
                      </div>
                      
                      {criteria.description && (
                        <p className="text-slate-600 mb-2">{criteria.description}</p>
                      )}
                      
                      <div className="text-sm text-slate-500">
                        Weight: {criteria.weight}% | Max Marks: {criteria.maxMarks}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ConfigPage;