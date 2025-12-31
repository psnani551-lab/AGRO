'use client';
import { FiFilter } from 'react-icons/fi';
import { useI18n } from '@/lib/i18n';

interface FiltersProps {
    filterType: 'all' | 'rent' | 'sale' | 'both';
    setFilterType: (type: 'all' | 'rent' | 'sale' | 'both') => void;
}

export default function Filters({ filterType, setFilterType }: FiltersProps) {
    const { t } = useI18n();

    return (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['all', 'rent', 'sale'] as const).map((type) => (
                <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${filterType === type
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {type === 'all' ? t('market.all') : type === 'rent' ? t('market.rent') : t('market.sale')}
                </button>
            ))}
        </div>
    );
}
