//// filepath: /client/src/Forum.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import axios from 'axios';
import { API_URL } from './config';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './Forum.css';

function Forum() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    category: 'discussion'
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Categories for forum posts
  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'discussion', name: 'General Discussion' },
    { id: 'technical', name: 'Technical Analysis' },
    { id: 'fundamental', name: 'Fundamental Analysis' },
    { id: 'beginner', name: 'Beginner Questions' },
    { id: 'news', name: 'Market News' }
  ];

  // Fetch posts on component mount and when category changes
  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  // Fetch comments when a post is selected
  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id);
    }
  }, [selectedPost]);

  // Mock API function to fetch posts - replace with actual API when ready
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // In a real app, use axios call to backend API
      // const response = await axios.get(`${API_URL}/forum/posts`);
      
      // For now, using mock data
      setTimeout(() => {
        const mockPosts = generateMockPosts();
        const filteredPosts = activeCategory === 'all' 
          ? mockPosts 
          : mockPosts.filter(post => post.category === activeCategory);
        setPosts(filteredPosts);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load forum posts');
      setLoading(false);
    }
  };

  // Mock API function to fetch comments
  const fetchComments = async (postId) => {
    if (!postId) return;
    
    setLoadingComments(true);
    try {
      // In a real app, use axios call
      // const response = await axios.get(`${API_URL}/forum/posts/${postId}/comments`);
      
      // For now, using mock data
      setTimeout(() => {
        setComments(generateMockComments(postId));
        setLoadingComments(false);
      }, 300);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
      setLoadingComments(false);
    }
  };

  // Handle creating a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create a post');
      return;
    }
    
    if (!newPostData.title.trim() || !newPostData.content.trim()) {
      toast.error('Please provide both title and content for your post');
      return;
    }

    try {
      // In a real app, use axios to post data
      // await axios.post(`${API_URL}/forum/posts`, newPostData, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      // For now, just add to local state
      const newPost = {
        id: Date.now(),
        title: newPostData.title,
        content: newPostData.content,
        category: newPostData.category,
        userName: user?.name || 'Anonymous User',
        createdAt: new Date().toISOString(),
        commentCount: 0
      };
      
      setPosts([newPost, ...posts]);
      setNewPostData({ title: '', content: '', category: 'discussion' });
      setShowNewPostForm(false);
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please login to add a comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      // In a real app, use axios to post comment
      // await axios.post(`${API_URL}/forum/posts/${selectedPost.id}/comments`, 
      //   { content: newComment },
      //   { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      // );
      
      // For now, just add to local state
      const newCommentObj = {
        id: Date.now(),
        postId: selectedPost.id,
        content: newComment,
        userName: user?.name || 'Anonymous User',
        createdAt: new Date().toISOString()
      };
      
      setComments([...comments, newCommentObj]);
      setNewComment('');
      
      // Update comment count in the post
      const updatedPosts = posts.map(post => 
        post.id === selectedPost.id 
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      );
      setPosts(updatedPosts);
      setSelectedPost({...selectedPost, commentCount: (selectedPost.commentCount || 0) + 1});
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  // Function to generate mock posts
  const generateMockPosts = () => {
    return [
      {
        id: 1,
        title: 'Thoughts on the recent Nifty movement?',
        content: 'I\'ve been watching the Nifty index closely over the past week and noticed some interesting patterns. The index seems to be consolidating after the recent rally. What are your thoughts on where it\'s headed next? Is this a good time to start accumulating quality stocks or should we wait for a further correction?',
        category: 'technical',
        userName: 'Rahul Sharma',
        createdAt: '2023-11-02T14:35:00Z',
        commentCount: 5
      },
      {
        id: 2,
        title: 'Best brokerage for beginners in India?',
        content: 'I\'m looking to start investing in stocks. Which brokerages do you recommend for beginners? I\'m looking for low fees, good UI, and educational resources. Any suggestions would be greatly appreciated!',
        category: 'beginner',
        userName: 'Priya Patel',
        createdAt: '2023-11-02T10:12:00Z',
        commentCount: 8
      },
      {
        id: 3,
        title: 'Analysis of Q2 results for IT sector',
        content: 'With most major IT companies having declared their Q2 results, I wanted to start a discussion about the overall performance of the sector. TCS, Infosys, and Wipro have all shown different trends. Let\'s analyze what this might mean for the sector going forward.',
        category: 'fundamental',
        userName: 'Vikram Malhotra',
        createdAt: '2023-11-01T18:45:00Z',
        commentCount: 3
      },
      {
        id: 4,
        title: 'RBI policy impact on banking stocks',
        content: 'The recent RBI monetary policy announcement has kept rates unchanged. How do you think this will affect banking stocks in the short to medium term? I\'m particularly interested in how private banks might perform compared to PSU banks.',
        category: 'news',
        userName: 'Deepak Joshi',
        createdAt: '2023-10-31T09:30:00Z',
        commentCount: 6
      },
      {
        id: 5,
        title: 'Favorite technical indicators for intraday trading?',
        content: 'I\'m looking to improve my intraday trading strategy. What technical indicators do you find most reliable for intraday decisions in the Indian market context? I currently use RSI, MACD and Bollinger Bands.',
        category: 'technical',
        userName: 'Anjali Desai',
        createdAt: '2023-10-30T15:20:00Z',
        commentCount: 12
      },
      {
        id: 6,
        title: 'Understanding PE ratios for new investors',
        content: 'Could someone explain how to properly evaluate PE ratios for different sectors? I understand the basic concept but I\'m not sure how to compare PE ratios across different industries or what\'s considered "high" or "low" in the Indian market.',
        category: 'beginner',
        userName: 'Rajesh Kumar',
        createdAt: '2023-10-30T11:05:00Z',
        commentCount: 7
      },
      {
        id: 7,
        title: 'Discussion: Impact of festive season on consumer stocks',
        content: 'With Diwali and the festive season upon us, how do you think consumer goods stocks will perform in Q3? Historical trends suggest a bump in sales, but with inflation concerns, will this year be different?',
        category: 'discussion',
        userName: 'Meera Singh',
        createdAt: '2023-10-29T16:48:00Z',
        commentCount: 4
      }
    ];
  };

  // Function to generate mock comments for a post
  const generateMockComments = (postId) => {
    const commentsByPost = {
      1: [
        { id: 101, postId: 1, userName: 'Vikram Malhotra', content: 'I think we might see some sideways movement before the next leg up. The global cues are mixed right now.', createdAt: '2023-11-02T15:10:00Z' },
        { id: 102, postId: 1, userName: 'Priya Patel', content: 'I\'ve been looking at the option chain data and it suggests strong resistance at 19,500.', createdAt: '2023-11-02T15:45:00Z' },
        { id: 103, postId: 1, userName: 'Deepak Joshi', content: 'Technically speaking, the index is trading above all major moving averages which is a bullish sign.', createdAt: '2023-11-02T16:20:00Z' },
        { id: 104, postId: 1, userName: 'Meera Singh', content: 'FII flows will be crucial to watch in the coming weeks.', createdAt: '2023-11-02T17:05:00Z' },
        { id: 105, postId: 1, userName: 'Rahul Sharma', content: 'Thanks everyone for your insights! Really helpful perspectives.', createdAt: '2023-11-02T18:30:00Z' }
      ],
      2: [
        { id: 201, postId: 2, userName: 'Deepak Joshi', content: 'Zerodha is great for beginners - simple UI and low brokerage.', createdAt: '2023-11-02T10:30:00Z' },
        { id: 202, postId: 2, userName: 'Anjali Desai', content: 'I second Zerodha. Their Varsity platform is amazing for learning too.', createdAt: '2023-11-02T11:15:00Z' },
        { id: 203, postId: 2, userName: 'Vikram Malhotra', content: 'Upstox is another good option with competitive pricing.', createdAt: '2023-11-02T12:40:00Z' }
      ]
    };
    
    return commentsByPost[postId] || [];
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString; // Return the original string if formatting fails
    }
  };

  return (
    <div className="forum-container">
      <h1 className="forum-title">Community Forum</h1>
      <p className="forum-description">
        Discuss trading strategies, market trends, and investment ideas with fellow traders.
      </p>

      <div className="forum-header">
        <div className="category-filters">
          {categories.map(category => (
            <button 
              key={category.id} 
              className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        {user ? (
          <button 
            className="new-post-button"
            onClick={() => setShowNewPostForm(!showNewPostForm)}
          >
            {showNewPostForm ? 'Cancel' : 'Create New Post'}
          </button>
        ) : (
          <Link to="/login" className="login-to-post">
            Login to Post
          </Link>
        )}
      </div>
      
      {/* New Post Form */}
      {showNewPostForm && user && (
        <div className="new-post-form">
          <h3>Create a New Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label htmlFor="post-title">Title</label>
              <input
                type="text"
                id="post-title"
                placeholder="Enter a title for your post"
                value={newPostData.title}
                onChange={(e) => setNewPostData({...newPostData, title: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="post-content">Content</label>
              <textarea
                id="post-content"
                placeholder="Write your post content here..."
                value={newPostData.content}
                onChange={(e) => setNewPostData({...newPostData, content: e.target.value})}
                rows={5}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                value={newPostData.category}
                onChange={(e) => setNewPostData({...newPostData, category: e.target.value})}
              >
                {categories.filter(cat => cat.id !== 'all').map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-post">Post</button>
              <button type="button" className="cancel" onClick={() => setShowNewPostForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      {/* Main Content Area - Posts List or Post Details */}
      <div className="forum-content">
        {loading ? (
          <div className="loading">Loading forum posts...</div>
        ) : selectedPost ? (
          // Show selected post and its comments
          <div className="post-detail">
            <button className="back-button" onClick={() => setSelectedPost(null)}>
              ← Back to Posts
            </button>
            
            <div className="post-detail-content">
              <h2>{selectedPost.title}</h2>
              <div className="post-meta">
                <span className="post-author">Posted by {selectedPost.userName}</span>
                <span className="post-date">{formatDate(selectedPost.createdAt)}</span>
                <span className="post-category">{categories.find(c => c.id === selectedPost.category)?.name || selectedPost.category}</span>
              </div>
              <div className="post-body">
                {selectedPost.content}
              </div>
            </div>
            
            <div className="comments-section">
              <h3>Comments ({comments.length})</h3>
              
              {loadingComments ? (
                <div className="loading">Loading comments...</div>
              ) : (
                <>
                  <div className="comments-list">
                    {comments.length > 0 ? (
                      comments.map(comment => (
                        <div key={comment.id} className="comment">
                          <div className="comment-header">
                            <span className="comment-author">{comment.userName}</span>
                            <span className="comment-date">{formatDate(comment.createdAt)}</span>
                          </div>
                          <div className="comment-content">
                            {comment.content}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-comments">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                  
                  <div className="add-comment">
                    <h4>Add Your Comment</h4>
                    {user ? (
                      <>
                        <textarea
                          placeholder="Write your comment here..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        ></textarea>
                        <button onClick={handleAddComment}>Submit Comment</button>
                      </>
                    ) : (
                      <div className="login-prompt">
                        <p>Please <Link to="/login">login</Link> to add a comment.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          // Show list of posts
          <>
            {posts.length > 0 ? (
              <div className="posts-list">
                {posts.map(post => (
                  <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
                    <h3 className="post-title">{post.title}</h3>
                    <div className="post-meta">
                      <span className="post-author">Posted by {post.userName}</span>
                      <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="post-preview">
                      {post.content.substring(0, 150)}
                      {post.content.length > 150 ? '...' : ''}
                    </div>
                    <div className="post-footer">
                      <span className="post-category">{categories.find(c => c.id === post.category)?.name || post.category}</span>
                      <span className="comment-count">{post.commentCount || 0} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-posts">
                <p>No posts found in this category.</p>
                {user ? (
                  <button className="create-first" onClick={() => setShowNewPostForm(true)}>
                    Create the first post
                  </button>
                ) : (
                  <Link to="/login" className="login-to-post">
                    Login to create a post
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Community Guidelines */}
      <div className="forum-guidelines">
        <h4>Community Guidelines</h4>
        <ul>
          <li>Be respectful to fellow community members</li>
          <li>Do not spam or post promotional content</li>
          <li>Avoid sharing specific buy/sell recommendations</li>
          <li>Back up claims with research when possible</li>
          <li>Remember that all trading involves risk</li>
        </ul>
      </div>
    </div>
  );
}

export default Forum;