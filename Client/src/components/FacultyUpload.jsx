import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Upload, Link as LinkIcon, FileText } from 'lucide-react';

const FacultyUpload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('');
    const [category, setCategory] = useState('');
    const [materialType, setMaterialType] = useState('File');
    const [linkUrl, setLinkUrl] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [existingCategories, setExistingCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setExistingCategories(data);
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
        setMessage('');

        if (materialType === 'File' && !file) {
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
        formData.append('category', category);
        formData.append('materialType', materialType);

        if (materialType === 'Link') {
            formData.append('linkUrl', linkUrl);
        } else {
            formData.append('file', file);
        }

        try {
            await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('success: Material uploaded successfully!');
            setTitle('');
            setDescription('');
            setDepartment('');
            setSubject('');
            setSemester('');
            setCategory('');
            setLinkUrl('');
            setFile(null);
        } catch (error) {
            setMessage(`error: ${error.response?.data?.message || 'Upload failed'}`);
        }
    };

    return (
        <div className="card bg-surface w-full max-w-3xl mx-auto shadow-lg border border-border mt-8">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Upload size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 m-0">Quick Upload</h2>
                    <p className="text-secondary text-sm m-0">Share knowledge with your students instantly</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded mb-6 flex items-center gap-2 ${message.startsWith('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.replace('success: ', '').replace('error: ', '')}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">
                            Title <span className="text-red-500 dark:text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Advanced Calculus Notes"
                            className="input-field"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">
                            Category <span className="text-red-500 dark:text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            list="category-suggestions"
                            placeholder="Select or type new..."
                            className="input-field"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                        <datalist id="category-suggestions">
                            {existingCategories.map(cat => (
                                <option key={cat._id} value={cat.name} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                    <textarea
                        placeholder="Brief overview..."
                        className="input-field"
                        rows="2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Department</label>
                        <input
                            type="text"
                            placeholder="e.g. CSE"
                            className="input-field"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Subject</label>
                        <input
                            type="text"
                            placeholder="e.g. AI"
                            className="input-field"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Semester</label>
                        <input
                            type="text"
                            placeholder="e.g. 6"
                            className="input-field"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                        Upload Type <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div className="flex gap-4 mb-4">
                        <label className={`flex items-center gap-2 cursor-pointer p-2 rounded border ${materialType === 'File' ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}>
                            <input
                                type="radio"
                                name="homeMaterialType"
                                value="File"
                                checked={materialType === 'File'}
                                onChange={(e) => setMaterialType(e.target.value)}
                                className="hidden"
                            />
                            <FileText size={18} />
                            <span>Document File</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer p-2 rounded border ${materialType === 'Link' ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}>
                            <input
                                type="radio"
                                name="homeMaterialType"
                                value="Link"
                                checked={materialType === 'Link'}
                                onChange={(e) => setMaterialType(e.target.value)}
                                className="hidden"
                            />
                            <LinkIcon size={18} />
                            <span>External Link</span>
                        </label>
                    </div>

                    {
                        materialType === 'File' ? (
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
                        )
                    }
                </div >

                <button type="submit" className="btn btn-primary w-full py-3 text-lg font-bold shadow-md hover:shadow-lg transform transition-all active:scale-95">
                    Upload & Publish
                </button>
            </form >
        </div >
    );
};

export default FacultyUpload;
