# SIH Jury Marking Website

A modern web application for jury members to evaluate and mark teams participating in the Smart India Hackathon (SIH) internal hackathon at PMEC.

## 🚀 Features

### Homepage
- Professional navbar with hackathon branding
- Hero section with event information
- 4 jury profile cards with photos and details
- Responsive design for all devices
- Clean footer with hackathon information

### Marking Page
- Jury information display with photo and credentials
- Interactive marksheet table for all participating teams
- Real-time score calculation and validation
- Auto-calculation of total scores
- Excel export functionality for record-keeping
- Input validation (max marks enforcement)
- Responsive table design with horizontal scrolling

### Key Functionality
- **Team Management**: Display of 5 participating teams with member details
- **Evaluation Criteria**: 5 scoring categories (Innovation, Feasibility, Presentation, Impact, Technical Quality)
- **Score Validation**: Automatic enforcement of maximum marks per criteria
- **Excel Export**: One-click export to Excel with formatted data and timestamps
- **Routing**: Seamless navigation between jury profiles and marking pages

## 🛠️ Tech Stack

- **Frontend**: ReactJS with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Excel Export**: xlsx library
- **Icons**: Emoji and Unicode symbols

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (version 14 or higher)
- npm (Node Package Manager)

## 🔧 Installation & Setup

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd ~/Projects/sih-jury-marking-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation bar component
│   ├── Footer.jsx          # Footer component
│   ├── JuryCard.jsx        # Jury profile card component
│   └── MarksheetTable.jsx  # Interactive marking table
├── pages/
│   ├── Homepage.jsx        # Main landing page
│   └── MarkingPage.jsx     # Jury marking interface
├── data/
│   └── juryData.js         # Jury profiles, teams, and criteria data
├── utils/
│   └── excelExport.js      # Excel export functionality
├── App.jsx                 # Main app component with routing
└── main.jsx               # Application entry point
```

## 📊 Data Configuration

The application uses sample data defined in `src/data/juryData.js`:

- **4 Jury Members**: Professors and industry experts with photos and credentials
- **5 Participating Teams**: Teams with member names and project titles
- **5 Evaluation Criteria**: Innovation (25), Feasibility (20), Presentation (15), Impact (20), Technical Quality (20)

You can modify this data file to match your actual hackathon participants and criteria.

## 🎯 Usage Guide

### For Jury Members:

1. **Access the Homepage**: Open the website to see all jury profiles
2. **Select Your Profile**: Click on your profile card to access the marking page
3. **Enter Scores**: Fill in marks for each team according to evaluation criteria
4. **Review Totals**: Check auto-calculated totals for accuracy
5. **Save Results**: Click "Save Marksheet" to download Excel file with all scores

### Features:
- **Input Validation**: Scores cannot exceed maximum marks for each criteria
- **Real-time Calculation**: Totals update automatically as you enter scores
- **Excel Export**: Downloaded files include timestamps and jury information
- **Navigation**: Easy return to homepage or switch between jury profiles

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🔒 Excel Export Details

When you click "Save Marksheet", the system:
1. Generates an Excel file with all team scores
2. Includes jury name and timestamp in filename
3. Formats data with proper column widths
4. Shows maximum marks for each criteria
5. Calculates and displays totals
6. Downloads automatically to your device

## 🚀 Building for Production

To build the application for production:

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## 🤝 Contributing

This is an MVP (Minimum Viable Product) for the SIH Internal Hackathon at PMEC. Future enhancements could include:

- User authentication for jury members
- Database integration for persistent storage
- Real-time collaboration between jury members
- Advanced analytics and reporting
- Mobile app version
- Integration with official SIH systems

## 📝 License

This project is created for educational and hackathon purposes at PMEC.

## 📞 Support

For technical support or questions about this application, please contact the development team or hackathon organizers at PMEC.

---

**Happy Judging! 🏆**
