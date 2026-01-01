import { useState, useEffect } from 'react';
import './CommentSection.css';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
}

interface CommentSectionProps {
  pageId: string; // unique identifier for each page (e.g., "music-1")
}

const ANONYMOUS_NAMES = [
  'Anonymous Moth', 'Anonymous Raven', 'Anonymous Fox', 'Anonymous Wolf',
  'Anonymous Owl', 'Anonymous Cat', 'Anonymous Bear', 'Anonymous Deer',
  'Anonymous Rabbit', 'Anonymous Crow', 'Anonymous Hawk', 'Anonymous Lynx'
];

const CommentSection = ({ pageId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  const storageKey = `comments-${pageId}`;
  const votesKey = `comment-votes-${pageId}`;

  useEffect(() => {
    // Load comments from localStorage
    try {
      const stored = localStorage.getItem(storageKey);
      console.log('Loading comments for', pageId, ':', stored);
      if (stored) {
        const parsedComments = JSON.parse(stored);
        // Load user votes
        const storedVotes = localStorage.getItem(votesKey);
        const votes = storedVotes ? JSON.parse(storedVotes) : {};

        // Merge votes into comments
        const commentsWithVotes = parsedComments.map((comment: Comment) => ({
          ...comment,
          userVote: votes[comment.id] || null
        }));

        setComments(commentsWithVotes);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, [storageKey, votesKey, pageId]);

  const saveComments = (updatedComments: Comment[]) => {
    try {
      // Save comments without userVote
      const commentsToStore = updatedComments.map(({ userVote, ...rest }) => rest);
      localStorage.setItem(storageKey, JSON.stringify(commentsToStore));
      console.log('Saved comments for', pageId, ':', JSON.stringify(commentsToStore));
      setComments(updatedComments);
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const saveVote = (commentId: string, vote: 'like' | 'dislike' | null) => {
    const storedVotes = localStorage.getItem(votesKey);
    const votes = storedVotes ? JSON.parse(storedVotes) : {};

    if (vote === null) {
      delete votes[commentId];
    } else {
      votes[commentId] = vote;
    }

    localStorage.setItem(votesKey, JSON.stringify(votes));
  };

  const getRandomName = () => {
    return ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const finalUsername = username.trim() || getRandomName();

    const comment: Comment = {
      id: Date.now().toString(),
      username: finalUsername,
      text: newComment.trim(),
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      userVote: null
    };

    const updatedComments = [comment, ...comments];
    saveComments(updatedComments);
    setNewComment('');
    setUsername('');
    setShowUsernameInput(false);
  };

  const handleVote = (commentId: string, voteType: 'like' | 'dislike') => {
    const updatedComments = comments.map(comment => {
      if (comment.id !== commentId) return comment;

      const currentVote = comment.userVote;
      let newLikes = comment.likes;
      let newDislikes = comment.dislikes;
      let newVote: 'like' | 'dislike' | null = null;

      // Remove previous vote
      if (currentVote === 'like') newLikes--;
      if (currentVote === 'dislike') newDislikes--;

      // Apply new vote if different
      if (currentVote !== voteType) {
        if (voteType === 'like') {
          newLikes++;
          newVote = 'like';
        } else {
          newDislikes++;
          newVote = 'dislike';
        }
      }

      saveVote(commentId, newVote);

      return {
        ...comment,
        likes: newLikes,
        dislikes: newDislikes,
        userVote: newVote
      };
    });

    saveComments(updatedComments);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="commentSection">
      <div className="commentHeader">
        <h2 className="commentTitle">Comments</h2>
        <span className="commentCount">{comments.length}</span>
      </div>

      <form onSubmit={handleSubmit} className="commentForm">
        {showUsernameInput && (
          <input
            type="text"
            placeholder="Anonymous name (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="usernameInput"
            maxLength={30}
          />
        )}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={() => setShowUsernameInput(true)}
          placeholder="drop your thoughts..."
          className="commentTextarea"
          maxLength={500}
          rows={3}
        />
        <div className="formFooter">
          <span className="charCount">{newComment.length}/500</span>
          <button
            type="submit"
            className="submitButton"
            disabled={!newComment.trim()}
          >
            post
          </button>
        </div>
      </form>

      <div className="commentsList">
        {comments.length === 0 ? (
          <p className="noComments">no comments yet. be the first to share your thoughts.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="commentMain">
                <div className="commentMeta">
                  <span className="commentUsername">{comment.username}</span>
                  <span className="commentTime">{formatTimestamp(comment.timestamp)}</span>
                </div>
                <p className="commentText">{comment.text}</p>
              </div>
              <div className="commentActions">
                <button
                  onClick={() => handleVote(comment.id, 'like')}
                  className={`voteButton ${comment.userVote === 'like' ? 'active' : ''}`}
                >
                  ↑ {comment.likes > 0 && comment.likes}
                </button>
                <button
                  onClick={() => handleVote(comment.id, 'dislike')}
                  className={`voteButton ${comment.userVote === 'dislike' ? 'active' : ''}`}
                >
                  ↓ {comment.dislikes > 0 && comment.dislikes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
