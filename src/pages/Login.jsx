import { useActionData, useSearchParams, Form } from 'react-router';
import { Link } from 'react-router';
import { apiPost, setToken } from '../utils/api';

export function loader() {
  return null;
}

export async function action({ request }) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    const data = await apiPost('/api/author/login', { username, password });
    setToken(data.token);
    return { success: true };
  } catch (error) {
    return { error: error.message || 'Login failed' };
  }
}

export default function Login() {
  const actionData = useActionData();
  const [searchParams] = useSearchParams();
  const registered = searchParams.get('registered');

  // Redirect on successful login
  if (actionData?.success) {
    window.location.href = '/';
    return null;
  }

  return (
    <div style={styles.container}>
      <h1>Author Login</h1>

      {registered && (
        <div style={styles.success}>
          Registration successful! Please login.
        </div>
      )}

      <Form method="post" style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            name="username"
            type="text"
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
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>Login</button>
      </Form>

      {actionData?.error && (
        <p style={styles.error}>{actionData.error}</p>
      )}

      <p style={styles.link}>
        Create new account <Link to="/signup">Signup</Link>
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
    backgroundColor: '#007bff',
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
  success: {
    color: 'green',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#d4edda',
    borderRadius: '5px'
  },
  link: {
    marginTop: '15px'
  }
};