import { useActionData, Link, Form } from 'react-router';
import { apiPost } from '../utils/api';

export function loader() {
  return null;
}

export async function action({ request }) {
  const formData = await request.formData();
  const postTitle = formData.get('postTitle');
  const postContent = formData.get('postContent');

  try {
    const data = await apiPost('/api/author/posts', { postTitle, postContent });
    return { success: true, postId: data.id };
  } catch (error) {
    return { error: error.message || 'Failed to create post' };
  }
}

export default function NewPost() {
  const actionData = useActionData();

  // Redirect on successful post creation
  if (actionData?.success) {
    window.location.href = `/posts/${actionData.postId}`;
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/" style={styles.backButton}>← Back to Posts</Link>
        <h1>Create New Post</h1>
      </div>

      <Form method="post" style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="postTitle">Title:</label>
          <input
            id="postTitle"
            name="postTitle"
            type="text"
            required
            style={styles.input}
            placeholder="Enter post title..."
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="postContent">Content:</label>
          <textarea
            id="postContent"
            name="postContent"
            required
            rows="15"
            style={styles.textarea}
            placeholder="Write your post content here..."
          />
        </div>

        {actionData?.error && (
          <div style={styles.error}>{actionData.error}</div>
        )}

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitButton}>Create Post</button>
          <Link to="/" style={styles.cancelButton}>Cancel</Link>
        </div>
      </Form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  header: {
    marginBottom: '30px'
  },
  backButton: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#007bff',
    textDecoration: 'none'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '5px'
  },
  textarea: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  error: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '5px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    display: 'inline-block'
  }
};