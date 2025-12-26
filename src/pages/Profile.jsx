import { useState } from 'react';
import { useLoaderData, useActionData, Link, Form, redirect } from 'react-router';
import { apiGet, apiPut, apiDelete, removeToken } from '../utils/api';

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

  if (intent === 'delete') {
    try {
      await apiDelete('/api/author/account');
      removeToken();
      return redirect('/login?accountDeleted=true');
    } catch (error) {
      return { error: error.message || 'Delete failed' };
    }
  }

  // Update profile
  const username = formData.get('username') || undefined;
  const email = formData.get('email') || undefined;
  const name = formData.get('name') || undefined;
  const newPassword = formData.get('newPassword') || undefined;
  const currentPassword = formData.get('currentPassword') || undefined;

  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (name) updateData.name = name;
  if (newPassword) {
    updateData.newPassword = newPassword;
    updateData.currentPassword = currentPassword;
  }

  try {
    const data = await apiPut('/api/author/profile', updateData);
    if (data.requiresRelogin) {
      removeToken();
      return redirect('/login?passwordChanged=true');
    }
    return { success: true, message: data.message };
  } catch (error) {
    return { error: error.message || 'Update failed' };
  }
}

export default function Profile() {
  const { author } = useLoaderData();
  const actionData = useActionData();
  const [isEditing, setIsEditing] = useState(false);

  if (actionData?.success) {
    window.location.reload(); // Refresh to show updated data
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/" style={styles.backButton}>← Back to Home</Link>
        <h1>Profile Settings</h1>
      </div>

      {!isEditing ? (
        <div style={styles.profileView}>
          <div style={styles.field}>
            <strong>Username:</strong> {author.username}
          </div>
          <div style={styles.field}>
            <strong>Name:</strong> {author.name || 'Not set'}
          </div>
           <div style={styles.field}>
             <strong>Email:</strong> {author.email || 'Not set'}
           </div>
           <div style={styles.field}>
             <strong>Public Blog:</strong> Share your username "{author.username}" with readers so they can access your posts on the public site (frontend setup coming soon).
           </div>

           <div style={styles.buttonGroup}>
            <button onClick={() => setIsEditing(true)} style={styles.editButton}>
              Edit Profile
            </button>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                onClick={() => {
                  if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
                    return false;
                  }
                  if (!window.confirm('This will permanently delete all your posts and data. Are you absolutely sure?')) {
                    return false;
                  }
                }}
                style={styles.deleteButton}
              >
                Delete Account
              </button>
            </Form>
          </div>
        </div>
      ) : (
        <Form method="post" style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue={author.username}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={author.name || ''}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={author.email || ''}
              style={styles.input}
            />
          </div>

          <hr style={styles.divider} />

          <h3 style={styles.sectionTitle}>Change Password (optional)</h3>

          <div style={styles.formGroup}>
            <label htmlFor="currentPassword">Current Password:</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Leave blank to keep current password"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Leave blank to keep current password"
              style={styles.input}
            />
          </div>

          {actionData?.error && (
            <div style={styles.errorMessage}>{actionData.error}</div>
          )}

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.saveButton}>Save Changes</button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </Form>
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
  header: {
    marginBottom: '30px'
  },
  backButton: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#007bff',
    textDecoration: 'none'
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
  sectionTitle: {
    margin: '20px 0 15px 0'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  errorMessage: {
    padding: '10px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '5px',
    marginBottom: '15px'
  }
};