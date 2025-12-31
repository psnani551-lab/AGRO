'use client';
import { useState, useEffect } from 'react';
import { FiMapPin, FiCalendar, FiPhone, FiMessageCircle, FiCheckCircle, FiArrowLeft, FiUser } from 'react-icons/fi';
import NegotiationChat from '@/components/Marketplace/NegotiationChat';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ListingDetail({ params }: { params: { id: string } }) {
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchListing = async () => {
            if (!params.id) return;

            const { data, error } = await supabase
                .from('machinery_listings')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error('Error fetching listing:', error);
            } else {
                setListing(data);
            }
            setLoading(false);
        };

        fetchListing();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
                <p className="text-gray-500 mb-6">The machinery you are looking for might have been removed or sold.</p>
                <Link href="/machinery-market" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    // Determine prices to display
    const rentPrice = listing.rent_price_daily;
    const salePrice = listing.sale_price;
    const imageUrl = (listing.images && listing.images.length > 0) ? listing.images[0] : 'https://images.unsplash.com/photo-1595123550441-d377e017de6a?q=80&w=2699&auto=format&fit=crop';

    // Use the contact_name we added, or fall back to a generic ID if missing (legacy posts)
    const ownerName = listing.contact_name || 'Agro Member';

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-primary-600 mb-6 transition-colors">
                    <FiArrowLeft className="mr-2" /> Back to Search
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Images & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-96 relative group">
                            <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 flex gap-2">
                                {(listing.type === 'rent' || listing.type === 'both') && (
                                    <span className="bg-green-500/90 backdrop-blur-md text-white font-bold px-4 py-1.5 rounded-full shadow-lg">
                                        For Rent
                                    </span>
                                )}
                                {(listing.type === 'sale' || listing.type === 'both') && (
                                    <span className="bg-rose-500/90 backdrop-blur-md text-white font-bold px-4 py-1.5 rounded-full shadow-lg">
                                        For Sale
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{listing.title}</h1>
                                    <div className="flex items-center text-gray-500">
                                        <FiMapPin className="mr-2 text-primary-500" /> {listing.location}
                                    </div>
                                </div>
                                <div className="text-left md:text-right mt-4 md:mt-0">
                                    {rentPrice && (
                                        <p className="text-3xl font-bold text-gray-900">₹{rentPrice}<span className="text-sm text-gray-500 font-normal">/day</span></p>
                                    )}
                                    {salePrice && (
                                        <p className="text-2xl font-bold text-rose-600">₹{salePrice} <span className="text-sm font-normal text-gray-500">(Sale Price)</span></p>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-green max-w-none mb-8">
                                <h3 className="font-bold text-lg text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
                            </div>

                            {/* Additional specs could go here if we had columns for them */}
                        </div>
                    </div>

                    {/* Right Col: Contact & Action */}
                    <div className="space-y-6">
                        {/* Owner Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center space-x-4 mb-6 border-b border-gray-100 pb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-green-100 rounded-full flex items-center justify-center text-primary-600 shadow-inner">
                                    <FiUser size={30} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{ownerName}</h3>
                                    <div className="flex items-center text-green-600 text-sm font-medium mt-1">
                                        <FiCheckCircle className="mr-1.5" /> Verified Owner
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <a
                                    href={listing.contact_phone ? `tel:${listing.contact_phone}` : '#'}
                                    onClick={(e) => !listing.contact_phone && alert('No phone number available for this listing.')}
                                    className="flex items-center justify-center py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                                >
                                    <FiPhone className="mr-2" /> Call
                                </a>
                                <a
                                    href={listing.contact_phone ? `https://wa.me/91${listing.contact_phone}` : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => !listing.contact_phone && alert('No phone number available.')}
                                    className="flex items-center justify-center py-3.5 bg-gray-50 text-green-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                >
                                    <span className="mr-2">WhatsApp</span>
                                </a>
                            </div>

                            {/* Chat Removed as per request */}
                            {/* <button
                                onClick={() => setShowChat(!showChat)}
                                className="w-full flex items-center justify-center py-3.5 border-2 border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors"
                            >
                                <FiMessageCircle className="mr-2" /> {showChat ? 'Hide Chat' : 'Chat with Owner'}
                            </button>

                            {showChat && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <NegotiationChat listingId={listing.id || params.id} />
                                </div>
                            )} */}
                        </div>

                        {/* Safety  */}
                        <div className="bg-primary-50/50 rounded-2xl p-6 border border-primary-100">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">Safety Tips</h3>
                            <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                                <li>Inspect machinery in person before payment.</li>
                                <li>Avoid cash transactions for large amounts.</li>
                                <li>Verify ownership documents.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
