import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { supabase, type Post } from '../lib/supabase';
import './AdminBlog.css';

const ADMIN_KEY = 'guha-admin-2026';

export default function AdminBlog() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('admin') === ADMIN_KEY) setAuthed(true);
  }, []);

  const login = () => {
    if (pw === 'guha2026') { sessionStorage.setItem('admin', ADMIN_KEY); setAuthed(true); }
    else setMsg('wrong password');
  };

  const loadPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data ?? []);
  };

  useEffect(() => { if (authed) loadPosts(); }, [authed]);

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
    setMsg('saved ✓');
    loadPosts();
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id: string) => {
    if (!confirm('delete?')) return;
    await supabase.from('posts').delete().eq('id', id);
    loadPosts();
  };

  if (!authed) return (
    <div className="adminLogin">
      <input className="adminInput" type="password" placeholder="password" value={pw}
        onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} autoFocus />
      <button className="adminBtn" onClick={login}>enter</button>
      {msg && <p className="adminMsg">{msg}</p>}
    </div>
  );

  if (editing !== null) return (
    <div className="adminEditor" data-color-mode="dark">
      <div className="adminEditorHeader">
        <button className="adminBack" onClick={() => setEditing(null)}>← back</button>
        <span className="adminEditorTitle">{editing.id ? 'edit post' : 'new post'}</span>
        <div className="adminEditorActions">
          <label className="adminToggle">
            <input type="checkbox" checked={!!editing.published}
              onChange={e => setEditing({ ...editing, published: e.target.checked })} />
            published
          </label>
          <button className="adminBtn" onClick={save} disabled={saving}>{saving ? '...' : 'save'}</button>
        </div>
      </div>
      <div className="adminFields">
        <input className="adminInput adminTitleInput" placeholder="title" value={editing.title ?? ''}
          onChange={e => setEditing({ ...editing, title: e.target.value })} />
        <input className="adminInput" placeholder="slug (auto-generated if empty)" value={editing.slug ?? ''}
          onChange={e => setEditing({ ...editing, slug: e.target.value })} />
        <input className="adminInput" placeholder="excerpt" value={editing.excerpt ?? ''}
          onChange={e => setEditing({ ...editing, excerpt: e.target.value })} />
        <input className="adminInput" placeholder="tags (comma separated)" value={(editing.tags ?? []).join(', ')}
          onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
      </div>
      <MDEditor
        value={editing.body ?? ''}
        onChange={v => setEditing({ ...editing, body: v ?? '' })}
        height={600}
        preview="live"
      />
      {msg && <p className="adminMsg">{msg}</p>}
    </div>
  );

  return (
    <div className="adminBlog">
      <div className="adminBlogHeader">
        <h1 className="adminBlogTitle">blog admin</h1>
        <button className="adminBtn" onClick={() => setEditing({ title: '', slug: '', body: '', excerpt: '', tags: [], published: false })}>
          + new post
        </button>
      </div>
      {msg && <p className="adminMsg">{msg}</p>}
      <div className="adminPostList">
        {posts.map(post => (
          <div key={post.id} className="adminPostRow">
            <div className="adminPostMeta">
              <span className={`adminStatus ${post.published ? 'pub' : 'draft'}`}>{post.published ? 'live' : 'draft'}</span>
              <span className="adminPostDate">{post.created_at.slice(0, 10)}</span>
            </div>
            <span className="adminPostTitle">{post.title}</span>
            <div className="adminPostActions">
              <button className="adminLinkBtn" onClick={() => setEditing(post)}>edit</button>
              <button className="adminLinkBtn danger" onClick={() => del(post.id)}>delete</button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="adminEmpty">// no posts yet</p>}
      </div>
    </div>
  );
}
