'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load History
  useEffect(() => {
    if (user && isOpen && messages.length === 0) {
      db.getChatHistory(user.id).then(data => {
        if (data && data.length > 0) {
          const formatted: Message[] = data.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at)
          }));
          // Only set if we haven't started chatting yet to avoid overwrite? 
          // Or just replacing initial state.
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

    // Save User Msg
    if (user) {
      db.saveChatMessage(user.id, { role: 'user', content: input }).catch(console.error);
    }

    try {
      // Get Farm Profile from storage
      let farmProfile = null;
      try {
        const storedProfile = localStorage.getItem('farmProfile');
        if (storedProfile) {
          farmProfile = JSON.parse(storedProfile);
        }
      } catch (e) {
        console.error('Error reading farm profile', e);
      }

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          pageContext: window.location.pathname,
          locale,
          location,
          farmProfile, // Sending the profile
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

      // Save Assistant Msg
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
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
            className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <FiMessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
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
              className="fixed bottom-6 right-6 z-40 flex h-[600px] w-[400px] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 rounded-t-lg">
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

              {/* Messages */}
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

              {/* Input */}
              <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 rounded-b-lg">
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
                <div className="flex gap-2 relative items-end">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t('chat.placeholder')}
                      aria-label="Chat message input"
                      className={`w-full rounded-xl border ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                        } px-4 py-3 text-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-200' : 'focus:ring-primary-100'
                        } dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all shadow-sm`}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    aria-label={t('chat.send')}
                    className="rounded-xl bg-primary-600 p-3 text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center"
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
