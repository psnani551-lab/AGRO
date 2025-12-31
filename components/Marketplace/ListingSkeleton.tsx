'use client';

export default function ListingSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col animate-pulse">
            {/* Image Skeleton */}
            <div className="relative h-48 bg-gray-200">
                <div className="absolute top-4 right-4 w-20 h-6 bg-gray-300 rounded-full"></div>
            </div>

            {/* Content Skeleton */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>

                {/* Location */}
                <div className="flex items-center mt-1 mb-4">
                    <div className="w-4 h-4 bg-gray-200 rounded-full mr-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>

                {/* Price */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
}
