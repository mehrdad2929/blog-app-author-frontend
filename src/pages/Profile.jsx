import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        currentPassword: '',
        newPassword: ''
    });
    const [updateMessage, setUpdateMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/author/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data.author);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                username: data.username || '',
                currentPassword: '',
                newPassword: ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateMessage('');

        try {
            const token = localStorage.getItem('token');

            // Only send fields that have values
            const updateData = {};
            if (formData.name) updateData.name = formData.name;
            if (formData.email) updateData.email = formData.email;
            if (formData.username) updateData.username = formData.username;
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await fetch('http://localhost:3000/api/author/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                setUpdateMessage(data.error || 'Update failed');
                return;
            }

            // Check if password was changed (requires re-login)
            if (data.requiresRelogin) {
                alert('Password updated! Please login again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setUpdateMessage('Profile updated successfully!');
                setIsEditing(false);
                fetchProfile(); // Refresh profile data
            }
        } catch (err) {
            setUpdateMessage('Error updating profile');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone!'
        );

        if (!confirmed) return;

        const doubleConfirm = window.confirm(
            'This will permanently delete all your posts and data. Are you absolutely sure?'
        );

        if (!doubleConfirm) return;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/author/account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Account deleted successfully');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                alert('Failed to delete account');
            }
        } catch (err) {
            alert('Error deleting account');
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            name: profile.name || '',
            email: profile.email || '',
            username: profile.username || '',
            currentPassword: '',
            newPassword: ''
        });
        setIsEditing(false);
        setUpdateMessage('');
    };

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/')}>← Back to Home</button>

            <h1>Profile Settings</h1>

            {!isEditing ? (
                <div style={styles.profileView}>
                    <div style={styles.field}>
                        <strong>Username:</strong> {profile.username}
                    </div>
                    <div style={styles.field}>
                        <strong>Name:</strong> {profile.name || 'Not set'}
                    </div>
                    <div style={styles.field}>
                        <strong>Email:</strong> {profile.email || 'Not set'}
                    </div>

                    <div style={styles.buttonGroup}>
                        <button onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                        <button onClick={handleDeleteAccount} style={styles.dangerButton}>
                            Delete Account
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleUpdate} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label>Username:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <hr style={styles.divider} />

                    <h3>Change Password (optional)</h3>

                    <div style={styles.formGroup}>
                        <label>Current Password:</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>New Password:</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    {updateMessage && (
                        <p style={updateMessage.includes('success') ? styles.successMessage : styles.errorMessage}>
                            {updateMessage}
                        </p>
                    )}

                    <div style={styles.buttonGroup}>
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={handleCancelEdit}>Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px'
    },
    profileView: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
    },
    field: {
        marginBottom: '15px',
        fontSize: '16px'
    },
    form: {
        marginTop: '20px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        marginTop: '5px'
    },
    divider: {
        margin: '30px 0',
        border: 'none',
        borderTop: '1px solid #ddd'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
    },
    dangerButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    successMessage: {
        color: 'green',
        padding: '10px',
        backgroundColor: '#d4edda',
        borderRadius: '5px',
        marginBottom: '15px'
    },
    errorMessage: {
        color: 'red',
        padding: '10px',
        backgroundColor: '#f8d7da',
        borderRadius: '5px',
        marginBottom: '15px'
    }
};

export default Profile;
