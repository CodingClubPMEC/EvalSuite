# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A React-based jury marking system for Smart India Hackathon (SIH) internal hackathon at PMEC. The application allows jury members to evaluate teams across multiple criteria and export results to Excel.

## Development Commands

### Essential Commands
```powershell
# Install dependencies
npm install

# Start development server (runs on localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Testing & Development
- No test suite is currently configured
- Development server supports hot reloading via Vite
- ESLint is configured with React-specific rules

## Architecture Overview

### Application Structure
This is a single-page application (SPA) built with React Router for navigation between two main views:
- **Homepage** (`/`): Displays jury profile cards for selection
- **Marking Page** (`/marking/:juryId`): Individual jury's evaluation interface

### Core Architecture Pattern
The app follows a **data-driven component architecture** where:
1. **Static Data Layer** (`src/data/juryData.js`): Contains all jury profiles, teams, and evaluation criteria
2. **Component Layer**: Reusable UI components with props-based data flow
3. **Page Layer**: Route-level components that orchestrate multiple components
4. **Utility Layer**: Pure functions for Excel export and data manipulation

### State Management Strategy
- **Local Component State**: Each page manages its own state (no global state management)
- **Lifting State Up**: The `MarkingPage` manages scoring state and passes down to `MarksheetTable`
- **Controlled Components**: All form inputs are controlled components with validation

### Data Flow Architecture
1. Static data is imported from `juryData.js`
2. `MarksheetTable` manages scoring state locally
3. Score changes bubble up to `MarkingPage` via callback props
4. Excel export consumes the current scoring state

## Key Components

### MarksheetTable Component
- Manages scoring matrix for all teams vs. evaluation criteria
- Implements automatic score validation (max marks enforcement)
- Real-time total calculation
- Communicates state changes to parent via `onScoreChange` callback

### Excel Export System
- Located in `src/utils/excelExport.js`
- Uses `xlsx` library for client-side Excel generation
- Generates timestamped filenames with jury information
- Formats data with proper column widths and headers

## Technology Stack

- **Build Tool**: Vite (fast development with HMR)
- **Framework**: React 19 with functional components and hooks
- **Routing**: React Router DOM for SPA navigation
- **Styling**: Tailwind CSS with responsive design utilities
- **Excel Generation**: xlsx library for client-side file creation
- **Linting**: ESLint with React-specific rules

## Configuration Files

### Vite Configuration (`vite.config.js`)
- Standard React plugin setup
- Default development server on port 5173

### Tailwind Configuration (`tailwind.config.js`)
- Configured to scan all React component files
- No custom theme extensions

### ESLint Configuration (`eslint.config.js`)
- Extended configuration with React Hooks and Refresh plugins
- Custom rule for unused variables with pattern exceptions

## Data Customization

To customize the application data, modify `src/data/juryData.js`:
- **juryProfiles**: Array of jury members with photos and credentials
- **teams**: Array of participating teams with member details
- **evaluationCriteria**: Array of scoring criteria with maximum marks

The total possible score is automatically calculated as the sum of all criteria maximum marks.

## State Management Patterns

### Scoring State Pattern
```jsx
// Initialize empty scores object
const [scores, setScores] = useState({});

// Structure: scores[teamId][criteriaName] = value
// Example: scores[1]["Innovation"] = 20
```

### Score Validation Pattern
```jsx
const finalValue = Math.min(numValue, criteria.maxMarks);
const positiveValue = Math.max(0, finalValue);
```

## Routing Pattern

The app uses dynamic routing for jury-specific marking pages:
- Route: `/marking/:juryId`
- Jury validation occurs in component with fallback to 404-style error
- Navigation preserves jury context throughout marking session

## Development Guidelines

### Component Structure
- All components are functional with hooks
- Props are destructured in function parameters
- Components are in `src/components/` directory
- Pages are in `src/pages/` directory

### Styling Approach
- Utility-first CSS with Tailwind classes
- Responsive design with mobile-first approach
- Consistent color scheme: blue for primary, green for success actions
- Hover states and loading indicators for better UX

### File Organization
```
src/
├── components/     # Reusable UI components
├── pages/         # Route-level components
├── data/          # Static data and configuration
├── utils/         # Pure utility functions
├── App.jsx        # Router configuration
└── main.jsx       # Application entry point
```