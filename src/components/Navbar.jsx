function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">
            SIH Jury Marking System
          </div>
          <div className="text-sm">
            PMEC Internal Hackathon
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;