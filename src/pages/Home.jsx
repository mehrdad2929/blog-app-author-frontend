import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function Home() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:3000/api/author/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // If unauthorized, clear token and redirect
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        navigate('/login');
                        return;
                    }
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setProfile(data.author);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Author Page</h1>
            {profile && (
                <div>
                    <p>Username: {profile.username}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => navigate('/profile')}>
                            Profile Settings
                        </button>
                        <button onClick={() => navigate('/posts/new')}>
                            Create New Post
                        </button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            )}
            <h2>My Posts</h2>
            {profile?.posts?.length === 0 ? (
                <p>No posts yet. Create your first post!</p>
            ) : (
                profile?.posts?.map((post) => (
                    <div key={post.id} style={styles.postCard}>
                        <h3>{post.title}</h3>
                        <p>{post.content.substring(0, 150)}...</p>
                        <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                        <br />
                        <button onClick={() => navigate(`/posts/${post.id}`)}>
                            View Post
                        </button>
                    </div>
                ))
            )}
        </div>
    );

}
const styles = {
    postCard: {
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '10px',
        borderRadius: '5px'
    }
};
export default Home;
