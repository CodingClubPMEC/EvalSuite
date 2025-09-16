function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-8 border-t-4 border-orange-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <span className="text-orange-400 text-lg">★</span>
            <div className="w-8 h-1 bg-gradient-to-r from-orange-600 to-orange-500"></div>
          </div>
          
          <p className="text-sm font-bold tracking-wider text-white">
            © 2025 SIH HACKATHON - PMEC | EVALUATION SYSTEM
          </p>
          
          <p className="text-xs text-gray-300 font-medium">
            Parala Maharaja Engineering College
          </p>
          
          <p className="text-xs text-orange-400 font-semibold">
            SMART INDIA HACKATHON 2025
          </p>
          
          <div className="pt-2 border-t border-white/10 mt-4">
            <p className="text-xs text-gray-300">
              💻 Developed by <span className="text-orange-400 font-semibold">Coding, Design and Development Club</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Crafted with precision for competitive evaluation
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;