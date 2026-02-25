import { useState, useEffect } from 'react';
import api from '../utils/api';

const Browse = () => {
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

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
                const query = selectedCategory ? `?category=${selectedCategory}` : '';
                const { data } = await api.get(`/documents${query}`);
                setDocuments(data);
            } catch (error) {
                console.error("Failed to fetch documents");
            }
        };
        fetchDocuments();
    }, [selectedCategory]);

    const handleDownload = async (id, title, materialType, linkUrl) => {
        if (materialType === 'Link') {
            window.open(linkUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        try {
            const response = await api.get(`/documents/${id}/download`);
            const url = response.data.url;

            // Cloudinary returns a secure URL. Since it's a PDF, 
            // opening it in a new tab will let the browser's PDF viewer handle it.
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                console.error("No URL returned for download");
            }
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    return (
        <div className="container py-8" style={{ minHeight: '60vh' }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold text-primary mb-0">Study Materials</h1>
                <div className="w-full md:w-auto">
                    <select
                        className="input-field"
                        style={{ minWidth: '250px' }}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map(doc => (
                    <div key={doc._id} className="card bg-surface flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{doc.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${doc.materialType === 'Link' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                    {doc.materialType || 'PDF'}
                                </span>
                            </div>
                            <p className="text-secondary text-sm mb-4 line-clamp-3">{doc.description}</p>

                            <div className="space-y-1 mb-4">
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="font-semibold">Subject:</span> {doc.subject || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="font-semibold">Dept:</span> {doc.department || 'General'}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="font-semibold">Sem:</span> {doc.semester || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <small className="text-gray-400 text-xs">By {doc.uploadedBy?.name || 'Unknown'}</small>
                            <button
                                onClick={() => handleDownload(doc._id, doc.title, doc.materialType, doc.linkUrl)}
                                className="btn btn-primary text-sm px-4 py-2"
                            >
                                {doc.materialType === 'Link' ? 'Open Link' : 'Download'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No documents found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Browse;
