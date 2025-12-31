'use client';
import { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';

export default function NegotiationChat({ listingId }: { listingId: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [senderRole, setSenderRole] = useState<'buyer' | 'owner'>('buyer');

    // Load initial messages and subscribe
    useEffect(() => {
        if (!listingId) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('listing_id', listingId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        const channel = supabase
            .channel('realtime:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `listing_id=eq.${listingId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [listingId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const send = async () => {
        if (!input.trim() || !listingId) return;

        const text = input;
        setInput(''); // Optimistic clear

        await supabase.from('messages').insert([{
            listing_id: listingId,
            content: text,
            sender_type: senderRole
        }]);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 h-96 flex flex-col">
            <h3 className="font-bold border-b pb-2 mb-2 flex items-center justify-between text-gray-900">
                <span>Live Chat</span>
                {/* Role Switcher for Demo Purposes */}
                <button
                    onClick={() => setSenderRole(senderRole === 'buyer' ? 'owner' : 'buyer')}
                    className="text-xs px-2 py-1 rounded bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-600"
                >
                    Posting as: <span className="font-bold uppercase text-primary-600">{senderRole}</span>
                </button>
            </h3>

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-2">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">No messages yet. Start the conversation!</div>
                )}
                {messages.map(msg => {
                    const isMe = msg.sender_type === senderRole;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm shadow-sm ${isMe
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                                }`}>
                                <p className="text-xs opacity-75 mb-0.5 uppercase tracking-wide">{msg.sender_type}</p>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 flex gap-2 border-t pt-3">
                <input
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-gray-500"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder={`Message as ${senderRole}...`}
                />
                <button
                    onClick={send}
                    className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                >
                    <FiSend size={18} />
                </button>
            </div>
        </div>
    );
}
