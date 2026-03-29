import { useState, useEffect } from 'react';
import { X, MessageSquare, List, Send, Loader2 } from 'lucide-react';
import api from '../utils/api';

const renderFormattedText = (text) => {
    if (!text) return null;
    const paragraphs = text.split(/\n+/).filter(p => p.trim());
    return paragraphs.map((para, pIdx) => {
        const parts = para.split(/\*\*/);
        return (
            <div key={pIdx} style={{ marginBottom: pIdx === paragraphs.length - 1 ? 0 : '0.6rem', lineHeight: '1.5' }}>
                {parts.map((str, i) => {
                    if (i % 2 === 1) {
                        return <strong key={i} style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>{str}</strong>;
                    }
                    return <span key={i}>{str}</span>;
                })}
            </div>
        );
    });
};

const AIChatModal = ({ isOpen, onClose, documentId, title, onGoToDiscussion }) => {
    const [activeTab, setActiveTab] = useState('summary');
    
    // Summary State
    const [summary, setSummary] = useState(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    // Chat State
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your AI study assistant. Ask me anything about this document!" }
    ]);
    const [input, setInput] = useState('');
    const [isPondering, setIsPondering] = useState(false);

    // Reset state when modal opens or document changes
    useEffect(() => {
        if (isOpen) {
            setSummary(null);
            setSummaryError('');
            setIsLoadingSummary(false);
            setMessages([
                { role: 'assistant', text: "Hello! I'm your AI study assistant. Ask me anything about this document!" }
            ]);
        }
    }, [isOpen, documentId]);

    useEffect(() => {
        // Only fetch if open, on summary tab, and NO summary is loaded yet
        if (isOpen && activeTab === 'summary' && !summary && !summaryError && !isLoadingSummary) {
            fetchSummary();
        }
    }, [isOpen, activeTab, summary, summaryError, documentId]);

    const fetchSummary = async () => {
        setIsLoadingSummary(true);
        setSummaryError('');
        try {
            const { data } = await api.post(`/ai/summarize/${documentId}`);
            setSummary(data.summary || null);
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
        <div className="modal-overlay" style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content" style={{ width: '95vw', maxWidth: '1400px', margin: 'auto', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '95vh', maxHeight: '95vh', backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                
                {/* Header */}
                <div className="flex justify-between items-center shrink-0" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--primary)', margin: 0 }}>
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
                <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '2rem', backgroundColor: 'var(--background)', minHeight: 0 }}>
                    
                    {/* Summary View */}
                    {activeTab === 'summary' && (
                        <div>
                            {isLoadingSummary ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
                                    <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} size={32} />
                                    <p className="text-sm" style={{ margin: 0 }}>Reading document and generating summary...</p>
                                </div>
                            ) : summaryError ? (
                                <div className="rounded-lg text-sm text-center" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    {summaryError}
                                </div>
                            ) : !summary ? (
                                <div className="text-sm text-center" style={{ color: 'var(--text-muted)', paddingTop: '2rem' }}>No summary could be generated.</div>
                            ) : Array.isArray(summary) ? (
                                <ul className="flex flex-col gap-3">
                                    {summary.map((point, i) => (
                                        <li key={i} className="flex gap-3 text-sm shadow-sm" style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                                            <span className="font-bold flex-shrink-0" style={{ color: 'var(--primary)', marginTop: '0.125rem' }}>•</span>
                                            <span className="leading-relaxed">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col gap-6 pb-4">
                                    <div style={{ padding: '1.25rem', borderRadius: '0.75rem', backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                        <h3 className="text-md font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                                            📘 Topic
                                        </h3>
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{summary.topic || "Unknown Topic"}</p>
                                    </div>

                                    {summary.keyConcepts?.length > 0 && (
                                        <div>
                                            <h3 className="text-md font-bold mb-3 flex items-center gap-2" style={{ color: '#0ea5e9' }}>
                                                🎯 Key Concepts
                                            </h3>
                                            <ul className="flex flex-col gap-2">
                                                {summary.keyConcepts.map((point, i) => (
                                                    <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--text-main)' }}>
                                                        <span style={{ color: '#0ea5e9' }}>•</span>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {summary.simpleExplanation && (
                                        <div style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                                            <h3 className="text-md font-bold mb-2 flex items-center gap-2" style={{ color: '#8b5cf6' }}>
                                                💡 Simple Explanation
                                            </h3>
                                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>{summary.simpleExplanation}</p>
                                        </div>
                                    )}

                                    {summary.importantPoints?.length > 0 && (
                                        <div>
                                            <h3 className="text-md font-bold mb-3 flex items-center gap-2" style={{ color: '#ef4444' }}>
                                                ⚠️ Important Points
                                            </h3>
                                            <ul className="flex flex-col gap-2">
                                                {summary.importantPoints.map((point, i) => (
                                                    <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--text-main)' }}>
                                                        <span style={{ color: '#ef4444' }}>•</span>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {summary.example && (
                                        <div style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                            <h3 className="text-md font-bold mb-2 flex items-center gap-2" style={{ color: '#22c55e' }}>
                                                🔍 Example
                                            </h3>
                                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>{summary.example}</p>
                                        </div>
                                    )}

                                    {summary.flashcards?.length > 0 && (
                                        <div>
                                            <h3 className="text-md font-bold mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                                                🗂️ Revision Flashcards
                                            </h3>
                                            <div className="flex flex-col gap-3">
                                                {summary.flashcards.map((card, i) => (
                                                    <div key={i} style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                                                        <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Q: {card.question || card.Q}</p>
                                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>A: {card.answer || card.A}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {summary.difficultyLevel && (
                                        <div className="flex items-center gap-2 text-sm mt-2">
                                            <span className="font-bold" style={{ color: 'var(--text-muted)' }}>Difficulty Level:</span>
                                            <span 
                                                style={{ 
                                                    padding: '0.25rem 0.5rem', 
                                                    borderRadius: '0.25rem', 
                                                    backgroundColor: summary.difficultyLevel?.toLowerCase() === 'hard' ? 'rgba(239, 68, 68, 0.1)' : summary.difficultyLevel?.toLowerCase() === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                    color: summary.difficultyLevel?.toLowerCase() === 'hard' ? '#ef4444' : summary.difficultyLevel?.toLowerCase() === 'medium' ? '#eab308' : '#22c55e',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {summary.difficultyLevel}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Go to Discussion Shortcut */}
                            {!isLoadingSummary && summary && !summaryError && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <button className="btn-primary w-full justify-center" onClick={onGoToDiscussion} style={{ padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold' }}>
                                        💬 Go to Discussion Page
                                    </button>
                                </div>
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
                                            {renderFormattedText(msg.text)}
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
