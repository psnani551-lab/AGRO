import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiUser, FiCheckCircle } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';

export interface Listing {
    id: string;
    title: string;
    type: 'rent' | 'sale' | 'both';
    rentPrice?: number;
    salePrice?: number;
    location: string;
    ownerName: string;
    imageUrl: string;
}

export default function EquipmentCard({ listing }: { listing: Listing }) {
    const { t } = useI18n();

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    {/* Rent Badge */}
                    {(listing.type === 'rent' || listing.type === 'both') && (
                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {t('market.rent')}: ₹{listing.rentPrice}{t('market.priceDaily')}
                        </span>
                    )}
                    {/* Sale Badge */}
                    {(listing.type === 'sale' || listing.type === 'both') && (
                        <span className="bg-rose-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {t('market.sale')}: ₹{listing.salePrice ? (listing.salePrice / 100000).toFixed(1) : '0'} {t('market.lakh')}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                    <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{listing.title}</h3>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <FiMapPin className="mr-1.5 text-primary-500" />
                    <span className="truncate">{listing.location}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <FiUser />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">{t('market.owner')}</span>
                            <span className="text-sm font-semibold text-gray-800 line-clamp-1">{listing.ownerName}</span>
                        </div>
                    </div>

                    <Link href={`/machinery-market/listing/${listing.id}`} className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-semibold rounded-lg hover:bg-primary-600 hover:text-white transition-all duration-200">
                        {t('market.view')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
