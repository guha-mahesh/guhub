import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { blogPosts } from '../data/blog';
import type { BlogPost } from '../data/blog';
import './BlogPage.css';

const BlogPage = () => {
  const [open, setOpen] = useState<BlogPost | null>(null);

  if (open) {
    return (
      <div className="blogPage">
        <div className="blogContainer">
          <button className="blogBack" onClick={() => setOpen(null)}>
            ← back
          </button>
          <article className="postFull">
            <header className="postFullHeader">
              <p className="postDate">{open.date}</p>
              <h1 className="postFullTitle">{open.title}</h1>
              <div className="postTags">
                {open.tags.map(t => (
                  <span key={t} className="postTag">#{t}</span>
                ))}
              </div>
            </header>
            <div className="postBody">
              <ReactMarkdown>{open.body}</ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="blogPage">
      <div className="blogContainer">
        <div className="blogHeader">
          <p className="blogLabel">&gt; writing</p>
          <h1 className="blogTitle">blog</h1>
          <p className="blogSub">notes on things I'm thinking about</p>
        </div>

        <div className="postList">
          {blogPosts.map(post => (
            <button
              key={post.slug}
              className="postRow"
              onClick={() => setOpen(post)}
            >
              <div className="postRowLeft">
                <span className="postDate">{post.date}</span>
                <h2 className="postRowTitle">{post.title}</h2>
                <p className="postExcerpt">{post.excerpt}</p>
              </div>
              <div className="postRowRight">
                <div className="postTags">
                  {post.tags.map(t => (
                    <span key={t} className="postTag">#{t}</span>
                  ))}
                </div>
                <span className="postArrow">→</span>
              </div>
            </button>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <p className="blogEmpty">// nothing yet</p>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
