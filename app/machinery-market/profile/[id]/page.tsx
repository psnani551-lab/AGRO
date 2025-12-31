export default function FarmerProfile({ params }: { params: { id: string } }) {
    // In real app, fetch profile by ID and their listings
    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-4">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Ramesh Kumar</h1>
                        <p className="text-gray-500">Guntur, Andhra Pradesh</p>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                            <div className="text-center">
                                <span className="block font-bold text-lg">12</span>
                                <span className="text-xs text-gray-500">Rentals</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg">4.8</span>
                                <span className="text-xs text-gray-500">Rating</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium">Call</button>
                        <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Message</button>
                    </div>
                </div>

                {/* Listings */}
                <h2 className="text-xl font-bold text-gray-900">Active Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">Mahindra Arjun 605</h3>
                            <p className="text-sm text-gray-500">Tractor</p>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">For Rent</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">Plough attachment</h3>
                            <p className="text-sm text-gray-500">Implement</p>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">For Sale</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
