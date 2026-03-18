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
                <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg absolute w-full left-0 top-60px" style={{ backgroundColor: 'var(--surface)' }}>
                    <div className="flex justify-between items-center border-b pb-4 border-gray-100">
                        <span className="text-secondary font-medium">Theme</span>
                        <button
                            onClick={toggleTheme}
                            className="bg-transparent border-none cursor-pointer text-primary flex items-center gap-2"
                        >
                            {isDarkMode ? <><Sun size={20} /> Light Mode</> : <><Moon size={20} /> Dark Mode</>}
                        </button>
                    </div>
                    <Link to="/browse" className="nav-link" onClick={() => setIsMenuOpen(false)}>Browse Materials</Link>
                    {user ? (
                        <>
                            {(user.role === 'faculty' || user.role === 'admin') && (
                                <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/manage-users" className="nav-link" onClick={() => setIsMenuOpen(false)}>Manage Users</Link>
                            )}
                            <div className="border-t pt-2 mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Signed in as {user.name}</p>
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="text-red-500 w-full text-left"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="btn btn-primary text-center text-white" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
