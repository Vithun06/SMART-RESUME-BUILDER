import React from "react";
import "../components/ErrorBoundary.css";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "ErrorBoundary caught an error:",
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <div className="error-boundary-card">

            <div className="error-boundary-icon">
              ⚠️
            </div>

            <span className="error-boundary-badge">
              Something went wrong
            </span>

            <h1>
              We hit an unexpected error
            </h1>

            <p>
              Something went wrong while loading
              Smart Resume Builder. Don't worry,
              your saved data is safe.
            </p>

            <div className="error-boundary-actions">

              <button
                className="error-retry-btn"
                onClick={this.handleRetry}
              >
                ↻ Try Again
              </button>

              <button
                className="error-reload-btn"
                onClick={this.handleReload}
              >
                ⟳ Reload Page
              </button>

              <button
                className="error-home-btn"
                onClick={this.handleGoHome}
              >
                ← Go Home
              </button>

            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>
                  Technical details
                </summary>

                <pre>
                  {this.state.error.toString()}
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