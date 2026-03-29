import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Upload, Search, ArrowRight, Bot } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="home-page">
            {/* Hero Section */}
        <section className="bg-surface py-16 border-b border-gray-200">
            <div className="container text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-6" style={{ fontSize: 'clamp(1.5rem, 5.5vw, 3.25rem)' }}>
                    Your AI-Powered Academic Knowledge Hub
                </h1>
                <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                    Browse study materials, lecture notes, and research papers — then let our built-in AI summarize them and answer your questions instantly.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4" style={{ alignItems: 'center' }}>
                    <Link to="/browse" className="btn btn-primary text-lg px-8 py-3 no-underline text-white w-full sm:w-auto" style={{ maxWidth: '280px' }}>
                        Browse Materials <ArrowRight size={20} />
                    </Link>
                    {!user && (
                        <Link to="/register" className="btn btn-outline text-lg px-8 py-3 no-underline w-full sm:w-auto" style={{ maxWidth: '280px' }}>
                            Join Now
                        </Link>
                    )}
                </div>
            </div>
        </section>

            {/* Features Section */}
            <section className="py-16 bg-background">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <Link to="/browse" className="card text-center hover:shadow-lg transition-shadow cursor-pointer block text-inherit no-underline" style={{ color: 'inherit' }}>
                            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Search</h3>
                            <p className="text-secondary">
                                Quickly find resources by subject, department, or semester using our advanced filtering system.
                            </p>
                        </Link>

                        {/* Feature 2: WikAI Assistant - Now Live */}
                        <Link
                            to="/browse"
                            className="card text-center hover:shadow-lg transition-shadow cursor-pointer block text-inherit no-underline" style={{ color: 'inherit' }}
                        >
                            <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg"
                                style={{ background: 'linear-gradient(to top right, #6366f1, #a855f7, #ec4899)', boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.3)' }}
                            >
                                <Bot size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">WikAI Assistant</h3>
                            <p className="text-secondary">
                                AI-powered study assistant that reads your documents, extracts key concepts, and answers your questions in real time.
                            </p>
                        </Link>

                        {/* Feature 3 */}
                        <div 
                            onClick={() => {
                                if (!user) {
                                    window.location.href = '/login';
                                } else if (user.role === 'faculty' || user.role === 'admin') {
                                    window.location.href = '/dashboard';
                                } else {
                                    alert('This feature requires Faculty access. Please contact an admin if you need to upload materials.');
                                }
                            }}
                            className="card text-center hover:shadow-lg transition-shadow cursor-pointer block text-inherit no-underline"
                        >
                            <div className="bg-primary-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                <Upload size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Faculty Uploads</h3>
                            <p className="text-secondary">
                                Faculty members can easily share lecture notes, assignments, and reference materials.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
