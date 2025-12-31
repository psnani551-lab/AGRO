'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import EquipmentCard, { Listing } from '@/components/Marketplace/EquipmentCard';
import Filters from '@/components/Marketplace/Filters';
import ListingSkeleton from '@/components/Marketplace/ListingSkeleton';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18n';

export default function Marketplace() {
    const { t } = useI18n();
    const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale' | 'both'>('all');
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const { data, error } = await supabase
                .from('machinery_listings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching listings:', error);
                // Fallback to empty or handled in UI
            } else if (data) {
                // Map Supabase snake_case to our CamelCase Listing interface if needed
                // Assuming schema matches or we map it here. 
                // For now, let's map manual fields to ensure safety
                const mapped: Listing[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    type: item.type, // 'rent', 'sale', 'both'
                    rentPrice: item.rent_price_daily,
                    salePrice: item.sale_price,
                    location: item.location,
                    ownerName: item.contact_name || 'Agro Member',
                    imageUrl: (item.images && item.images.length > 0) ? item.images[0] : 'https://images.unsplash.com/photo-1595123550441-d377e017de6a',
                    description: item.description
                }));

                // If no real data, we might want to keep dummy data for demo until they connect DB
                // BUT user asked for "Real Live Data" code. 
                setListings(mapped.length > 0 ? mapped : []);
            }
        } catch (e) {
            console.error('Supabase connection error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = listings.filter(l => {
        const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.location.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filterType === 'all') return true;
        if (filterType === 'rent') return l.type === 'rent' || l.type === 'both';
        if (filterType === 'sale') return l.type === 'sale' || l.type === 'both';
        return l.type === 'both';
    });

    const containerVar = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVar = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-12 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-400/20 blur-[100px] rounded-full pointer-events-none"></div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4 relative z-10"
                    >
                        {t('market.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        {t('market.subtitle')}
                    </motion.p>
                </div>

                {/* Controls Bar */}
                <div className="sticky top-24 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={t('market.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <Filters filterType={filterType} setFilterType={setFilterType} />

                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block"></div>

                        <Link href="/machinery-market/post" className="flex items-center space-x-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 whitespace-nowrap">
                            <FiPlus className="text-xl" />
                            <span>{t('market.postListing')}</span>
                        </Link>
                    </div>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <ListingSkeleton key={n} />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVar}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filtered.length > 0 ? (
                                filtered.map(listing => (
                                    <motion.div key={listing.id} variants={itemVar}>
                                        <EquipmentCard listing={listing} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                                        <FiFilter className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('market.noListings')}</h3>
                                    <p className="text-gray-500 dark:text-gray-400">{t('market.adjustFilters')}</p>
                                    <button
                                        onClick={() => { setFilterType('all'); setSearchQuery(''); }}
                                        className="mt-4 text-primary-600 font-semibold hover:underline"
                                    >
                                        {t('market.clearFilters')}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
