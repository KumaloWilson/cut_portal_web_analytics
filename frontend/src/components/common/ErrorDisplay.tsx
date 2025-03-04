import type React from "react"
import { AlertTriangle } from "lucide-react"

interface ErrorDisplayProps {
    error: Error
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
    return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>{error.message || "An unexpected error occurred. Please try again later."}</p>
                    </div>
                    <div className="mt-4">
                        <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ErrorDisplay

