'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiMic, FiSquare } from 'react-icons/fi';
import FocusLock from 'react-focus-lock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useI18n } from '@/lib/i18n';
import { LocationCoordinates } from '@/lib/geo';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  locale: string;
  location?: LocationCoordinates;
}

export default function ChatWidget({ locale: propLocale, location }: ChatWidgetProps) {
  const { t, language } = useI18n();
  const locale = propLocale || language;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, guestId } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load History
  useEffect(() => {
    const activeUserId = user?.id || guestId;
    if (activeUserId && isOpen && messages.length === 0) {
      db.getChatHistory(activeUserId).then(data => {
        if (data && data.length > 0) {
          const formatted: Message[] = data.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at)
          }));
          setMessages(formatted);
        }
      });
    }
  }, [user, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleStartRecording = async () => {
    try {
      // 1. Strict Security Check: HTML5 Microphones REQUIRE HTTPS or localhost to function
      if (typeof window !== 'undefined' && !window.isSecureContext) {
         setError('Microphone requires a secure HTTPS connection or localhost. (Local Network IPs block audio API).');
         return;
      }

      // 2. Browser API Check
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         setError('Your browser does not support audio recording hardware.');
         return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 3. Fallback for iOS Safari which doesn't support generic webm
      let audioType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
         if (!MediaRecorder.isTypeSupported('audio/webm')) {
            if (MediaRecorder.isTypeSupported('audio/mp4')) audioType = 'audio/mp4';
            else if (MediaRecorder.isTypeSupported('audio/ogg')) audioType = 'audio/ogg';
            else audioType = ''; // Let browser pick default
         }
      }

      // @ts-ignore
      const options = audioType ? { mimeType: audioType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const finalType = audioType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalType });
        await handleSendVoice(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone setup crashed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please click the lock icon in your URL bar and allow microphone permissions.');
      } else {
        setError(`Microphone error: ${err.message || 'Could not initialize audio device.'}`);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendVoice = async (audioBlob: Blob) => {
    setIsTyping(true);
    
    // Optimistic UI for Voice Input
    const userVoiceMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: '🎙️ *Voice message sent*',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userVoiceMessage]);

    try {
      // 1. Send Audio to Sarvam STT Backend
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');
      
      const transcribeResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) throw new Error('Failed to transcribe audio');
      
      const { transcript, language_code } = await transcribeResponse.json();

      // Update the optimistic message with the actual transcript
      setMessages((prev) => prev.map(msg => 
        msg.id === userVoiceMessage.id ? { ...msg, content: `🎙️ "${transcript}"` } : msg
      ));

      const activeUserId = user?.id || guestId;
      if (activeUserId) {
        db.saveChatMessage(activeUserId, { role: 'user', content: `🎙️ "${transcript}"` }).catch(console.error);
      }

      // 2. Ask Ceres AI with the Language Lock
      let farmProfile = null;
      try {
        const storedProfile = localStorage.getItem('farmProfile');
        if (storedProfile) farmProfile = JSON.parse(storedProfile);
      } catch (e) {}

      const askResponse = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          pageContext: window.location.pathname,
          locale: language_code || locale, // Pass detected language!
          location,
          farmProfile,
          forceLanguage: language_code, // Tell AI to lock into this language
        }),
      });

      const data = await askResponse.json();
      const replyContent = data.reply || data.error || 'Sorry, I could not process your request.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (user) {
        db.saveChatMessage(user.id, { role: 'assistant', content: replyContent }).catch(console.error);
      }

      // 3. Audio Playback via TTS
      try {
        const ttsResponse = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: replyContent,
            language_code: language_code || locale || 'hi-IN'
          })
        });

        if (ttsResponse.ok) {
           const { audioBase64 } = await ttsResponse.json();
           if (audioBase64) {
               const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
               audio.play().catch(e => {
                   console.error('Audio playback blocked by browser:', e);
                   setError('Audio generated, but browser blocked auto-play (Gesture Timeout).');
               });
           }
        } else {
           const errText = await ttsResponse.text();
           console.warn('TTS could not be rendered', errText);
           setError(`API Error: ${errText}`);
        }
      } catch (ttsErr: any) {
         console.error('Failed to trigger TTS audio route:', ttsErr);
         setError(`TTS Network Error: ${ttsErr.message}`);
      }

    } catch (err) {
      console.error(err);
      setError('Voice synthesis failed. Ensure Sarvam API is configured.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const activeUserId = user?.id || guestId;
    if (activeUserId) {
      db.saveChatMessage(activeUserId, { role: 'user', content: input }).catch(console.error);
    }

    try {
      let farmProfile = null;
      try {
        const storedProfile = localStorage.getItem('farmProfile');
        if (storedProfile) farmProfile = JSON.parse(storedProfile);
      } catch (e) {}

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          pageContext: window.location.pathname,
          locale,
          location,
          farmProfile,
        }),
      });

      const data = await response.json();
      const replyContent = data.reply || data.error || 'Sorry, I could not process your request.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (user) {
        db.saveChatMessage(user.id, { role: 'assistant', content: replyContent }).catch(console.error);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <FiMessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <FocusLock disabled={!isOpen}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-labelledby="chat-title"
              aria-describedby="chat-description"
              aria-modal="true"
              className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] sm:h-[600px] sm:w-[400px] flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 rounded-t-xl">
                <div>
                  <h2 id="chat-title" className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <span className="text-2xl">🌾</span> {t('chat.title')}
                  </h2>
                  <p id="chat-description" className="text-xs text-gray-500 dark:text-gray-400">
                    {t('chat.description')}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900/50">
                <div role="log" aria-live="polite" aria-atomic="false" className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex flex-col gap-1 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user'
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
                            }`}
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 px-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none">
                        <div className="flex space-x-1 h-5 items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 rounded-b-xl">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-2 text-xs text-red-500 text-center font-medium"
                  >
                    {error}
                  </motion.div>
                )}
                
                {isRecording && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-3 flex items-center justify-between bg-red-50/50 dark:bg-red-900/10 rounded-xl px-4 py-2 border border-red-100 dark:border-red-900/30"
                  >
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                       <span className="text-xs font-semibold text-red-600 dark:text-red-400">Listening to your voice...</span>
                    </div>
                    <div className="flex items-center gap-1">
                       {[...Array(5)].map((_, i) => (
                         <motion.div
                           key={i}
                           animate={{ height: ['8px', '16px', '8px'] }}
                           transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                           className="w-1 bg-red-400 rounded-full"
                         />
                       ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2 relative items-end">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isRecording ? "Listening..." : t('chat.placeholder')}
                      disabled={isRecording}
                      aria-label="Chat message input"
                      className={`w-full rounded-xl border ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                        } px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-200' : 'focus:ring-primary-100'
                        } dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all shadow-sm disabled:opacity-50`}
                    />
                    
                    {/* Voice Mic Button */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                       {isRecording ? (
                         <button
                           onClick={handleStopRecording}
                           className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                         >
                           <FiSquare className="w-5 h-5 fill-current" />
                         </button>
                       ) : (
                         <button
                           onClick={handleStartRecording}
                           disabled={isTyping || input.length > 0}
                           className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-0"
                         >
                           <FiMic className="w-5 h-5" />
                         </button>
                       )}
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping || isRecording}
                    aria-label={t('chat.send')}
                    className="rounded-xl bg-primary-600 p-3 text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600 focus:outline-none shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center shrink-0"
                  >
                    <FiSend className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </FocusLock>
        )}
      </AnimatePresence>
    </>
  );
}
