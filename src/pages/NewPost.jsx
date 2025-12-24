import { useState } from "react";
import { useNavigate } from "react-router";

function NewPost() {
    const [formData, setFormData] = useState({
        postTitle: '',
        postContent: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/author/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to create post');
                setLoading(false);
                return;
            }

            // Redirect back to home/posts list
            navigate('/');
        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Create New Post</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        name="postTitle"
                        value={formData.postTitle}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Content:</label>
                    <textarea
                        name="postContent"
                        value={formData.postContent}
                        onChange={handleChange}
                        rows="10"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
                <button type="button" onClick={() => navigate('/')}>
                    Cancel
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default NewPost;
