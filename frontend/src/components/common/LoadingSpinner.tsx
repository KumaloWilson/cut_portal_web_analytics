import type React from "react"

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-700">Loading...</span>
        </div>
    )
}

export default LoadingSpinner

