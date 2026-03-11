import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Upload, Search, ArrowRight } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import FacultyUpload from '../components/FacultyUpload';

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="bg-surface py-20 border-b border-gray-200">
                <div className="container text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gradient mb-6">
                        Digital Academic Knowledge Repository
                    </h1>
                    <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
                        Access a vast collection of study materials, lecture notes, and research papers via our centralized platform.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/browse" className="btn btn-primary text-lg px-8 py-3 no-underline text-white">
                            Browse Materials <ArrowRight size={20} />
                        </Link>
                        {!user && (
                            <Link to="/register" className="btn btn-outline text-lg px-8 py-3 no-underline">
                                Join Now
                            </Link>
                        )}
                    </div>

                    {/* Faculty Upload Section - Visible only to Faculty and Admin */}
                    {user && (user.role === 'faculty' || user.role === 'admin') && (
                        <div className="mt-12 animate-fade-in">
                            <FacultyUpload />
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-background">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card text-center hover:shadow-lg transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Search</h3>
                            <p className="text-secondary">
                                Quickly find resources by subject, department, or semester using our advanced filtering system.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card text-center hover:shadow-lg transition-shadow">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-success">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Access Anyway</h3>
                            <p className="text-secondary">
                                View PDF documents directly in your browser or access external learning resources instantly.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card text-center hover:shadow-lg transition-shadow">
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
