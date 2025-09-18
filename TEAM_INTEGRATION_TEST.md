# Team Integration Test Guide

## ✅ Changes Made

Your SIH jury marking website now dynamically loads teams and evaluation criteria from the configuration system. Here's what has been updated:

### Updated Components:
1. **MarksheetTable.jsx** - Now uses `configManager.getActiveTeams()` and `configManager.getActiveEvaluationCriteria()`
2. **MarkingPage.jsx** - Uses dynamic jury data from `configManager.getActiveJuryMembers()`
3. **excelExport.js** - Updated to use dynamic data for exports
4. **dataStorage.js** - All functions now use configManager instead of static imports
5. **Test files** - Updated to mock configManager instead of static data

### Key Features:
- **Real-time Updates**: Teams and criteria added through ConfigPage automatically appear in evaluation matrix
- **Auto-refresh**: MarksheetTable checks for new teams/criteria every second
- **Backward Compatibility**: All existing functionality preserved
- **Dynamic Exports**: Excel exports include newly added teams and criteria

## 🧪 How to Test

### Test 1: Add a New Team
1. Go to `/config` page
2. Click "➕ ADD TEAM" 
3. Fill in:
   - Team Name: "Team Zeta"
   - Members: "Alice Johnson, Bob Smith, Carol Davis"
   - Project Title: "AI-Powered Education Platform"
   - Category: "Education"
4. Click "✅ ADD TEAM"
5. Navigate to any jury's marking page (`/marking/1`)
6. **Expected Result**: New team "Team Zeta" should appear in the evaluation table

### Test 2: Add New Evaluation Criteria
1. Go to `/config` page
2. Switch to "📄 EVALUATION CRITERIA" tab
3. Click "➕ ADD CRITERIA"
4. Fill in:
   - Criteria Name: "Scalability"
   - Maximum Marks: 15
   - Description: "Ability to scale the solution"
   - Weight: 15
5. Click "✅ ADD CRITERIA"
6. Navigate to any jury's marking page
7. **Expected Result**: New "Scalability" column should appear in the evaluation table

### Test 3: Deactivate a Team
1. Go to `/config` page
2. Find any team and click "❌ INACTIVE" button
3. Navigate to marking page
4. **Expected Result**: Deactivated team should not appear in evaluation table

### Test 4: Excel Export with New Data
1. Add a new team and criteria (if not done already)
2. Go to marking page and enter some scores for the new team
3. Save the evaluation
4. Go to `/admin` page
5. Download consolidated marksheet
6. **Expected Result**: Excel file should include new team and criteria

## 🔧 Technical Details

### Dynamic Data Loading
```javascript
// Before (static)
import { teams, evaluationCriteria } from '../data/juryData';

// After (dynamic)
const teams = configManager.getActiveTeams();
const evaluationCriteria = configManager.getActiveEvaluationCriteria();
```

### Auto-refresh Mechanism
The MarksheetTable component now includes:
```javascript
useEffect(() => {
  const loadData = () => {
    setTeams(configManager.getActiveTeams());
    setEvaluationCriteria(configManager.getActiveEvaluationCriteria());
  };
  
  loadData();
  // Refresh every second to catch configuration changes
  const interval = setInterval(loadData, 1000);
  return () => clearInterval(interval);
}, []);
```

## 🎯 Expected Behavior

1. **Immediate Reflection**: Teams added through ConfigPage appear in evaluation matrix within 1 second
2. **Active Only**: Only teams with `isActive: true` appear in evaluations
3. **Preserved Scores**: Existing evaluation scores are maintained when new teams/criteria are added
4. **Consistent Exports**: All exports (individual and consolidated) include the latest configuration

## 🚨 Troubleshooting

If teams don't appear:
1. Check that team status is "✅ ACTIVE"
2. Verify all required fields are filled
3. Refresh the marking page manually
4. Check browser console for errors

If exports are missing data:
1. Ensure you've saved evaluations after adding new teams
2. Check that teams have `isActive: true`
3. Verify evaluation data exists in localStorage

## ✨ Next Steps

Your system now supports:
- ✅ Dynamic team management
- ✅ Real-time evaluation matrix updates
- ✅ Consistent data across all components
- ✅ Preserved backward compatibility

Ready for production use! 🚀