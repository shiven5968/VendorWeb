import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MessMates Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white mb-2">Something went wrong</h1>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            An unexpected error occurred while rendering the interface. Click below to reload the application.
          </p>
          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/25"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Portal</span>
          </button>
          {this.state.error && (
            <details className="mt-6 text-left max-w-lg w-full bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs text-rose-300 font-mono overflow-auto">
              <summary className="cursor-pointer font-bold text-slate-400 mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
