import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import MDEditor from '@uiw/react-md-editor';
import 'katex/dist/katex.min.css';
import { supabase, type Post } from '../lib/supabase';
import './BlogPage.css';

const ADMIN_KEY = 'guha-admin-2026';

type View = 'list' | 'post' | 'editor' | 'login';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');

  // admin state
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('admin') === ADMIN_KEY) setAuthed(true);
  }, []);

  const loadPosts = () =>
    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false); });

  useEffect(() => { loadPosts(); }, []);

  const login = () => {
    if (pw === 'guha2026') { sessionStorage.setItem('admin', ADMIN_KEY); setAuthed(true); setView('list'); }
    else setMsg('wrong password');
  };

  const openEditor = (post?: Partial<Post>) => {
    setEditing(post ?? { title: '', slug: '', body: '', excerpt: '', tags: [], published: false });
    setView('editor');
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const slug = editing.slug || editing.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';
    const payload = { ...editing, slug, updated_at: new Date().toISOString() };
    if (editing.id) {
      await supabase.from('posts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('posts').insert({ ...payload, created_at: new Date().toISOString() });
    }
    setSaving(false);
    setEditing(null);
    setView('list');
    setMsg('saved ✓');
    loadPosts();
    setTimeout(() => setMsg(''), 3000);
  };

  const del = async (id: string) => {
    if (!confirm('delete?')) return;
    await supabase.from('posts').delete().eq('id', id);
    loadPosts();
  };

  // ── LOGIN ──
  if (view === 'login') return (
    <div className="blogPage blogLoginWrap">
      <div className="blogLoginBox">
        <button className="blogBack" onClick={() => setView('list')}>← back</button>
        <input className="blogAdminInput" type="password" placeholder="password" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} autoFocus />
        <button className="blogAdminBtn" onClick={login}>enter</button>
        {msg && <p className="blogAdminMsg">{msg}</p>}
      </div>
    </div>
  );

  // ── EDITOR ──
  if (view === 'editor' && editing !== null) return (
    <div className="blogPage blogEditorWrap" data-color-mode="dark">
      <div className="blogEditorHeader">
        <button className="blogBack" onClick={() => setView('list')}>← back</button>
        <span className="blogEditorLabel">{editing.id ? 'edit post' : 'new post'}</span>
        <div className="blogEditorActions">
          <label className="blogToggle">
            <input type="checkbox" checked={!!editing.published}
              onChange={e => setEditing({ ...editing, published: e.target.checked })} />
            published
          </label>
          <button className="blogAdminBtn" onClick={save} disabled={saving}>{saving ? '...' : 'save'}</button>
        </div>
      </div>
      <div className="blogEditorFields">
        <input className="blogAdminInput blogTitleInput" placeholder="title" value={editing.title ?? ''}
          onChange={e => setEditing({ ...editing, title: e.target.value })} />
        <input className="blogAdminInput" placeholder="slug (auto-generated if empty)" value={editing.slug ?? ''}
          onChange={e => setEditing({ ...editing, slug: e.target.value })} />
        <input className="blogAdminInput" placeholder="excerpt" value={editing.excerpt ?? ''}
          onChange={e => setEditing({ ...editing, excerpt: e.target.value })} />
        <input className="blogAdminInput" placeholder="tags (comma separated)"
          value={(editing.tags ?? []).join(', ')}
          onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
      </div>
      <MDEditor value={editing.body ?? ''} onChange={v => setEditing({ ...editing, body: v ?? '' })}
        height={520} preview="live" />
      {msg && <p className="blogAdminMsg">{msg}</p>}
    </div>
  );

  // ── POST VIEW ──
  if (view === 'post' && open) return (
    <div className="blogPage">
      <div className="blogContainer">
        <div className="blogPostNav">
          <button className="blogBack" onClick={() => { setView('list'); setOpen(null); }}>← back</button>
          {authed && <button className="blogEditBtn" onClick={() => openEditor(open)}>edit</button>}
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

  // ── LIST ──
  return (
    <div className="blogPage">
      <div className="blogContainer">
        <div className="blogHeader">
          <div className="blogHeaderRow">
            <div>
              <p className="blogLabel">&gt; writing</p>
              <h1 className="blogTitle">blog</h1>
            </div>
            {authed
              ? <button className="blogNewBtn" onClick={() => openEditor()}>+</button>
              : <button className="blogAdminGate" onClick={() => setView('login')}>admin</button>
            }
          </div>
          <p className="blogSub">notes on things I'm thinking about</p>
        </div>
        {msg && <p className="blogAdminMsg">{msg}</p>}
        {loading ? (
          <p className="blogEmpty">...</p>
        ) : posts.length === 0 ? (
          <p className="blogEmpty">// nothing yet</p>
        ) : (
          <div className="postList">
            {posts.map(post => (
              <button key={post.id} className="postRow" onClick={() => { setOpen(post); setView('post'); }}>
                <div className="postRowLeft">
                  <span className="postDate">{post.created_at.slice(0, 10)}</span>
                  <h2 className="postRowTitle">{post.title}</h2>
                  {post.excerpt && <p className="postExcerpt">{post.excerpt}</p>}
                </div>
                <div className="postRowRight">
                  <div className="postTags">{post.tags.map(t => <span key={t} className="postTag">#{t}</span>)}</div>
                  {authed && (
                    <button className="blogEditBtn small" onClick={e => { e.stopPropagation(); del(post.id); }}>×</button>
                  )}
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
