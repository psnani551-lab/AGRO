
export const getGuestId = async (): Promise<string> => {
    if (typeof window === 'undefined') return '00000000-0000-0000-0000-000000000000';

    let guestId = localStorage.getItem('guest_id');

    if (!guestId) {
        // Option 1: Generate stable UUID
        guestId = crypto.randomUUID();
        
        // Option 2: Enhance with IP (optional, as per user request)
        try {
            const response = await fetch('/api/auth/ip');
            const { ip } = await response.json();
            if (ip) {
                // We could use IP to fetch an existing profile if it exists,
                // but standard practice is to rely on localStorage for the 'dedicated space'
                // and just tag the data with the IP.
                console.log(`User IP detected: ${ip}`);
            }
        } catch (err) {
            console.error('Failed to detect IP:', err);
        }

        localStorage.setItem('guest_id', guestId);
    }

    return guestId;
};
