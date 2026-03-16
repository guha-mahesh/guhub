import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { supabase, type Post } from '../lib/supabase';
import './BlogPage.css';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  if (open) return (
    <div className="blogPage">
      <div className="blogContainer">
        <button className="blogBack" onClick={() => setOpen(null)}>← back</button>
        <article className="postFull">
          <header className="postFullHeader">
            <p className="postDate">{open.created_at.slice(0, 10)}</p>
            <h1 className="postFullTitle">{open.title}</h1>
            <div className="postTags">{open.tags.map(t => <span key={t} className="postTag">#{t}</span>)}</div>
          </header>
          <div className="postBody">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {open.body}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );

  return (
    <div className="blogPage">
      <div className="blogContainer">
        <div className="blogHeader">
          <p className="blogLabel">&gt; writing</p>
          <h1 className="blogTitle">blog</h1>
          <p className="blogSub">notes on things I'm thinking about</p>
        </div>
        {loading ? (
          <p className="blogEmpty">...</p>
        ) : posts.length === 0 ? (
          <p className="blogEmpty">// nothing yet</p>
        ) : (
          <div className="postList">
            {posts.map(post => (
              <button key={post.id} className="postRow" onClick={() => setOpen(post)}>
                <div className="postRowLeft">
                  <span className="postDate">{post.created_at.slice(0, 10)}</span>
                  <h2 className="postRowTitle">{post.title}</h2>
                  {post.excerpt && <p className="postExcerpt">{post.excerpt}</p>}
                </div>
                <div className="postRowRight">
                  <div className="postTags">{post.tags.map(t => <span key={t} className="postTag">#{t}</span>)}</div>
                  <span className="postArrow">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
