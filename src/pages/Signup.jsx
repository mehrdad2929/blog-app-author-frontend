import { useActionData, Link, Form } from 'react-router';
import { apiPost } from '../utils/api';

export function loader() {
  return null;
}

export async function action({ request }) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');
  const email = formData.get('email');
  const name = formData.get('name');

  try {
    await apiPost('/api/author/signup', { username, password, email, name });
    return { success: true };
  } catch (error) {
    return { error: error.message || 'Signup failed' };
  }
}

export default function Signup() {
  const actionData = useActionData();

  // Redirect on successful signup
  if (actionData?.success) {
    window.location.href = '/login?registered=true';
    return null;
  }

  return (
    <div style={styles.container}>
      <h1>Author Signup</h1>

      <Form method="post" style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength="3"
            maxLength="20"
            pattern="[a-zA-Z0-9_]+"
            style={styles.input}
          />
          <small>3-20 characters (letters, numbers, underscore)</small>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength="3"
            maxLength="50"
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength="6"
            style={styles.input}
          />
          <small>6+ characters with uppercase, lowercase, and number</small>
        </div>
        <button type="submit" style={styles.button}>Signup</button>
      </Form>

      {actionData?.error && (
        <p style={styles.error}>{actionData.error}</p>
      )}

      <p style={styles.link}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  button: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  error: {
    color: 'red',
    marginTop: '15px'
  },
  link: {
    marginTop: '15px'
  }
};