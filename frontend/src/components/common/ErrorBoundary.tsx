import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Sprout } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FloraAI Uncaught UI Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-botanical-bg dark:bg-botanical-darkBg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-8 text-center shadow-card space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-leaf-300 flex items-center justify-center mx-auto text-3xl">
              🌿
            </div>
            <h2 className="text-xl font-extrabold text-forest-950 dark:text-leaf-100">
              Botanical Sanctuary Restored
            </h2>
            <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted leading-relaxed">
              FloraAI protected your botanical session. Click below to continue tending to your plants.
            </p>
            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Garden</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
