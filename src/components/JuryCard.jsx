import { Link } from 'react-router-dom';

function JuryCard({ jury }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img 
        src={jury.image} 
        alt={jury.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{jury.name}</h3>
        <p className="text-gray-600 mb-1">{jury.designation}</p>
        <p className="text-sm text-blue-600 mb-4">{jury.department}</p>
        <Link
          to={`/marking/${jury.id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-block text-center"
        >
          Start Marking
        </Link>
      </div>
    </div>
  );
}

export default JuryCard;