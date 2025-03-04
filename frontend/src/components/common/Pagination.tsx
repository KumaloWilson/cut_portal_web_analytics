import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    limit: number
    onLimitChange: (limit: number) => void
    totalItems: number
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    limit,
    onLimitChange,
    totalItems,
}) => {
    // Generate page numbers to display
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = []

        if (totalPages <= 7) {
            // If 7 or fewer pages, show all
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            // Show dots if current page is more than 3
            if (currentPage > 3) {
                pages.push("...")
            }

            // Show current page and surrounding pages
            const startPage = Math.max(2, currentPage - 1)
            const endPage = Math.min(totalPages - 1, currentPage + 1)

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }

            // Show dots if current page is less than totalPages - 2
            if (currentPage < totalPages - 2) {
                pages.push("...")
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    // Calculate range of items being displayed
    const startItem = (currentPage - 1) * limit + 1
    const endItem = Math.min(currentPage * limit, totalItems)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0 text-sm text-gray-500">
                Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{totalItems}</span> results
            </div>

            <div className="flex items-center">
                {/* Items per page selector */}
                <div className="mr-4">
                    <label htmlFor="limit" className="sr-only">
                        Items per page
                    </label>
                    <select
                        id="limit"
                        className="border border-gray-300 rounded-md text-sm py-1 px-2"
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                    >
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>

                {/* Pagination controls */}
                <nav className="flex items-center">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-1 rounded-md ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"
                            }`}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex mx-2">
                        {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                                {typeof page === "number" ? (
                                    <button
                                        onClick={() => onPageChange(page)}
                                        className={`px-3 py-1 mx-1 rounded-md ${currentPage === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span className="px-3 py-1 mx-1 text-gray-500">...</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-1 rounded-md ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"
                            }`}
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </nav>
            </div>
        </div>
    )
}

export default Pagination

