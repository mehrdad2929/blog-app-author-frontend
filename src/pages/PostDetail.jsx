import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedPost, setEditedPost] = useState({ title: '', content: '' });
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const token = localStorage.getItem('token');

            const postResponse = await fetch(`http://localhost:3000/api/author/posts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!postResponse.ok) {
                throw new Error('Post not found');
            }

            const postData = await postResponse.json();
            setPost(postData.post);
            setEditedPost({ title: postData.post.title, content: postData.post.content });

            // Organize flat comments into tree structure
            const organizedComments = organizeComments(postData.post.comments || []);
            setComments(organizedComments);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Transform flat comments array into nested structure
    const organizeComments = (flatComments) => {
        const commentMap = {};
        const rootComments = [];

        // First pass: create a map of all comments
        flatComments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
        });

        // Second pass: build the tree
        flatComments.forEach(comment => {
            if (comment.parentCommentId) {
                // This is a reply, add it to parent's replies
                if (commentMap[comment.parentCommentId]) {
                    commentMap[comment.parentCommentId].replies.push(commentMap[comment.id]);
                }
            } else {
                // This is a root comment
                rootComments.push(commentMap[comment.id]);
            }
        });

        return rootComments;
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3000/api/author/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Post deleted successfully');
                navigate('/');
            } else {
                alert('Failed to delete post');
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Error deleting post');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3000/api/author/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedPost)
            });

            if (response.ok) {
                const data = await response.json();
                setPost(data.post);
                setIsEditing(false);
                alert('Post updated successfully');
            } else {
                alert('Failed to update post');
            }
        } catch (err) {
            console.error('Error updating post:', err);
            alert('Error updating post');
        }
    };

    const handleCancelEdit = () => {
        setEditedPost({ title: post.title, content: post.content });
        setIsEditing(false);
    };

    // Submit top-level comment (to post)
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setSubmittingComment(true);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3000/api/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    postId: parseInt(id),
                    content: newComment,
                    parentCommentId: null  // Top-level comment
                })
            });

            if (response.ok) {
                setNewComment('');
                fetchPost(); // Refresh to show new comment
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to post comment');
            }
        } catch (err) {
            console.error('Failed to post comment:', err);
            alert('Error posting comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    // Submit reply to a comment
    const handleReplySubmit = async (parentCommentId) => {
        if (!replyContent.trim()) return;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3000/api/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    postId: parseInt(id),
                    content: replyContent,
                    parentCommentId: parentCommentId  // Reply to specific comment
                })
            });

            if (response.ok) {
                setReplyContent('');
                setReplyingTo(null);
                fetchPost(); // Refresh to show new reply
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to post reply');
            }
        } catch (err) {
            console.error('Failed to post reply:', err);
            alert('Error posting reply');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchPost(); // Refresh to remove deleted comment
            } else {
                alert('Failed to delete comment');
            }
        } catch (err) {
            alert('Error deleting comment');
        }
    };

    if (loading) return <div>Loading post...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!post) return <div>Post not found</div>;

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/')}>← Back to Posts</button>

            <article style={styles.post}>
                {isEditing ? (
                    <form onSubmit={handleUpdate}>
                        <div>
                            <label>Title:</label>
                            <input
                                type="text"
                                value={editedPost.title}
                                onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div>
                            <label>Content:</label>
                            <textarea
                                value={editedPost.content}
                                onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
                                style={styles.textarea}
                                rows="10"
                                required
                            />
                        </div>
                        <div style={styles.buttonGroup}>
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h1>{post.title}</h1>
                        <p style={styles.meta}>
                            By {post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <div style={styles.content}>
                            {post.content}
                        </div>
                        <div style={styles.buttonGroup}>
                            <button onClick={() => setIsEditing(true)}>Edit Post</button>
                            <button onClick={handleDelete} style={styles.deleteButton}>
                                Delete Post
                            </button>
                        </div>
                    </>
                )}
            </article>

            {/* Comments Section */}
            <section style={styles.commentsSection}>
                <h2>Comments ({post.comments?.length || 0})</h2>

                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
                    <textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        style={styles.commentInput}
                        rows="3"
                    />
                    <button type="submit" disabled={submittingComment}>
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>

                {/* Comments List */}
                {comments.length === 0 ? (
                    <p>No comments yet. Be the first to comment!</p>
                ) : (
                    <div style={styles.commentsList}>
                        {comments.map((comment) => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                postAuthorId={post.authorId}
                                onReply={(commentId) => {
                                    setReplyingTo(commentId);
                                    setReplyContent('');
                                }}
                                onDelete={handleDeleteComment}
                                replyingTo={replyingTo}
                                replyContent={replyContent}
                                setReplyContent={setReplyContent}
                                handleReplySubmit={handleReplySubmit}
                                cancelReply={() => setReplyingTo(null)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

// Recursive Comment Component
function Comment({
    comment,
    postAuthorId,
    onReply,
    onDelete,
    replyingTo,
    replyContent,
    setReplyContent,
    handleReplySubmit,
    cancelReply,
    depth = 0
}) {
    const token = localStorage.getItem('token');
    const decoded = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const isPostAuthor = decoded?.id === postAuthorId && decoded?.role === 'AUTHOR';
    const isCommentOwner = decoded?.id === comment.userId;

    return (
        <div style={{
            ...styles.comment,
            marginLeft: `${depth * 30}px`,
            borderLeft: depth > 0 ? '3px solid #ddd' : '3px solid #007bff'
        }}>
            <div style={styles.commentHeader}>
                <span style={styles.commentAuthor}>
                    {comment.user?.username || 'Anonymous'}
                    {comment.userId === postAuthorId && (
                        <span style={styles.authorBadge}>Author</span>
                    )}
                </span>
                <small style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                </small>
            </div>

            <p style={styles.commentContent}>{comment.content}</p>

            <div style={styles.commentActions}>
                {/* Only post author can reply to comments */}
                {isPostAuthor && (
                    <button
                        onClick={() => onReply(comment.id)}
                        style={styles.replyButton}
                    >
                        Reply
                    </button>
                )}

                {/* Only comment owner can delete */}
                {isCommentOwner && (
                    <button
                        onClick={() => onDelete(comment.id)}
                        style={styles.deleteCommentButton}
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
                <div style={styles.replyForm}>
                    <textarea
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        style={styles.replyInput}
                        rows="2"
                        autoFocus
                    />
                    <div style={styles.replyActions}>
                        <button
                            onClick={() => handleReplySubmit(comment.id)}
                            disabled={!replyContent.trim()}
                        >
                            Post Reply
                        </button>
                        <button
                            onClick={cancelReply}
                            style={styles.cancelButton}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Nested Replies (Recursive) */}
            {comment.replies && comment.replies.length > 0 && (
                <div style={styles.replies}>
                    {comment.replies.map((reply) => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            postAuthorId={postAuthorId}
                            onReply={onReply}
                            onDelete={onDelete}
                            replyingTo={replyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            handleReplySubmit={handleReplySubmit}
                            cancelReply={cancelReply}
                            depth={depth + 1}
                        />
                    ))}
                </div>
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
    post: {
        marginTop: '20px',
        marginBottom: '40px'
    },
    meta: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '20px'
    },
    content: {
        lineHeight: '1.6',
        fontSize: '16px',
        marginBottom: '20px',
        whiteSpace: 'pre-wrap'
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '5px'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontFamily: 'inherit',
        resize: 'vertical'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px'
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    commentsSection: {
        borderTop: '2px solid #ddd',
        paddingTop: '30px',
        marginTop: '40px'
    },
    commentForm: {
        marginBottom: '30px'
    },
    commentInput: {
        width: '100%',
        padding: '12px',
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical'
    },
    commentsList: {
        marginTop: '20px'
    },
    comment: {
        backgroundColor: '#f9f9f9',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '8px',
        transition: 'all 0.2s'
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    commentAuthor: {
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    authorBadge: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'normal'
    },
    commentDate: {
        color: '#999',
        fontSize: '12px'
    },
    commentContent: {
        margin: '10px 0',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap'
    },
    commentActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px'
    },
    replyButton: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '13px',
        padding: '5px 10px',
        fontWeight: '500'
    },
    deleteCommentButton: {
        background: 'none',
        border: 'none',
        color: '#dc3545',
        cursor: 'pointer',
        fontSize: '13px',
        padding: '5px 10px',
        fontWeight: '500'
    },
    replyForm: {
        marginTop: '15px',
        paddingLeft: '15px',
        borderLeft: '3px solid #007bff'
    },
    replyInput: {
        width: '100%',
        padding: '8px',
        marginBottom: '8px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '13px',
        fontFamily: 'inherit',
        resize: 'vertical'
    },
    replyActions: {
        display: 'flex',
        gap: '8px'
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '13px'
    },
    replies: {
        marginTop: '15px'
    }
};

export default PostDetail;
