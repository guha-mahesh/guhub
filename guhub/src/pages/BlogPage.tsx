import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Link } from 'react-router-dom';
import { supabase, type Post } from '../lib/supabase';
import { useMeta, metaLabel } from '../contexts/MetaContext';
import './BlogPage.css';

type View = 'list' | 'post';

// Static items pinned at the top of the log. Edit this list to add more.
const PINNED: Array<{ to: string; date: string; title: string; tags: string[]; excerpt?: string }> = [
  {
    to: '/music/2',
    date: 'all time',
    title: 'Top 25 Albums (All Time)',
    tags: ['music', 'list'],
    excerpt: 'the ones I keep coming back to',
  },
  {
    to: '/music/1',
    date: '2025',
    title: 'Top Albums 2025',
    tags: ['music', 'list'],
    excerpt: '10 albums that defined my year',
  },
];

export default function BlogPage() {
  const { level } = useMeta();
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false); });
  }, []);

  if (view === 'post' && open) return (
    <div className="blogPage">
      <div className="blogContainer">
        <div className="blogPostNav">
          <button className="blogBack" onClick={() => { setView('list'); setOpen(null); }}>← back</button>
        </div>
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
          <p className="blogLabel">&gt; log</p>
          <h1 className="blogTitle">{level > 0 ? `${metaLabel(level).toLowerCase()} log` : 'log'}</h1>
          <p className="blogSub">writing, lists, references </p>
        </div>

        <div className="postList">
          {PINNED.map(item => (
            <Link key={item.to} to={item.to} className="postRow">
              <div className="postRowLeft">
                <span className="postDate">{item.date}</span>
                <h2 className="postRowTitle">{item.title}</h2>
                {item.excerpt && <p className="postExcerpt">{item.excerpt}</p>}
              </div>
              <div className="postRowRight">
                <div className="postTags">{item.tags.map(t => <span key={t} className="postTag">#{t}</span>)}</div>
                <span className="postArrow">→</span>
              </div>
            </Link>
          ))}

          {loading && <p className="blogEmpty">...</p>}

          {posts.map(post => (
            <button key={post.id} className="postRow" onClick={() => { setOpen(post); setView('post'); }}>
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
      </div>
    </div>
  );
}
