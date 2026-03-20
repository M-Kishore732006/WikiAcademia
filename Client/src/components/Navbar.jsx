import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LogOut, User, Upload, Moon, Sun, Users } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container flex justify-between items-center">
                <Link to="/" className="text-primary font-bold text-xl flex items-center gap-2">
                    <BookOpen size={24} />
                    <span>WikiAcademia</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-600 dark:text-gray-300 bg-transparent border-none cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <button
                        onClick={toggleTheme}
                        className="bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <Link to="/browse" className="nav-link">Browse Materials</Link>
                    {user ? (
                        <>
                            {(user.role === 'faculty' || user.role === 'admin') && (
                                <Link to="/dashboard" className="btn btn-primary text-white text-sm py-2 px-4 no-underline flex items-center gap-2">
                                    <Upload size={16} /> Dashboard
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/manage-users" className="btn btn-outline text-sm py-2 px-4 no-underline flex items-center gap-2">
                                    <Users size={16} /> Manage Users
                                </Link>
                            )}
                            <div className="flex items-center gap-2 text-secondary">
                                <User size={18} />
                                <span className="font-medium">{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-gray-500 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-500 bg-transparent border-none cursor-pointer flex items-center gap-1"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary text-white text-sm py-2 px-4 no-underline">Register</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-surface border-t border-border p-4 flex flex-col gap-2 shadow-2xl absolute w-full left-0 top-full z-[101] animate-fadeIn">
                    <div className="flex justify-between items-center px-6 py-4 mb-2 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-border/30 gap-4">
                        <span className="text-secondary font-semibold flex items-center gap-4">
                             <Sun size={22} className="text-primary" />
                             Appearance
                        </span>
                        <button
                            onClick={toggleTheme}
                            className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 cursor-pointer font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-primary/20 shadow-sm"
                        >
                            {isDarkMode ? "Light Mode" : "Dark Mode"}
                        </button>
                    </div>

                    <Link to="/browse" className="flex items-center px-6 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-secondary font-medium no-underline transition-all active:scale-[0.98] gap-4" onClick={() => setIsMenuOpen(false)}>
                        <BookOpen size={22} className="text-primary" />
                        Browse Materials
                    </Link>

                    {user ? (
                        <>
                            {(user.role === 'faculty' || user.role === 'admin') && (
                                <Link to="/dashboard" className="flex items-center px-6 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-secondary font-medium no-underline transition-all active:scale-[0.98] gap-4" onClick={() => setIsMenuOpen(false)}>
                                    <Upload size={22} className="text-primary" />
                                    Dashboard
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/manage-users" className="flex items-center px-6 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-secondary font-medium no-underline transition-all active:scale-[0.98] gap-4" onClick={() => setIsMenuOpen(false)}>
                                    <Users size={22} className="text-primary" />
                                    Manage Users
                                </Link>
                            )}
                            
                            <div className="mt-2 pt-2 border-t border-border/50">
                                <div className="flex items-center px-6 py-3 text-secondary font-medium border-none bg-transparent gap-4">
                                    <User size={22} className="text-primary" />
                                    <span>{user.name}</span>
                                </div>
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="flex items-center px-6 py-4 w-full rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 font-semibold border-none bg-transparent cursor-pointer transition-all active:scale-[0.98] gap-4"
                                >
                                    <LogOut size={22} />
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/50">
                            <Link to="/login" className="flex items-center px-6 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-secondary font-medium no-underline transition-all active:scale-[0.98] gap-4" onClick={() => setIsMenuOpen(false)}>
                                <User size={22} className="text-primary" />
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary w-full justify-center p-4 shadow-md mt-2" onClick={() => setIsMenuOpen(false)}>
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
