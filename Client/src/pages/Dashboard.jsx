import { useState, useEffect } from 'react';
import api from '../utils/api';

const Dashboard = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('');
    const [materialType, setMaterialType] = useState('File');
    const [linkUrl, setLinkUrl] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (materialType === 'File' && !file) {
            setMessage('Please select a file');
            return;
        }
        if (materialType === 'Link' && !linkUrl) {
            setMessage('Please provide a link');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('department', department);
        formData.append('subject', subject);
        formData.append('semester', semester);
        formData.append('materialType', materialType);
        if (selectedCategory) {
            formData.append('category', selectedCategory);
        }

        if (materialType === 'Link') {
            formData.append('linkUrl', linkUrl);
        } else {
            formData.append('file', file);
        }

        try {
            await api.post('/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Material uploaded successfully!');
            setTitle('');
            setDescription('');
            setDepartment('');
            setSubject('');
            setSemester('');
            setLinkUrl('');
            setSelectedCategory('');
            setFile(null);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container py-8" style={{ minHeight: '60vh' }}>
            <h1 className="text-2xl font-bold text-primary mb-6">Dashboard</h1>
            <div className="card bg-surface w-full max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-4">Upload Study Material</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Document Title <span className="text-red-500 dark:text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Introduction to Algorithms"
                            className="input-field"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                        <textarea
                            placeholder="Brief description of the content..."
                            className="input-field"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Category (Select or Type New) <span className="text-red-500 dark:text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            list="category-options"
                            placeholder="e.g. Previous Year Papers"
                            className="input-field"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            required
                        />
                        <datalist id="category-options">
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Department</label>
                            <input
                                type="text"
                                placeholder="e.g. CSE"
                                className="input-field"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Semester</label>
                            <input
                                type="text"
                                placeholder="e.g. 5"
                                className="input-field"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Subject</label>
                        <input
                            type="text"
                            placeholder="e.g. Data Structures"
                            className="input-field"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="p-4 bg-background rounded-lg border border-border">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                            Material Type <span className="text-red-500 dark:text-red-400">*</span>
                        </label>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="materialType"
                                    value="File"
                                    checked={materialType === 'File'}
                                    onChange={(e) => setMaterialType(e.target.value)}
                                />
                                <span>Document File</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="materialType"
                                    value="Link"
                                    checked={materialType === 'Link'}
                                    onChange={(e) => setMaterialType(e.target.value)}
                                />
                                <span>External Link</span>
                            </label>
                        </div>

                        {materialType === 'File' ? (
                            <div>
                                <input
                                    type="file"
                                    accept=".pdf,.odf,.ppt,.pptx"
                                    className="input-field"
                                    onChange={handleFileChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supported formats: PDF, ODF, PPT, PPTX.</p>
                            </div>
                        ) : (
                            <input
                                type="url"
                                placeholder="https://..."
                                className="input-field"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                required
                            />
                        )}
                    </div>

                    {message && (
                        <div className={`p-4 rounded mt-4 mb-2 font-medium shadow-sm flex items-center gap-2 ${message.includes('success') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full py-3 text-lg mt-2 flex justify-center items-center"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </span>
                        ) : 'Upload Material'}
                    </button>
                </form>
            </div >
        </div >
    );
};

export default Dashboard;
