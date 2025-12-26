import { useLoaderData, useActionData, Link, Form, redirect } from 'react-router';
import { apiGet, removeToken } from '../utils/api';

export async function loader() {
  try {
    const data = await apiGet('/api/author/profile');
    return { author: data.author };
  } catch (error) {
    throw redirect('/login');
  }
}

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'logout') {
    removeToken();
    return redirect('/login');
  }

  return { error: 'Unknown action' };
}

export default function Home() {
  const { author } = useLoaderData();
  const actionData = useActionData();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Author Dashboard</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {author.username}</span>
        </div>
      </header>

      <nav style={styles.nav}>
        <Link to="/profile" style={styles.navLink}>Profile Settings</Link>
        <Link to="/posts/new" style={styles.navLink}>Create New Post</Link>
        <Form method="post">
          <input type="hidden" name="intent" value="logout" />
          <button type="submit" style={styles.logoutButton}>Logout</button>
        </Form>
      </nav>

      <section style={styles.postsSection}>
        <h2>My Posts ({author.posts?.length || 0})</h2>

        {author.posts?.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No posts yet. Create your first post!</p>
            <Link to="/posts/new" style={styles.createButton}>Create Post</Link>
          </div>
        ) : (
          <div style={styles.postsList}>
            {author.posts.map((post) => (
              <article key={post.id} style={styles.postCard}>
                <h3>{post.title}</h3>
                <p style={styles.excerpt}>
                  {post.content.substring(0, 150)}
                  {post.content.length > 150 ? '...' : ''}
                </p>
                <div style={styles.postMeta}>
                  <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                </div>
                <Link to={`/posts/${post.id}`} style={styles.viewButton}>
                  View Post
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {actionData?.error && (
        <div style={styles.error}>{actionData.error}</div>
      )}
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
    marginBottom: '30px',
    borderBottom: '1px solid #ddd',
    paddingBottom: '20px'
  },
  userInfo: {
    fontSize: '16px',
    color: '#666'
  },
  nav: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    alignItems: 'center'
  },
  navLink: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '14px'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  postsSection: {
    marginTop: '30px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px'
  },
  createButton: {
    display: 'inline-block',
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px'
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  postCard: {
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: 'white'
  },
  excerpt: {
    color: '#666',
    margin: '10px 0'
  },
  postMeta: {
    marginBottom: '10px',
    color: '#999'
  },
  viewButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '14px'
  },
  error: {
    padding: '10px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '5px',
    marginTop: '15px'
  }
};