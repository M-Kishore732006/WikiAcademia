import { useState, useEffect } from 'react';
import api from '../utils/api';

const Dashboard = () => {
    // const [categories, setCategories] = useState([]); // Removed as per new requirements or keep optional
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('');
    const [materialType, setMaterialType] = useState('PDF');
    const [linkUrl, setLinkUrl] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (materialType === 'PDF' && !file) {
            setMessage('Please select a file');
            return;
        }
        if (materialType === 'Link' && !linkUrl) {
            setMessage('Please provide a link');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('department', department);
        formData.append('subject', subject);
        formData.append('semester', semester);
        formData.append('materialType', materialType);

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
            setFile(null);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Upload failed');
        }
    };

    return (
        <div className="container py-8" style={{ minHeight: '60vh' }}>
            <h1 className="text-2xl font-bold text-primary mb-6">Faculty Dashboard</h1>
            <div className="card bg-surface w-full max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Upload Study Material</h2>
                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            placeholder="Brief description of the content..."
                            className="input-field"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <input
                                type="text"
                                placeholder="e.g. CSE"
                                className="input-field"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <input
                                type="text"
                                placeholder="e.g. 5"
                                className="input-field"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            placeholder="e.g. Data Structures"
                            className="input-field"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="p-4 bg-background rounded-lg border border-border">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Material Type</label>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="materialType"
                                    value="PDF"
                                    checked={materialType === 'PDF'}
                                    onChange={(e) => setMaterialType(e.target.value)}
                                />
                                <span>PDF Document</span>
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

                        {materialType === 'PDF' ? (
                            <div>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="input-field bg-white"
                                    onChange={handleFileChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Supported format: PDF only.</p>
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

                    <button type="submit" className="btn btn-primary w-full py-3 text-lg mt-2">
                        Upload Material
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;
