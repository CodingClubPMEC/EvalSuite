import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JuryCard from '../components/JuryCard';
import { juryProfiles } from '../data/juryData';

function Homepage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            SIH Internal Hackathon
          </h1>
          <p className="text-xl mb-8">
            Jury Marking System - PMEC
          </p>
          <p className="text-lg max-w-2xl mx-auto">
            Welcome to the evaluation platform for Smart India Hackathon 2025. 
            Select your profile below to begin the marking process.
          </p>
        </div>
      </div>

      {/* Jury Profiles Section */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Select Your Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {juryProfiles.map((jury) => (
              <JuryCard key={jury.id} jury={jury} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Homepage;