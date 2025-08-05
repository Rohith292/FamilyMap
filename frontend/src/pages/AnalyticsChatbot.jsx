// frontend/src/pages/AnalyticsChatbot.jsx

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MdSend } from 'react-icons/md'; // You might need to install 'react-icons'
import axiosInstance from '../lib/axios'; // Assuming you have an Axios-based api service

const AnalyticsChatbot = () => {
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am your family tree assistant. Ask me questions about your family, like "who is the partner of Rohtih?".' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Note: The actual API call logic is a placeholder and should be implemented in your backend
            const { data } = await axiosInstance.post('/analytics/chat', { query: input });
            const botResponse = { sender: 'bot', text: data.response };
            setMessages(prevMessages => [...prevMessages, botResponse]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const botError = { sender: 'bot', text: 'An error occurred. Please try again later.' };
            setMessages(prevMessages => [...prevMessages, botError]);
            toast.error('Failed to get a response from the chatbot.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Replaced bg-gray-800 with theme-aware bg-base-200
        <div className="flex flex-col h-full bg-base-200 rounded-lg shadow-lg overflow-hidden">
            {/* Replaced bg-gray-900, text-white, and border-gray-700 with theme-aware classes */}
            <header className="p-4 bg-base-300 text-base-content border-b border-base-300">
                <h2 className="text-xl font-bold">Family Tree Chatbot</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`p-3 rounded-lg max-w-xs sm:max-w-md ${
                                // Replaced hardcoded bot background and text with theme-aware classes
                                msg.sender === 'user' ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        {/* Replaced hardcoded background with theme-aware bg-base-300 */}
                        <div className="p-3 bg-base-300 rounded-lg max-w-xs sm:max-w-md">
                            <span className="loading loading-dots loading-sm"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {/* Replaced bg-gray-900 and border-gray-700 with theme-aware classes */}
            <form onSubmit={handleSendMessage} className="p-4 bg-base-300 border-t border-base-300 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    // Replaced hardcoded input background, text, and placeholder with theme-aware classes
                    className="flex-1 input input-bordered bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none"
                    placeholder="Ask a question..."
                    disabled={isLoading}
                />
                <button type="submit" className="btn btn-primary text-primary-content" disabled={isLoading}>
                    <MdSend className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};

export default AnalyticsChatbot;
