import { supabase } from './supabaseClient';

export const db = {
    // Profiles
    getProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    updateProfile: async (userId: string, updates: any) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Farm Profiles
    getFarmProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('farm_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore 'not found' error
        return data || null;
    },

    saveFarmProfile: async (userId: string, profile: any) => {
        try {
            // Check if exists
            const existing = await db.getFarmProfile(userId);

            if (existing) {
                const { data, error } = await supabase
                    .from('farm_profiles')
                    .update({ ...profile, updated_at: new Date() })
                    .eq('user_id', userId)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase
                    .from('farm_profiles')
                    .insert([{ ...profile, user_id: userId }])
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }
        } catch (error: any) {
            console.warn("DB save failed, falling back to localStorage for guest:", error.message);
            localStorage.setItem('farmProfile', JSON.stringify(profile));
            return profile;
        }
    },

    // Alerts
    getAlerts: async (userId: string) => {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    saveAlert: async (userId: string, alert: any) => {
        const { data, error } = await supabase
            .from('alerts')
            .insert([{ ...alert, user_id: userId }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    markAlertRead: async (alertId: string) => {
        const { error } = await supabase
            .from('alerts')
            .update({ is_read: true })
            .eq('id', alertId);
        if (error) throw error;
    },

    // Sustainability
    getSustainabilityMetrics: async (userId: string) => {
        const { data, error } = await supabase
            .from('sustainability_metrics')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    },

    saveSustainabilityMetrics: async (userId: string, metrics: any) => {
        // Upsert logic
        const { data, error } = await supabase
            .from('sustainability_metrics')
            .upsert({ ...metrics, user_id: userId, updated_at: new Date() })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Storage (Images)
    uploadImage: async (file: File, bucket: string = 'machinery-images') => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // Chat History
    getChatHistory: async (userId: string, limit: number = 50) => {
        try {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data ? data.reverse() : [];
        } catch (error: any) {
            console.warn("DB chat fetch failed, falling back to localStorage:", error.message);
            const localHistory = localStorage.getItem(`chat_history_${userId}`);
            return localHistory ? JSON.parse(localHistory) : [];
        }
    },

    saveChatMessage: async (userId: string, message: { role: 'user' | 'assistant', content: string }) => {
        try {
            const { data, error } = await supabase
                .from('chat_history')
                .insert([{
                    user_id: userId,
                    role: message.role,
                    content: message.content,
                    created_at: new Date()
                }])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error: any) {
            console.warn("DB chat save failed, falling back to localStorage:", error.message);
            const localHistory = JSON.parse(localStorage.getItem(`chat_history_${userId}`) || '[]');
            const newMessage = { ...message, id: Date.now().toString(), created_at: new Date().toISOString() };
            localStorage.setItem(`chat_history_${userId}`, JSON.stringify([...localHistory, newMessage]));
            return newMessage;
        }
    }
};
