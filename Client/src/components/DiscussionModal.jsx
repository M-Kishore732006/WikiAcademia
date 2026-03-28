import { useState, useEffect, useContext } from 'react';
import { X, MessageCircle, Send, ArrowBigUp, ArrowBigDown, CornerDownRight, MessageSquareText, Trash2, Pin } from 'lucide-react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const getAvatarColor = (name) => {
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#f472b6'];
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[charCode % colors.length];
};

const DiscussionModal = ({ isOpen, onClose, documentId, title }) => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [expandedReplies, setExpandedReplies] = useState({});
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (isOpen) {
            fetchComments();
            setReplyingTo(null);
            setExpandedReplies({});
        }
    }, [isOpen]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/comments/${documentId}`);
            setComments(data);
            
            // Auto expand if there are very few replies overall
            const initialExpanded = {};
            data.forEach(c => {
                if (c.replies && c.replies.length > 0 && data.length <= 3) {
                    initialExpanded[c._id] = true;
                }
            });
            setExpandedReplies(initialExpanded);

        } catch (error) {
            console.error("Failed to fetch discussions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const { data } = await api.post(`/comments/${documentId}`, { content: newComment });
            setComments([{ ...data, replies: [], netScore: 0 }, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };

    const handlePostReply = async (e, parentId) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        try {
            const { data } = await api.post(`/comments/reply/${parentId}`, { content: replyContent });
            setComments(prev => prev.map(c => {
                if (c._id === parentId) {
                    return { ...c, replies: [...(c.replies || []), { ...data, netScore: 0 }] };
                }
                return c;
            }));
            
            // Auto expand the thread you replied to
            setExpandedReplies(prev => ({ ...prev, [parentId]: true }));
            
            setReplyingTo(null);
            setReplyContent('');
        } catch (error) {
            console.error("Failed to post reply", error);
        }
    };

    const handleVote = async (commentId, isReply, parentId, type) => {
        try {
            const { data } = await api.put(`/comments/vote/${commentId}`, { voteType: type });
            const updatedNetScore = data.upvotes.length - data.downvotes.length;
            setComments(prev => prev.map(c => {
                if (!isReply && c._id === commentId) {
                    return { ...c, upvotes: data.upvotes, downvotes: data.downvotes, netScore: updatedNetScore };
                }
                if (isReply && c._id === parentId) {
                    return {
                        ...c,
                        replies: c.replies.map(r => r._id === commentId ? { ...r, upvotes: data.upvotes, downvotes: data.downvotes, netScore: updatedNetScore } : r)
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error("Failed to vote", error);
        }
    };

    const toggleReplies = (commentId) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const handleDelete = async (commentId, isReply, parentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await api.delete(`/comments/${commentId}`);
            if (isReply) {
                setComments(prev => prev.map(c => {
                    if (c._id === parentId) {
                        return { ...c, replies: c.replies.filter(r => r._id !== commentId) };
                    }
                    return c;
                }));
            } else {
                setComments(prev => prev.filter(c => c._id !== commentId));
            }
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const handlePin = async (commentId) => {
        try {
            const { data } = await api.put(`/comments/pin/${commentId}`);
            setComments(prev => {
                const updated = prev.map(c => c._id === commentId ? { ...c, isPinned: data.isPinned } : c);
                return updated.sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    if (b.netScore !== a.netScore) return b.netScore - a.netScore;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
            });
        } catch (error) {
            console.error("Failed to pin comment", error);
        }
    };

    const canDelete = (c) => user && (c.user._id === user._id || user.role === 'admin' || user.role === 'faculty');
    const canPin = user && (user.role === 'admin' || user.role === 'faculty');

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
            <div className="modal-content" style={{ maxWidth: '650px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '85vh', backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                
                {/* Header */}
                <div className="flex justify-between items-center shrink-0" style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-main)', margin: 0 }}>
                            <MessageCircle size={20} style={{ color: 'var(--primary)' }} /> Discussions & Q&A
                        </h2>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.25rem 0 0 0' }}>Doc: {title}</p>
                    </div>
                    <button onClick={onClose} className="btn-close-red"><X size={20} /></button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-4" style={{ padding: '1.25rem', backgroundColor: 'var(--background)' }}>
                    {isLoading ? (
                        <p className="text-center text-sm" style={{ color: 'var(--text-muted)', padding: '2.5rem 0' }}>Loading discussions...</p>
                    ) : comments.length === 0 ? (
                        <div className="text-center rounded-xl" style={{ padding: '3rem 1rem', backgroundColor: 'var(--surface)', border: '1px dashed var(--border)' }}>
                            <MessageCircle size={32} className="mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '0.75rem' }} />
                            <p className="text-sm" style={{ color: 'var(--text-muted)', margin: 0 }}>No discussions yet. Be the first to ask a question!</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment._id} className="flex gap-3 relative" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                                
                                {/* Left Column: Voting */}
                                <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                                    <button onClick={() => handleVote(comment._id, false, null, 'upvote')} className="rounded transition-colors cursor-pointer flex items-center justify-center" style={{ width: '28px', height: '28px', border: 'none', color: comment.upvotes?.includes(user?._id) ? 'var(--primary)' : 'var(--text-muted)', backgroundColor: 'transparent' }}>
                                        <ArrowBigUp size={22} fill={comment.upvotes?.includes(user?._id) ? "currentColor" : "none"} strokeWidth={1.5} />
                                    </button>
                                    <span className="text-xs font-bold" style={{ color: comment.netScore > 0 ? 'var(--primary)' : comment.netScore < 0 ? 'var(--error)' : 'var(--text-main)' }}>
                                        {comment.netScore || 0}
                                    </span>
                                    <button onClick={() => handleVote(comment._id, false, null, 'downvote')} className="rounded transition-colors cursor-pointer flex items-center justify-center" style={{ width: '28px', height: '28px', border: 'none', color: comment.downvotes?.includes(user?._id) ? 'var(--error)' : 'var(--text-muted)', backgroundColor: 'transparent' }}>
                                        <ArrowBigDown size={22} fill={comment.downvotes?.includes(user?._id) ? "currentColor" : "none"} strokeWidth={1.5} />
                                    </button>
                                </div>
                                
                                {/* Right Column: Content */}
                                <div className="flex-1 min-w-0">
                                    {comment.isPinned && (
                                        <div className="text-[10px] font-bold uppercase mb-1 flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                                            <Pin size={10} fill="currentColor" /> Pinned
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex items-center justify-center shrink-0 rounded-full text-white font-bold" style={{ width: '24px', height: '24px', backgroundColor: getAvatarColor(comment.user?.name), fontSize: '11px' }}>
                                            {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <span className="text-sm font-bold flex items-center gap-2 truncate" style={{ color: 'var(--text-main)' }}>
                                            {comment.user?.name || 'Unknown User'} 
                                            {comment.user?.role === 'faculty' && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ backgroundColor: 'rgba(0, 198, 255, 0.1)', color: 'var(--primary)' }}>Faculty</span>}
                                        </span>
                                        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>•</span>
                                        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)', marginTop: '0.25rem', marginBottom: '0.75rem', wordBreak: 'break-word' }}>
                                        {comment.content}
                                    </p>
                                    
                                    {/* Action Bar */}
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                            className="text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                                            style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '-0.5rem' }}
                                        >
                                            <MessageSquareText size={14} /> {replyingTo === comment._id ? 'Cancel' : 'Reply'}
                                        </button>

                                        {canPin && (
                                            <button onClick={() => handlePin(comment._id)} className="text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors" style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: comment.isPinned ? 'var(--warning)' : 'var(--text-muted)' }}>
                                                <Pin size={14} fill={comment.isPinned ? "currentColor" : "none"} /> {comment.isPinned ? 'Unpin' : 'Pin'}
                                            </button>
                                        )}
                                        {canDelete(comment) && (
                                            <button onClick={() => handleDelete(comment._id, false, null)} className="text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors" style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'var(--error)' }}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        )}

                                        {comment.replies && comment.replies.length > 0 && (
                                            <button 
                                                onClick={() => toggleReplies(comment._id)}
                                                className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                                                style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'var(--primary)' }}
                                            >
                                                {expandedReplies[comment._id] ? 'Hide Replies' : `${comment.replies.length} ${comment.replies.length === 1 ? 'Reply' : 'Replies'}`}
                                            </button>
                                        )}
                                    </div>

                                    {/* Reply Box Logic */}
                                    {replyingTo === comment._id && (
                                        <form onSubmit={(e) => handlePostReply(e, comment._id)} className="flex gap-2" style={{ marginTop: '0.75rem', paddingLeft: '0.5rem' }}>
                                            <input 
                                                type="text" 
                                                autoFocus
                                                className="input-field text-sm m-0" 
                                                style={{ padding: '0.5rem 0.75rem' }}
                                                placeholder="What are your thoughts?" 
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                            />
                                            <button type="submit" disabled={!replyContent.trim()} className="btn btn-primary text-xs font-bold border-none" style={{ padding: '0.5rem 1rem', opacity: !replyContent.trim() ? 0.5 : 1 }}>Comment</button>
                                        </form>
                                    )}

                                    {/* Collapsible Replies list */}
                                    {comment.replies && comment.replies.length > 0 && expandedReplies[comment._id] && (
                                        <div className="flex flex-col gap-3 border-l-2" style={{ marginTop: '1rem', paddingLeft: '1rem', borderColor: 'var(--border)', marginLeft: '0.5rem' }}>
                                            {comment.replies.map(reply => (
                                                <div key={reply._id} className="flex gap-3 relative">
                                                    <CornerDownRight size={14} className="absolute" style={{ left: '-1.5rem', top: '1rem', color: 'var(--border)' }} />
                                                    
                                                    {/* Reply Voting */}
                                                    <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                                                        <button onClick={() => handleVote(reply._id, true, comment._id, 'upvote')} className="rounded transition-colors cursor-pointer flex items-center justify-center" style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', color: reply.upvotes?.includes(user?._id) ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                            <ArrowBigUp size={20} fill={reply.upvotes?.includes(user?._id) ? "currentColor" : "none"} strokeWidth={1.5} />
                                                        </button>
                                                        <span className="text-xs font-bold" style={{ color: reply.netScore > 0 ? 'var(--primary)' : reply.netScore < 0 ? 'var(--error)' : 'var(--text-muted)' }}>
                                                            {reply.netScore || 0}
                                                        </span>
                                                        <button onClick={() => handleVote(reply._id, true, comment._id, 'downvote')} className="rounded transition-colors cursor-pointer flex items-center justify-center" style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', color: reply.downvotes?.includes(user?._id) ? 'var(--error)' : 'var(--text-muted)' }}>
                                                            <ArrowBigDown size={20} fill={reply.downvotes?.includes(user?._id) ? "currentColor" : "none"} strokeWidth={1.5} />
                                                        </button>
                                                    </div>

                                                    {/* Reply Content */}
                                                    <div className="flex-1 min-w-0 pt-1" style={{ backgroundColor: 'transparent' }}>
                                                        <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center justify-center shrink-0 rounded-full text-white font-bold" style={{ width: '18px', height: '18px', backgroundColor: getAvatarColor(reply.user?.name), fontSize: '9px' }}>
                                                                    {reply.user?.name?.charAt(0).toUpperCase() || '?'}
                                                                </div>
                                                                <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                                                                    {reply.user?.name || 'Unknown'}
                                                                    {reply.user?.role === 'faculty' && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ marginLeft: '0.5rem', backgroundColor: 'rgba(0, 198, 255, 0.1)', color: 'var(--primary)' }}>Faculty</span>}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                                {canDelete(reply) && (
                                                                    <button onClick={() => handleDelete(reply._id, true, comment._id)} className="text-[10px] font-semibold cursor-pointer hover:underline" style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--error)' }}>
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0', wordBreak: 'break-word' }}>
                                                            {reply.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Main Post Input Area */}
                <form onSubmit={handlePostComment} className="mt-auto shrink-0 flex gap-2" style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    <input 
                        type="text" 
                        className="input-field m-0 flex-1 shadow-sm" 
                        style={{ borderRadius: '99px', paddingLeft: '1.25rem', paddingRight: '1rem', height: '44px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                        placeholder="Add a comment to the discussion..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={!newComment.trim()}
                        className="btn-primary rounded-full font-bold text-sm flex items-center justify-center gap-2 border-none"
                        style={{ padding: '0 1.5rem', height: '44px', opacity: !newComment.trim() ? 0.5 : 1 }}
                    >
                        <Send size={16} /> Post
                    </button>
                </form>

            </div>
        </div>
    );
};

export default DiscussionModal;
