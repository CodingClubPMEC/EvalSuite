import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
          <div className="bg-white rounded-xl shadow-2xl p-12 border border-gray-200 max-w-lg mx-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-2xl font-bold">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-wide">
              SYSTEM ERROR
            </h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Something went wrong with the application. Our technical team has been notified.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 font-bold tracking-wide text-sm hover:from-orange-500 hover:to-orange-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🔄 RELOAD APPLICATION
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 font-bold tracking-wide text-sm hover:from-orange-600 hover:to-orange-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🏠 RETURN HOME
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                  Technical Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;