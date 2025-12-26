import { useState } from 'react';
import { useLoaderData, useActionData, Link, Form } from 'react-router';
import { apiGet, apiPut, apiDelete, apiPost } from '../utils/api';
import './PostDetail.css';

export async function loader({ params }) {
  try {
    const [postData, authorData] = await Promise.all([
      apiGet(`/api/author/posts/${params.id}`),
      apiGet('/api/author/profile')
    ]);
    return { post: postData.post, author: authorData.author };
  } catch (error) {
    throw new Response('Post not found', { status: 404 });
  }
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'update-post') {
    const title = formData.get('title');
    const content = formData.get('content');

    try {
      await apiPut(`/api/author/posts/${params.id}`, { title, content });
      return { success: true };
    } catch (error) {
      return { error: error.message || 'Failed to update post' };
    }
  }

  if (intent === 'delete-post') {
    try {
      await apiDelete(`/api/author/posts/${params.id}`);
      return { success: true, redirect: '/' };
    } catch (error) {
      return { error: error.message || 'Failed to delete post' };
    }
  }

  if (intent === 'create-comment') {
    const postId = parseInt(formData.get('postId'));
    const parentCommentId = formData.get('parentCommentId');
    const content = formData.get('content');

    const body = {
      postId,
      content,
      parentCommentId: parentCommentId === '' ? null : parseInt(parentCommentId)
    };

    try {
      const data = await apiPost('/api/comments', body);
      return { success: true, comment: data.comment };
    } catch (error) {
      return { error: error.message || 'Failed to post comment' };
    }
  }

  if (intent === 'delete-comment') {
    const commentId = formData.get('commentId');

    try {
      await apiDelete(`/api/comments/${commentId}`);
      return { success: true };
    } catch (error) {
      return { error: error.message || 'Failed to delete comment' };
    }
  }

  return { error: 'Unknown action' };
}

export default function PostDetail() {
  const { post, author } = useLoaderData();
  const actionData = useActionData();
  const [isEditing, setIsEditing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Handle redirects
  if (actionData?.success && actionData.redirect === '/') {
    window.location.href = '/';
    return null;
  }

  if (actionData?.success) {
    window.location.reload(); // Refresh to show new comment
  }

  return (
    <div className="post-detail-container">
      <Link to="/" className="back-button">← Back to Posts</Link>

      <article className="post">
        {isEditing ? (
          <Form method="post" className="edit-form">
            <input type="hidden" name="intent" value="update-post" />
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={post.title}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Content:</label>
              <textarea
                id="content"
                name="content"
                defaultValue={post.content}
                rows="10"
                required
              />
            </div>
            <div className="button-group">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </Form>
        ) : (
          <>
            <h1>{post.title}</h1>
            <p className="post-meta">
              By {post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <div className="post-content">{post.content}</div>
            <div className="button-group">
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <Form method="post" onSubmit={(e) => {
                if (!window.confirm('Delete this post?')) {
                  e.preventDefault();
                }
              }}>
                <input type="hidden" name="intent" value="delete-post" />
                <button type="submit" className="delete-button">Delete</button>
              </Form>
            </div>
          </>
        )}
      </article>

      <section className="comments-section">
        <h2>Comments ({post.comments?.length || 0})</h2>

        <Form method="post" className="comment-form">
          <input type="hidden" name="intent" value="create-comment" />
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="parentCommentId" value="" />
          <textarea
            name="content"
            placeholder="Write a comment..."
            required
            rows="3"
          />
          <button type="submit">Post Comment</button>
        </Form>

        {post.comments?.length === 0 ? (
          <p>No comments yet</p>
        ) : (
          <div className="comments-list">
            {post.comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                author={author}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                postId={post.id}
              />
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

function CommentCard({ comment, author, replyingTo, setReplyingTo, replyContent, setReplyContent, postId }) {
  const canDelete = author && comment.userId === author.id;

  return (
    <div className="comment">
      <div className="comment-header">
        <span className="comment-author">
          {comment.user?.username || 'Anonymous'}
        </span>
        <small className="comment-date">
          {new Date(comment.createdAt).toLocaleDateString()}
        </small>
      </div>

      <p className="comment-content">{comment.content}</p>

      <div className="comment-actions">
        <button
          onClick={() => setReplyingTo(comment.id)}
          className="reply-button"
        >
          Reply
        </button>
        {canDelete && (
          <Form method="post" style={{ display: 'inline' }}>
            <input type="hidden" name="intent" value="delete-comment" />
            <input type="hidden" name="commentId" value={comment.id} />
            <button
              type="submit"
              onClick={(e) => {
                if (!window.confirm('Delete this comment?')) {
                  e.preventDefault();
                }
              }}
              className="delete-button"
            >
              Delete
            </button>
          </Form>
        )}
      </div>

      {replyingTo === comment.id && (
        <Form method="post" className="reply-form">
          <input type="hidden" name="intent" value="create-comment" />
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="parentCommentId" value={comment.id} />
          <textarea
            name="content"
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows="2"
            autoFocus
          />
          <div className="reply-actions">
            <button type="submit">Post Reply</button>
            <button type="button" onClick={() => setReplyingTo(null)}>Cancel</button>
          </div>
        </Form>
      )}

      {comment.replys?.length > 0 && (
        <div className="replies">
          {comment.replys.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              author={author}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  error: {
    padding: '10px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '5px',
    marginTop: '20px'
  }
};