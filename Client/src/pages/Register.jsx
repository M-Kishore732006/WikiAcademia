import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('student');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="container flex justify-center items-center" style={{ minHeight: '80vh' }}>
            <div className="card w-full max-w-md bg-surface">
                <h2 className="text-2xl text-center text-primary mb-6">Create Account</h2>
                {error && <div className="bg-red-100 border border-red-500 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-[32px] text-gray-500 hover:text-primary bg-transparent border-none cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                        <select
                            className="input-field bg-white"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-full py-3 mt-2">
                        Register
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-secondary">
                    Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
