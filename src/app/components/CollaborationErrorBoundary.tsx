// CollaborationErrorBoundary.tsx
"use client";

import { Component } from "react";
import EmptyState from "./errors/EmptyState";

interface CollaborationErrorBoundaryProps {
  children: React.ReactNode; // Define children prop
}

export class CollaborationErrorBoundary extends Component<CollaborationErrorBoundaryProps> {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Chunk loading error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="pt-28">
                    <EmptyState
                        title="Failed to Load Page"
                        subtitle="A new version may be available. Try reloading."
                        reload={true}
                    />
                </div>
            );
        }
        return this.props.children;
    }
}