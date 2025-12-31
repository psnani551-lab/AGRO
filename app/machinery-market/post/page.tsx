'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiUploadCloud, FiCheck, FiX, FiLock } from 'react-icons/fi';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function PostListing() {
    const { t } = useI18n();
    const [form, setForm] = useState({
        title: '',
        type: 'rent',
        rentPrice: '',
        salePrice: '',
        description: '',
        location: '',
        contactName: '',
        contactPhone: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            // Optional: Redirect or just show state
        }
    }, [user, authLoading]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Guest Mode: Allow posting without login
        // if (!user) { ... } // Removed


        setLoading(true);

        try {
            let finalImageUrl = 'https://images.unsplash.com/photo-1595123550441-d377e017de6a?q=80&w=2699&auto=format&fit=crop';

            // Upload Image if selected
            if (imageFile) {
                try {
                    finalImageUrl = await db.uploadImage(imageFile, 'machinery-images');
                } catch (uploadError) {
                    console.error('Upload error (using fallback):', uploadError);
                }
            }

            // Using Supabase directly for listings as db.ts didn't wrapper this specific table generic insert yet? 
            // Actually supabase client is exported from db.ts or client.ts.
            // Let's use the one from client.ts via normal import? NO I removed it.
            // But db.ts exports 'db'. Does it export supabase? No.
            // I should modify db.ts to export saveListing OR import supabase again.
            // Importing supabase from client is fine.
            // Let's use direct supabase call here for simplicity as creating a specific db method for everything is verbose.
            // Wait, I removed the import. I should verify if I can import supabase from db?
            const { error } = await supabase
                .from('machinery_listings')
                .insert([
                    {
                        owner_id: user?.id || '00000000-0000-0000-0000-000000000000', // GUEST ID
                        title: form.title,
                        type: form.type,
                        rent_price_daily: form.rentPrice ? parseFloat(form.rentPrice) : null,
                        sale_price: form.salePrice ? parseFloat(form.salePrice) : null,
                        description: form.description,
                        location: form.location,
                        location_lat: 0, // Placeholder
                        location_lng: 0, // Placeholder
                        contact_name: form.contactName,
                        contact_phone: form.contactPhone,
                        images: [finalImageUrl],
                        status: 'active'
                    }
                ]);

            if (error) throw error;
            setSuccess(true);

        } catch (err: any) {
            console.error('Error posting listing detailed:', err);
            alert(`Failed to post: ${err.message || err.details || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('market.successTitle')}</h2>
                    <p className="text-gray-500 mb-6">{t('market.successMessage')}</p>
                    <button onClick={() => {
                        setSuccess(false);
                        setForm({ title: '', type: 'rent', rentPrice: '', salePrice: '', description: '', location: '', contactName: '', contactPhone: '' });
                        removeImage();
                    }} className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        {t('market.postAnother')}
                    </button>
                    <button onClick={() => window.location.href = '/machinery-market'} className="mt-4 text-primary-600 font-semibold hover:underline">
                        {t('market.goToMarket')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h1 className="text-2xl font-bold font-display text-gray-900 mb-6">{t('market.formTitle')}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('market.iWantTo')}</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['rent', 'sale', 'both'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setForm({ ...form, type })}
                                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all capitalize ${form.type === type
                                        ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                                        : 'border-gray-200 text-gray-600 hover:border-primary-200'
                                        }`}
                                >
                                    {type === 'rent' ? t('market.rent') : type === 'sale' ? t('market.sale') : t('market.postSellRent')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('market.equipmentName')}</label>
                            <input
                                type="text"
                                required
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder={t('market.equipmentNamePlaceholder')}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('market.yourName')}</label>
                                <input
                                    type="text"
                                    required
                                    value={form.contactName}
                                    onChange={e => setForm({ ...form, contactName: e.target.value })}
                                    placeholder={t('market.namePlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('market.phoneNumber')}</label>
                                <input
                                    type="tel"
                                    required
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit mobile number"
                                    value={form.contactPhone}
                                    onChange={e => setForm({ ...form, contactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    placeholder={t('market.phonePlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('market.description')}</label>
                        <textarea
                            required
                            rows={3}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder={t('market.descriptionPlaceholder')}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(form.type === 'rent' || form.type === 'both') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('market.dailyRent')}</label>
                                <input
                                    type="number"
                                    required
                                    value={form.rentPrice}
                                    onChange={e => setForm({ ...form, rentPrice: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        )}
                        {(form.type === 'sale' || form.type === 'both') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('market.salePrice')}</label>
                                <input
                                    type="number"
                                    required
                                    value={form.salePrice}
                                    onChange={e => setForm({ ...form, salePrice: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('market.location')}</label>
                        <input
                            type="text"
                            required
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            placeholder="Village, City"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('market.photos')}</label>

                        {!previewUrl ? (
                            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer bg-gray-50/50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <FiUploadCloud className="mx-auto text-3xl text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">{t('market.clickToUpload')}</p>
                                <p className="text-xs text-gray-400 mt-1">{t('market.uploadFormat')}</p>
                            </div>
                        ) : (
                            <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="bg-white/90 p-3 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
                    >
                        {loading ? t('market.posting') : t('market.postListing')}
                    </button>

                </form>
            </div>
        </div>
    );
}
