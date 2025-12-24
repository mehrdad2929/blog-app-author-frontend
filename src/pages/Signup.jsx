import { useState } from "react";
import { useNavigate } from "react-router";

function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        name: ''
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
            const response = await fetch('http://localhost:3000/api/author/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Signup failed');
                console.log('error:', data.error)
                console.log('message:', data.details[0])
                console.log('path:', data.details[1])
                setLoading(false);
                return;
            }

            // Redirect to login after successful signup
            navigate('/login');
        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Author Signup</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <input
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Signing up...' : 'Signup'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
}

export default Signup;
