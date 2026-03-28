import { useState, useEffect } from 'react';
import { X, MessageSquare, List, Send, Loader2 } from 'lucide-react';
import api from '../utils/api';

const AIChatModal = ({ isOpen, onClose, documentId, title }) => {
    const [activeTab, setActiveTab] = useState('summary');
    
    // Summary State
    const [summary, setSummary] = useState([]);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    // Chat State
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your AI study assistant. Ask me anything about this document!" }
    ]);
    const [input, setInput] = useState('');
    const [isPondering, setIsPondering] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'summary' && summary.length === 0 && !summaryError) {
            fetchSummary();
        }
    }, [isOpen, activeTab]);

    const fetchSummary = async () => {
        setIsLoadingSummary(true);
        setSummaryError('');
        try {
            const { data } = await api.post(`/ai/summarize/${documentId}`);
            setSummary(data.summary || []);
        } catch (error) {
            console.error("Failed to fetch AI summary", error);
            setSummaryError(error.response?.data?.message || 'Failed to generate summary.');
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsPondering(true);

        try {
            const { data } = await api.post(`/ai/ask/${documentId}`, { question: userMsg });
            setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "❌ " + (error.response?.data?.message || 'Sorry, I encountered an error answering that.') }]);
        } finally {
            setIsPondering(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
            <div className="modal-content" style={{ maxWidth: '650px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '80vh', backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                
                {/* Header */}
                <div className="flex justify-between items-center shrink-0" style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--primary)', margin: 0 }}>
                            ✨ AI Study Assistant
                        </h2>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.25rem 0 0 0' }}>Doc: {title}</p>
                    </div>
                    <button onClick={onClose} className="btn-close-red"><X size={20} /></button>
                </div>

                {/* Tabs */}
                <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    <button 
                        className="flex-1 flex justify-center items-center gap-2 py-3 text-sm font-semibold transition-colors"
                        style={{ 
                            color: activeTab === 'summary' ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === 'summary' ? '2px solid var(--primary)' : '2px solid transparent',
                            backgroundColor: activeTab === 'summary' ? 'var(--background)' : 'transparent',
                            borderTop: 'none', borderLeft: 'none', borderRight: 'none'
                        }}
                        onClick={() => setActiveTab('summary')}
                    >
                        <List size={16} /> Key Concepts
                    </button>
                    <button 
                        className="flex-1 flex justify-center items-center gap-2 py-3 text-sm font-semibold transition-colors"
                        style={{ 
                            color: activeTab === 'chat' ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === 'chat' ? '2px solid var(--primary)' : '2px solid transparent',
                            backgroundColor: activeTab === 'chat' ? 'var(--background)' : 'transparent',
                            borderTop: 'none', borderLeft: 'none', borderRight: 'none'
                        }}
                        onClick={() => setActiveTab('chat')}
                    >
                        <MessageSquare size={16} /> Q&A Chat
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto" style={{ padding: '1.25rem', backgroundColor: 'var(--background)' }}>
                    
                    {/* Summary View */}
                    {activeTab === 'summary' && (
                        <div className="h-full">
                            {isLoadingSummary ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
                                    <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} size={32} />
                                    <p className="text-sm" style={{ margin: 0 }}>Reading document and generating summary...</p>
                                </div>
                            ) : summaryError ? (
                                <div className="rounded-lg text-sm text-center" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    {summaryError}
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-3">
                                    {summary.map((point, i) => (
                                        <li key={i} className="flex gap-3 text-sm shadow-sm" style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                                            <span className="font-bold flex-shrink-0" style={{ color: 'var(--primary)', marginTop: '0.125rem' }}>•</span>
                                            <span className="leading-relaxed">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Chat View */}
                    {activeTab === 'chat' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2" style={{ paddingBottom: '1rem' }}>
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div 
                                            className="max-w-[85%] text-sm" 
                                            style={{ 
                                                padding: '0.75rem 1rem',
                                                borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                                                backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                                color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                                                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isPondering && (
                                    <div className="flex justify-start">
                                        <div className="text-sm flex items-center gap-2" style={{ padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0.25rem', backgroundColor: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                            <Loader2 size={14} className="animate-spin" /> AI is thinking...
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="mt-auto shrink-0 flex gap-2" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <input 
                                    type="text" 
                                    className="input-field m-0 flex-1" 
                                    style={{ borderRadius: '99px', paddingLeft: '1.25rem', paddingRight: '1rem', height: '46px' }}
                                    placeholder="Ask a question about this material..." 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isPondering}
                                />
                                <button 
                                    type="submit" 
                                    disabled={isPondering || !input.trim()}
                                    className="btn-primary rounded-full flex shrink-0 items-center justify-center border-none"
                                    style={{ opacity: (isPondering || !input.trim()) ? 0.5 : 1, width: '46px', height: '46px', padding: 0 }}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIChatModal;
