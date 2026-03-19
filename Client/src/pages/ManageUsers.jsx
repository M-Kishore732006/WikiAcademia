import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import './ManageUsers.css'; // Mapped vanilla CSS file
import { 
    User, Trash2, KeyRound, Plus, Search, Filter, 
    Edit2, ShieldAlert, GraduationCap, X, FolderOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('student');
    const [newUserName, setNewUserName] = useState('');
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(false);

    const [editUserName, setEditUserName] = useState('');
    const [editUserEmail, setEditUserEmail] = useState('');
    const [editUserRole, setEditUserRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/auth/users');
            setUsers(data);
            setError('');
        } catch (error) {
            console.error("Failed to fetch users", error);
            setError("Error fetching users. Are you logged in as an Admin?");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;
        try {
            await api.delete(`/auth/user/${selectedUser._id}`);
            showToast('User deleted successfully');
            setUsers(users.filter(u => u._id !== selectedUser._id));
            setIsDeleteModalOpen(false);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    const handleResetPassword = async (userId) => {
        const newPassword = window.prompt("Enter new password for this user (minimum 6 characters):");
        if (!newPassword || newPassword.length < 6) {
            if (newPassword !== null) alert("Password must be at least 6 characters.");
            return;
        }

        try {
            await api.put(`/auth/reset-password/${userId}`, { password: newPassword });
            showToast('Password reset successfully');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to reset password', 'error');
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        
        let finalPassword = newUserPassword;
        if (autoGeneratePassword) {
             finalPassword = Math.random().toString(36).slice(-8) + "!"; 
        }
        
        const endpoint = newUserRole === 'faculty' ? '/auth/create-faculty' : '/auth/create-student';
        
        try {
            await api.post(endpoint, {
                name: newUserName || "User",
                email: newUserEmail,
                password: finalPassword
            });
            showToast(`${newUserRole} created successfully! ${autoGeneratePassword ? 'Pass: '+finalPassword : ''}`);
            fetchUsers(); 
            
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserName('');
            setIsCreateModalOpen(false);
        } catch (error) {
            showToast(error.response?.data?.message || `Failed to create ${newUserRole}`, 'error');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/auth/user/${selectedUser._id}`, {
                name: editUserName,
                email: editUserEmail,
                role: editUserRole
            });
            showToast('User updated successfully');
            setUsers(users.map(u => (u._id === data._id ? data : u)));
            setIsEditModalOpen(false);
        } catch(error) {
            showToast(error.response?.data?.message || 'Failed to update user', 'error');
        }
    };

    const processedUsers = useMemo(() => {
        let result = [...users];

        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            result = result.filter(u => 
                (u.name && u.name.toLowerCase().includes(lowerQuery)) || 
                (u.email && u.email.toLowerCase().includes(lowerQuery))
            );
        }

        if (roleFilter !== 'all') {
            result = result.filter(u => u.role === roleFilter);
        }

        result.sort((a, b) => {
            if (sortBy === 'name_asc') {
                return (a.name || '').localeCompare(b.name || '');
            } else if (sortBy === 'role') {
                return a.role.localeCompare(b.role);
            } else {
                return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
            }
        });

        return result;
    }, [users, searchTerm, roleFilter, sortBy]);

    const totalPages = Math.ceil(processedUsers.length / usersPerPage) || 1;
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);

    const currentTableUsers = processedUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const stats = {
        total: users.length,
        faculty: users.filter(u => u.role === 'faculty').length,
        students: users.filter(u => u.role === 'student').length,
    };

    const getInitials = (name, email) => {
        if (name && name.trim()) return name.substring(0, 2).toUpperCase();
        if (email) return email.substring(0, 2).toUpperCase();
        return "U";
    };

    return (
        <div className="container manage-users-container animate-fade-in">
            
            {toast && (
                <div className={`mu-toast ${toast.type}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)} style={{background:'transparent', border:'none', cursor:'pointer'}}><X size={16} /></button>
                </div>
            )}

            <div className="mu-header">
                <div>
                    <h1>
                        <User className="text-primary hidden-mobile" size={32} />
                        User Management
                    </h1>
                    <p className="text-secondary">Manage global faculty, admin, and student system access.</p>
                </div>
                <button 
                    onClick={() => {
                        setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setAutoGeneratePassword(false);
                        setIsCreateModalOpen(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> Add New User
                </button>
            </div>

            {error && (
                <div className="card bg-surface" style={{ borderColor: 'var(--error)', color: 'var(--error)', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <ShieldAlert size={24} />
                    <p style={{ margin: 0 }}>{error}</p>
                </div>
            )}

            {!error && !loading && (
                <div className="mu-stats-grid">
                    <div className="card mu-stat-card">
                        <div className="mu-stat-icon total">
                            <User size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-sm font-medium text-secondary">Total Users</div>
                        </div>
                    </div>
                    <div className="card mu-stat-card">
                        <div className="mu-stat-icon faculty">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.faculty}</div>
                            <div className="text-sm font-medium text-secondary">Active Faculty</div>
                        </div>
                    </div>
                    <div className="card mu-stat-card">
                        <div className="mu-stat-icon students">
                            <User size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.students}</div>
                            <div className="text-sm font-medium text-secondary">Enrolled Students</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card mu-main-card">
                <div className="mu-toolbar">
                    <div className="mu-search">
                        <Search className="icon" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by name or email..."
                            className="input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="mu-filters">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={18} className="text-secondary hidden-mobile" />
                            <select 
                                className="input-field"
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admins</option>
                                <option value="faculty">Faculty</option>
                                <option value="student">Students</option>
                            </select>
                        </div>
                        <select 
                            className="input-field"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="role">By Role</option>
                        </select>
                    </div>
                </div>

                <div className="mu-table-container">
                    {loading ? (
                        <div className="mu-empty-state">
                            Loading system users...
                        </div>
                    ) : processedUsers.length === 0 ? (
                        <div className="mu-empty-state">
                            <User size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 style={{ margin: 0 }}>No users found</h3>
                            <p>Try adjusting your search or role filters.</p>
                        </div>
                    ) : (
                        <>
                        {/* Desktop Table */}
                        <table className="mu-table">
                            <thead>
                                <tr>
                                    <th>User Details</th>
                                    <th>User Role</th>
                                    <th className="hidden-mobile">Account ID</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTableUsers.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="mu-user-cell">
                                                <div className={`mu-avatar ${u.role}`}>
                                                    {getInitials(u.name, u.email)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{u.name || 'Unnamed Record'}</div>
                                                    <div className="text-sm text-secondary">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`mu-badge ${u.role}`}>
                                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="hidden-mobile">
                                            <span className="text-xs text-secondary" style={{ fontFamily: 'monospace' }} title={u._id}>
                                                {u._id.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td>
                                            <div className="mu-actions">
                                                {(u.role === 'faculty' || u.role === 'admin') && (
                                                    <button 
                                                        onClick={() => navigate(`/manage-users/${u._id}/uploads?name=${encodeURIComponent(u.name || u.email)}`)}
                                                        className="view-uploads"
                                                        title="View User's Uploads"
                                                        style={{ color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)' }}
                                                    >
                                                        <FolderOpen size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setEditUserName(u.name || '');
                                                        setEditUserEmail(u.email || '');
                                                        setEditUserRole(u.role || '');
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="edit"
                                                    title="Edit User Details"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleResetPassword(u._id)}
                                                    className="reset"
                                                    title="Force Password Reset"
                                                >
                                                    <KeyRound size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedUser(u); setIsDeleteModalOpen(true); }}
                                                    className="delete"
                                                    title={u.role === 'admin' ? "Cannot delete Admin" : "Delete Account"}
                                                    disabled={u.role === 'admin'}
                                                    style={{ opacity: u.role === 'admin' ? 0.3 : 1, cursor: u.role === 'admin' ? 'not-allowed' : 'pointer'}}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Card List */}
                        <div className="mu-card-list">
                            {currentTableUsers.map(u => (
                                <div key={u._id} className="mu-user-card">
                                    <div className={`mu-avatar ${u.role}`} style={{ flexShrink: 0 }}>
                                        {getInitials(u.name, u.email)}
                                    </div>
                                    <div className="mu-user-card-info">
                                        <div className="name">{u.name || 'Unnamed Record'}</div>
                                        <div className="email">{u.email}</div>
                                        <div style={{ marginTop: '0.4rem' }}>
                                            <span className={`mu-badge ${u.role}`}>
                                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                            </span>
                                        </div>
                                        <div className="mu-user-card-actions">
                                            {(u.role === 'faculty' || u.role === 'admin') && (
                                                <button 
                                                    onClick={() => navigate(`/manage-users/${u._id}/uploads?name=${encodeURIComponent(u.name || u.email)}`)}
                                                    className="mu-actions view-uploads"
                                                    title="View Uploads"
                                                    style={{ color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', cursor: 'pointer', display:'flex', alignItems:'center' }}
                                                >
                                                    <FolderOpen size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => { setSelectedUser(u); setEditUserName(u.name||''); setEditUserEmail(u.email||''); setEditUserRole(u.role||''); setIsEditModalOpen(true); }}
                                                style={{ background: 'rgba(59,130,246,0.1)', color:'#3b82f6', border:'none', borderRadius:'0.4rem', padding:'0.4rem', cursor:'pointer', display:'flex', alignItems:'center' }}
                                                title="Edit"
                                            ><Edit2 size={16} /></button>
                                            <button 
                                                onClick={() => handleResetPassword(u._id)}
                                                style={{ background: 'rgba(245,158,11,0.1)', color:'#f59e0b', border:'none', borderRadius:'0.4rem', padding:'0.4rem', cursor:'pointer', display:'flex', alignItems:'center' }}
                                                title="Reset Password"
                                            ><KeyRound size={16} /></button>
                                            <button 
                                                onClick={() => { setSelectedUser(u); setIsDeleteModalOpen(true); }}
                                                disabled={u.role === 'admin'}
                                                style={{ background: 'rgba(239,68,68,0.1)', color:'#ef4444', border:'none', borderRadius:'0.4rem', padding:'0.4rem', cursor: u.role==='admin'?'not-allowed':'pointer', opacity: u.role==='admin'?0.3:1, display:'flex', alignItems:'center' }}
                                                title="Delete"
                                            ><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>
                    )}
                </div>

                {!loading && processedUsers.length > 0 && (
                    <div className="mu-pagination">
                        <div>
                            Showing <span className="font-medium text-main">{((currentPage - 1) * usersPerPage) + 1}</span> to <span className="font-medium text-main">{Math.min(currentPage * usersPerPage, processedUsers.length)}</span> of <span className="font-medium text-main">{processedUsers.length}</span> entries
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="mu-modal-overlay">
                    <div className="mu-modal">
                        <div className="mu-modal-header">
                            <h2>Create New Account</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="mu-modal-close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mu-modal-body">
                            <form onSubmit={handleCreateSubmit}>
                                <div className="mu-form-group">
                                    <label>Full Name (Optional)</label>
                                    <input type="text" className="input-field" placeholder="John Doe" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                                </div>
                                <div className="mu-form-group">
                                    <label>Email *</label>
                                    <input type="email" className="input-field" placeholder="user@example.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                                </div>
                                <div className="mu-form-group">
                                    <label>Assigned Role</label>
                                    <select className="input-field" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                                        <option value="student">Student User</option>
                                        <option value="faculty">Faculty Member</option>
                                    </select>
                                </div>
                                <div className="mu-form-group">
                                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Password *</span>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'normal' }}>
                                            <input type="checkbox" checked={autoGeneratePassword} onChange={(e) => setAutoGeneratePassword(e.target.checked)} style={{ margin: 0 }} /> Auto-generate
                                        </label>
                                    </label>
                                    <input type="text" className="input-field" placeholder="Minimum 6 characters" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required={!autoGeneratePassword} disabled={autoGeneratePassword} minLength="6" />
                                </div>
                                <div className="mu-modal-footer">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="mu-modal-overlay">
                    <div className="mu-modal">
                        <div className="mu-modal-header">
                            <h2>Edit User Details</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="mu-modal-close"><X size={20} /></button>
                        </div>
                        <div className="mu-modal-body">
                            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '1rem', color: 'var(--text-muted)' }}>ID: {selectedUser._id}</div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="mu-form-group">
                                    <label>Full Name</label>
                                    <input type="text" className="input-field" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
                                </div>
                                <div className="mu-form-group">
                                    <label>Email</label>
                                    <input type="email" className="input-field" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} required />
                                </div>
                                <div className="mu-form-group">
                                    <label style={{ color: 'var(--error)' }}>Hazard Danger: Role Access</label>
                                    <select className="input-field" style={{ borderColor: 'var(--error)' }} value={editUserRole} onChange={(e) => setEditUserRole(e.target.value)} disabled={selectedUser.role === 'admin'}>
                                        <option value="student">Demote to Student</option>
                                        <option value="faculty">Promote to Faculty</option>
                                        {selectedUser.role === 'admin' && <option value="admin">Administrator Override</option>}
                                    </select>
                                </div>
                                <div className="mu-modal-footer">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-outline">Discard</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="mu-modal-overlay">
                    <div className="mu-modal" style={{ maxWidth: '350px', textAlign: 'center' }}>
                        <div className="mu-modal-body" style={{ padding: '2rem' }}>
                            <div style={{ width: '4rem', height: '4rem', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                <Trash2 size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Delete Account?</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                You are about to permanently delete <strong>{selectedUser.email}</strong>. This operation will wipe their data off the database and cannot be reversed.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button onClick={handleDeleteConfirm} className="btn" style={{ background: '#ef4444', color: 'white', width: '100%', border: 'none' }}>Yes, delete user</button>
                                <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-outline" style={{ width: '100%' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
