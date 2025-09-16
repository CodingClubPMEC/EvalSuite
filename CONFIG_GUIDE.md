# SIH Jury Marking Website - Configuration Guide

## Overview

The SIH Jury Marking Website now features a comprehensive configuration system that allows you to easily customize the application for different hackathon years and events without modifying code.

## Accessing Configuration

1. **Admin Dashboard**: Navigate to `/admin` from the homepage
2. **System Configuration**: Click the "⚙️ SYSTEM CONFIG" button in the admin dashboard
3. **Direct Access**: Visit `/config` directly

## Configuration Sections

### 🏛️ Session Information
Configure basic hackathon details:
- **Year**: Current hackathon year (e.g., "2025")
- **Title**: Main title (e.g., "INTERNAL HACKATHON")
- **Subtitle**: Secondary title (e.g., "for Smart India Hackathon")
- **Organization**: Full organization name
- **Organization Short**: Abbreviated name (e.g., "PMEC")
- **Logo Path**: Path to organization logo image

### 👥 Jury Members
Manage evaluation panel:
- **Add New Jury**: Use the "➕ ADD JURY MEMBER" button
- **Required Fields**: Name, Designation
- **Optional Fields**: Department, Email, Phone, Expertise
- **Status Control**: Toggle Active/Inactive status
- **Delete Jury**: Use the "🗑️ DELETE" button (permanent removal)
- **Expertise Tags**: Comma-separated list of skills

### 🚀 Teams
Manage participating teams:
- **Add New Team**: Use the "➕ ADD TEAM" button
- **Required Fields**: Team Name, Members, Project Title
- **Optional Fields**: Category
- **Members**: Comma-separated list of team member names
- **Status Control**: Toggle Active/Inactive status
- **Delete Team**: Use the "🗑️ DELETE" button (permanent removal)

### 📄 Evaluation Criteria
Define scoring parameters:
- **Add New Criteria**: Use the "➕ ADD CRITERIA" button
- **Required Fields**: Criteria Name, Maximum Marks
- **Optional Fields**: Description, Weight percentage
- **Status Control**: Toggle Active/Inactive status
- **Delete Criteria**: Use the "🗑️ DELETE" button (permanent removal)
- **Total Marks**: Automatically calculated

## Configuration Backup & Restore

### Backup Configuration
1. Click "📥 DOWNLOAD CONFIG" button
2. Save the JSON file with current date
3. Store securely for future reference

### Restore Configuration
1. Click "📤 UPLOAD CONFIG" button
2. Select previously saved JSON file
3. Configuration will be imported automatically

## Year-to-Year Setup Process

### For New Hackathon Year:

1. **Backup Current Config**
   - Download current configuration as backup
   - Archive evaluation data if needed

2. **Update Session Info**
   - Change year to new hackathon year
   - Update title/subtitle if changed
   - Update organization details if needed

3. **Review Jury Panel**
   - Add new jury members if any
   - Remove/deactivate unavailable members
   - Update contact information

4. **Reset Teams**
   - Remove previous year teams (set to inactive)
   - Add new participating teams
   - Verify project titles and member lists

5. **Review Evaluation Criteria**
   - Update criteria if evaluation process changed
   - Adjust maximum marks if needed
   - Ensure total marks align with requirements

## Data Persistence

### Automatic Updates
- Configuration changes are applied immediately
- Existing evaluation data is preserved when possible
- Storage structure updates automatically for config changes

### Safe Modifications
- Only active items appear in evaluation interface
- Inactive items are hidden but data preserved
- Configuration changes don't affect submitted evaluations

### Deletion vs Deactivation
- **Deactivation**: Hides items from interface but preserves all data (recommended)
- **Deletion**: Permanently removes items and all related evaluation data (irreversible)
- **Best Practice**: Use deactivation instead of deletion unless absolutely necessary

## Best Practices

### Before Each Hackathon
1. Download backup of previous configuration
2. Test configuration changes in admin panel
3. Verify jury panel has access to their evaluation pages
4. Confirm team list is complete and accurate
5. Test evaluation criteria totals

### During Hackathon
1. Avoid major configuration changes
2. Only add teams/jury if absolutely necessary
3. Monitor system through admin dashboard
4. Keep configuration backup handy

### After Hackathon
1. Download final consolidated marksheet
2. Export individual jury marksheets
3. Backup complete configuration with evaluation data
4. Archive for future reference

## Troubleshooting

### Common Issues

**Jury member not appearing in list**
- Check if jury member is set to "Active"
- Verify they have required name and designation

**Team missing from evaluation**
- Ensure team status is "Active"
- Check that team has all required fields

**Evaluation criteria problems**
- Verify criteria are set to "Active"
- Check maximum marks are greater than 0
- Confirm total marks align with expectations

**Configuration import fails**
- Verify JSON file format is correct
- Check file wasn't corrupted during transfer
- Ensure file contains all required sections

### Getting Help

For technical issues:
- Check browser console for error messages
- Try refreshing the page
- Clear browser cache if problems persist
- Contact system administrator with error details

## Security Notes

- Configuration changes require admin access
- Regular backups prevent data loss
- Sensitive information (emails, phones) stored locally
- Configuration files contain non-sensitive setup data

## File Locations

- **Main Config**: `/src/config/hackathonConfig.js`
- **Data Storage**: Browser localStorage
- **Backup Files**: User downloads folder (JSON format)

---

*This system is designed to be user-friendly and requires no coding knowledge. All changes are made through the web interface.*