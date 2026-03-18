import { useState, useEffect, useContext } from 'react';
import { Trash2, Edit2, X, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const FacultyUploads = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const { user } = useContext(AuthContext);
    
    const { id: facultyId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const facultyName = searchParams.get('name') || 'This Faculty Member';

    const [editingDoc, setEditingDoc] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        department: '',
        subject: '',
        semester: '',
        linkUrl: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                let queryStr = `?sort=${sortBy}&uploadedBy=${facultyId}`;
                if (selectedCategory) {
                    queryStr += `&category=${selectedCategory}`;
                }
                if (searchQuery) {
                    queryStr += `&search=${encodeURIComponent(searchQuery)}`;
                }
                
                const { data } = await api.get(`/documents${queryStr}`);
                
                // Aggressive Client-Side Fallback Sort
                const sortedData = [...data].sort((a, b) => {
                    if (sortBy === 'a-z') return a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true });
                    if (sortBy === 'z-a') return b.title.localeCompare(a.title, undefined, { sensitivity: 'base', numeric: true });
                    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                    return new Date(b.createdAt) - new Date(a.createdAt); // newest
                });
                setDocuments(sortedData);
            } catch (error) {
                console.error("Failed to fetch documents for this faculty", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [facultyId, selectedCategory, sortBy, searchQuery]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showSortMenu && !e.target.closest('.sort-container')) {
                setShowSortMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSortMenu]);

    const getSortLabel = () => {
        switch(sortBy) {
            case 'newest': return 'Newest - Oldest';
            case 'oldest': return 'Oldest - Newest';
            case 'a-z': return 'A to Z';
            case 'z-a': return 'Z to A';
            default: return 'Sort';
        }
    };

    const handleDownload = async (id, title, materialType, linkUrl) => {
        if (materialType === 'Link') {
            window.open(linkUrl, '_blank', 'noopener,noreferrer');
            return;
        }
        window.open(`http://localhost:5000/api/documents/${id}/download`, '_blank', 'noopener,noreferrer');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this material? This cannot be undone.")) {
            try {
                await api.delete(`/documents/${id}`);
                setDocuments(documents.filter(doc => doc._id !== id));
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete the material.");
            }
        }
    };

    const handleEditClick = (doc) => {
        setEditingDoc(doc._id);
        setEditFormData({
            title: doc.title || '',
            description: doc.description || '',
            department: doc.department || '',
            subject: doc.subject || '',
            semester: doc.semester || '',
            linkUrl: doc.linkUrl || ''
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/documents/${editingDoc}`, editFormData);
            setDocuments(documents.map(doc => doc._id === editingDoc ? { ...doc, ...data } : doc));
            setEditingDoc(null);
            alert("Document updated successfully");
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update document.");
        }
    };

    return (
        <div className="container py-8" style={{ minHeight: '60vh' }}>
            {/* Header Area with Navigation */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <button 
                        onClick={() => navigate('/manage-users')}
                        className="flex items-center gap-2 text-primary hover:underline mb-4 cursor-pointer bg-transparent border-none p-0"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Manage Users</span>
                    </button>
                    
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 m-0">
                        {facultyName}'s Uploads
                    </h1>
                    <p className="text-secondary mt-1">Viewing all documents uploaded by this specific user.</p>
                </div>

                {/* Unified Horizontal Container for All Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Search Bar */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <svg 
                            style={{ position: 'absolute', left: '12px', color: '#9ca3af', pointerEvents: 'none' }} 
                            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search their materials..."
                            className="input-field"
                            style={{ minWidth: '220px', paddingLeft: '36px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                        <select
                            className="input-field"
                            style={{ minWidth: '180px' }}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                            
                    {/* Sort Container */}
                    <div className="relative shrink-0 sort-container" style={{ position: 'relative' }}>
                        <button 
                            className="sort-btn-trigger"
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            title={`Current Sort: ${getSortLabel()}`}
                        >
                            <span className="hidden md:inline">{getSortLabel()}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h7" />
                                <path d="M5 10h3" />
                                <path d="M6 14h1" />
                                <path d="M14 6l3 -3l3 3" />
                                <path d="M17 3v18" />
                                <path d="M20 18l-3 3l-3 -3" />
                            </svg>
                        </button>
                        
                        {showSortMenu && (
                            <div 
                                className="glass-menu-container rounded-xl shadow-lg border border-gray-200/40 dark:border-gray-700/50"
                                style={{ 
                                    position: 'absolute', 
                                    top: 'calc(100% + 8px)', 
                                    right: 0, 
                                    width: '200px', 
                                    zIndex: 9999,
                                    padding: '6px'
                                }}
                            >
                                <button 
                                    className={`glass-menu-item ${sortBy === 'newest' ? 'active' : ''}`}
                                    onClick={() => { setSortBy('newest'); setShowSortMenu(false); }}
                                >
                                    <span>Newest – Oldest</span>
                                    {sortBy === 'newest' && <span className="text-primary text-xs">✓</span>}
                                </button>
                                <button 
                                    className={`glass-menu-item ${sortBy === 'oldest' ? 'active' : ''}`}
                                    onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }}
                                >
                                    <span>Oldest – Newest</span>
                                    {sortBy === 'oldest' && <span className="text-primary text-xs">✓</span>}
                                </button>

                                <div className="glass-menu-divider"></div>

                                <button 
                                    className={`glass-menu-item ${sortBy === 'a-z' ? 'active' : ''}`}
                                    onClick={() => { setSortBy('a-z'); setShowSortMenu(false); }}
                                >
                                    <span>Alphabetical A–Z</span>
                                    {sortBy === 'a-z' && <span className="text-primary text-xs">✓</span>}
                                </button>
                                <button 
                                    className={`glass-menu-item ${sortBy === 'z-a' ? 'active' : ''}`}
                                    onClick={() => { setSortBy('z-a'); setShowSortMenu(false); }}
                                >
                                    <span>Alphabetical Z–A</span>
                                    {sortBy === 'z-a' && <span className="text-primary text-xs">✓</span>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                     <p className="text-gray-500">Loading documents...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map(doc => (
                            <div key={doc._id} className="card bg-surface flex flex-col h-full hover:shadow-lg transition-shadow">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2 gap-3">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 line-clamp-2 pr-2">{doc.title}</h3>
                                        <span className={`text-xs px-6 pt-1 pb-1.5 rounded-full whitespace-nowrap shrink-0 font-medium ${doc.materialType === 'Link' ? 'bg-blue-100 text-blue-800 dark:text-blue-900' : 'bg-red-100 text-red-800 dark:text-red-900'}`}>
                                            {doc.materialType === 'Link' ? 'Link' : (doc.fileUrl ? doc.fileUrl.split('.').pop().toUpperCase() : 'PDF')}
                                        </span>
                                    </div>
                                    <p className="text-secondary text-sm mb-4 line-clamp-3">{doc.description}</p>

                                    <div className="space-y-1 mb-4">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <span className="font-semibold">Subject:</span> {doc.subject || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <span className="font-semibold">Dept:</span> {doc.department || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <span className="font-semibold">Sem:</span> {doc.semester || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-5 border-t border-gray-100 flex justify-between items-end">
                                    <small className="text-gray-400 dark:text-gray-500 text-xs mb-1">
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </small>
                                    <div className="flex gap-2 items-center mt-2">
                                        {user && (user._id === doc.uploadedBy?._id || user.role === 'admin') && (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(doc)}
                                                    className="btn-icon bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                                    title="Edit Material"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc._id)}
                                                    className="btn-icon bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                                    title="Delete Material"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDownload(doc._id, doc.title, doc.materialType, doc.linkUrl)}
                                            className="btn btn-primary text-sm px-4 py-2 whitespace-nowrap"
                                        >
                                            {doc.materialType === 'Link' ? 'Open' : 'Download'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {documents.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">This faculty member has not uploaded any documents.</p>
                        </div>
                    )}
                </>
            )}

            {/* Editing Modal reused from Browse.jsx */}
            {editingDoc && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Document</h2>
                            <button onClick={() => setEditingDoc(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Title</label>
                                <input type="text" className="input-field" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                                <textarea className="input-field" rows="2" value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Department</label>
                                    <input type="text" className="input-field" value={editFormData.department} onChange={e => setEditFormData({ ...editFormData, department: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Semester</label>
                                    <input type="text" className="input-field" value={editFormData.semester} onChange={e => setEditFormData({ ...editFormData, semester: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Subject</label>
                                <input type="text" className="input-field" value={editFormData.subject} onChange={e => setEditFormData({ ...editFormData, subject: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Link URL (optional)</label>
                                <input type="text" className="input-field" value={editFormData.linkUrl} onChange={e => setEditFormData({ ...editFormData, linkUrl: e.target.value })} />
                            </div>
                            <button type="submit" className="btn btn-primary mt-2 py-2">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyUploads;
