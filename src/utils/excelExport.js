// Lazy import ExcelJS and file-saver to reduce initial bundle size
const importExcelJS = () => import('exceljs');
const importFileSaver = () => import('file-saver');

import { configManager } from '../config/hackathonConfig';

export const exportToExcel = async (data, identifier) => {
  console.log('📊 Starting Excel export...');
  console.log('📄 Data received:', data);
  console.log('🏷️ Identifier:', identifier);
  
  // Check if we're in a secure context (required for some download methods)
  if (typeof window !== 'undefined') {
    console.log('🔒 Secure context:', window.isSecureContext);
    console.log('🌐 Location protocol:', window.location.protocol);
  }
  
  try {
    // Dynamically import ExcelJS and FileSaver only when needed
    console.log('📦 Loading ExcelJS and FileSaver libraries...');
    
    // Import modules with better error handling
    const ExcelJSModule = await importExcelJS();
    const FileSaverModule = await importFileSaver();
    
    console.log('🔍 Raw ExcelJS Module:', ExcelJSModule);
    console.log('🔍 ExcelJS Module keys:', Object.keys(ExcelJSModule));
    
    // Try comprehensive ExcelJS resolution strategies
    let ExcelJS = null;
    
    // Strategy 1: Check for default export
    if (ExcelJSModule.default) {
      ExcelJS = ExcelJSModule.default;
      console.log('✅ Using ExcelJS.default');
    }
    // Strategy 2: Check if module itself has Workbook
    else if (ExcelJSModule.Workbook) {
      ExcelJS = ExcelJSModule;
      console.log('✅ Using ExcelJS module directly');
    }
    // Strategy 3: Check for named exports
    else if (ExcelJSModule.Workbook || ExcelJSModule.WorkBook) {
      ExcelJS = ExcelJSModule;
      console.log('✅ Using ExcelJS named exports');
    }
    // Strategy 4: Check if ExcelJS is a constructor function
    else if (typeof ExcelJSModule === 'function') {
      ExcelJS = { Workbook: ExcelJSModule };
      console.log('✅ Using ExcelJS as constructor function');
    }
    // Strategy 5: Try to construct from available exports
    else {
      console.log('🔍 Available exports:', Object.keys(ExcelJSModule));
      ExcelJS = ExcelJSModule;
    }
    
    console.log('🔧 Final ExcelJS object:', ExcelJS);
    console.log('📊 ExcelJS.Workbook:', ExcelJS?.Workbook);
    console.log('📊 ExcelJS.WorkBook:', ExcelJS?.WorkBook);
    
    // Get FileSaver
    const { saveAs } = FileSaverModule.default || FileSaverModule;
    console.log('💾 saveAs function:', typeof saveAs);
    
    // Validate ExcelJS is properly loaded - try both Workbook and WorkBook (different casing)
    if (!ExcelJS) {
      throw new Error('ExcelJS module not loaded - module is null/undefined');
    }
    
    const WorkbookClass = ExcelJS.Workbook || ExcelJS.WorkBook;
    if (!WorkbookClass) {
      console.error('❌ Available ExcelJS properties:', Object.keys(ExcelJS));
      throw new Error('ExcelJS.Workbook class not found. Available properties: ' + Object.keys(ExcelJS).join(', '));
    }
    
    console.log('✅ ExcelJS validation successful, Workbook class found');

    // Get dynamic data from configManager
    const juryProfiles = configManager.getActiveJuryMembers();
    console.log('👥 Active jury profiles:', juryProfiles.length);

    let workbook, filename;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

    if (data.consolidated) {
      // Handle consolidated marksheet export
      workbook = await createConsolidatedWorkbook(data, ExcelJS);
      filename = `SIH_Consolidated_Marksheet_${timestamp}.xlsx`;
    } else {
      // Handle individual jury export (legacy support)
      workbook = await createIndividualWorkbook(data, identifier, ExcelJS);
      const jury = juryProfiles.find(j => j.id === parseInt(identifier));
      const juryName = jury ? jury.name : `Jury_${identifier}`;
      filename = `SIH_Marksheet_${juryName.replace(/\\s+/g, '_')}_${timestamp}.xlsx`;
    }

    console.log('💾 Generated filename:', filename);
    // Save the file
    console.log('💽 Writing workbook to buffer...');
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    console.log('💾 Saving file...');
    console.log('📊 Blob details:', {
      size: blob.size,
      type: blob.type,
      filename: filename
    });
    
    // Try multiple download approaches for better browser compatibility
    try {
      // Method 1: Use file-saver
      saveAs(blob, filename);
      console.log('✅ FileSaver download initiated');
      
      // Show user notification
      if (typeof window !== 'undefined' && window.alert) {
        // Small delay to let the download start
        setTimeout(() => {
          alert(`✅ Download completed successfully!\n\nFile: ${filename}\n\nThe file has been saved to your Downloads folder.`);
        }, 800);
      }
    } catch (fileSaverError) {
      console.warn('⚠️ FileSaver failed, trying manual download:', fileSaverError);
      
      // Method 2: Manual download using URL.createObjectURL
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        console.log('✅ Manual download initiated');
      } catch (manualError) {
        console.error('❌ Manual download failed:', manualError);
        throw manualError;
      }
    }
    
    console.log('✅ Excel export completed successfully!');
  } catch (error) {
    console.error('❌ Excel export failed:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

// Create consolidated marksheet workbook
const createConsolidatedWorkbook = async (data, ExcelJS) => {
  console.log('📊 Creating consolidated workbook with ExcelJS');
  
  const WorkbookClass = ExcelJS.Workbook || ExcelJS.WorkBook;
  const workbook = new WorkbookClass();
  
  // Get dynamic data from configManager
  const evaluationCriteria = configManager.getActiveEvaluationCriteria();
  
  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['INTERNAL HACKATHON - CONSOLIDATED MARKSHEET']);
  summarySheet.addRow(['Parala Maharaja Engineering College']);
  summarySheet.addRow(['Generated:', new Date(data.generatedAt).toLocaleString()]);
  summarySheet.addRow([]);
  summarySheet.addRow(['TEAM RANKINGS (by Average Score)']);
  summarySheet.addRow(['Rank', 'Team Name', 'Project Title', 'Average Score', 'Total Evaluators']);

  data.teams.forEach((team, index) => {
    summarySheet.addRow([
      index + 1,
      team.name,
      team.projectTitle,
      parseFloat(team.averageScore),
      team.submittedJuries
    ]);
  });
  // Style summary sheet
  summarySheet.getRow(1).font = { bold: true, size: 14 };
  summarySheet.getRow(5).font = { bold: true };
  summarySheet.getRow(6).font = { bold: true };
  // Set column widths
  summarySheet.columns = [
    { width: 8 }, { width: 15 }, { width: 35 }, { width: 15 }, { width: 15 }
  ];

  // Detailed Sheet with all jury scores
  const detailedSheet = workbook.addWorksheet('Detailed Scores');
  
  const detailedHeaders = [
    'Rank', 'Team Name', 'Project Title', 'Members'
  ];
  
  // Add criteria average columns
  evaluationCriteria.forEach(criteria => {
    detailedHeaders.push(`${criteria.name} (Avg)`);
  });
  
  // Add individual jury columns
  data.juries.forEach(jury => {
    evaluationCriteria.forEach(criteria => {
      detailedHeaders.push(`${jury.name} - ${criteria.name}`);
    });
    detailedHeaders.push(`${jury.name} - Total`);
  });
  
  detailedHeaders.push('Overall Average', 'Total Evaluators');
  
  detailedSheet.addRow(detailedHeaders);
  
  // Add team data
  data.teams.forEach((team, index) => {
    const row = [
      index + 1,
      team.name,
      team.projectTitle,
      team.members.join(', ')
    ];
    
    // Add criteria averages
    evaluationCriteria.forEach(criteria => {
      row.push(parseFloat(team.scores[criteria.name]?.average || 0));
    });
    
    // Add individual jury scores
    data.juries.forEach(jury => {
      const juryScore = team.juryScores[jury.id];
      if (juryScore) {
        evaluationCriteria.forEach(criteria => {
          row.push(juryScore.scores[criteria.name] || 0);
        });
        row.push(juryScore.total);
      } else {
        // Jury didn't evaluate this team
        evaluationCriteria.forEach(() => row.push('N/A'));
        row.push('N/A');
      }
    });
    
    row.push(parseFloat(team.averageScore), team.submittedJuries);
    detailedSheet.addRow(row);
  });
  
  // Style detailed sheet
  detailedSheet.getRow(1).font = { bold: true };
  
  // Set column widths
  detailedSheet.columns = detailedHeaders.map(() => ({ width: 12 }));

  return workbook;
};

// Create individual jury workbook (legacy support)
const createIndividualWorkbook = async (scores, juryId, ExcelJS) => {
  console.log('📝 Creating individual workbook for jury:', juryId);
  
  // Get dynamic data from configManager
  const evaluationCriteria = configManager.getActiveEvaluationCriteria();
  const juryProfiles = configManager.getActiveJuryMembers();
  const teams = configManager.getActiveTeams();
  
  const jury = juryProfiles.find(j => j.id === parseInt(juryId));
  const juryName = jury ? jury.name : `Jury ${juryId}`;
  
  console.log('👤 Jury name:', juryName);
  console.log('🎯 Teams:', teams.length);
  console.log('📊 Criteria:', evaluationCriteria.length);

  const WorkbookClass = ExcelJS.Workbook || ExcelJS.WorkBook;
  const workbook = new WorkbookClass();
  const worksheet = workbook.addWorksheet('Marksheet');
  
  // Add header row
  const totalMaxMarks = evaluationCriteria.reduce((sum, c) => sum + c.maxMarks, 0);
  const headerRow = ['Team Name', 'Project Title', 'Members', 
    ...evaluationCriteria.map(c => `${c.name} (${c.maxMarks})`), 
    `Total (${totalMaxMarks})`
  ];
  worksheet.addRow(headerRow);

  // Add team data
  teams.forEach(team => {
    const teamScores = scores[team.id] || {};
    const total = evaluationCriteria.reduce((sum, criteria) => {
      return sum + (teamScores[criteria.name] || 0);
    }, 0);

    const row = [

      team.name,
      team.projectTitle,
      team.members.join(', '),
      ...evaluationCriteria.map(criteria => teamScores[criteria.name] || 0),
      total
    ];
    worksheet.addRow(row);
  });


  // Style the worksheet
  worksheet.getRow(1).font = { bold: true };
  

  // Set column widths
  worksheet.columns = [
    { width: 15 }, { width: 30 }, { width: 40 },
    ...evaluationCriteria.map(() => ({ width: 12 })),
    { width: 10 }
  ];

  return workbook;
};
