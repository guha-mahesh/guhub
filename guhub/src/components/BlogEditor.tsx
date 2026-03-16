import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { supabase, type Post } from '../lib/supabase';
import './BlogEditor.css';

interface Props {
  onClose: () => void;
}

type View = 'list' | 'edit';

const empty = (): Partial<Post> => ({
  title: '', slug: '', body: '', excerpt: '', tags: [], published: false,
});

export default function BlogEditor({ onClose }: Props) {
  const [view, setView] = useState<View>('list');
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Partial<Post>>(empty());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title?.trim()) { flash('title required'); return; }
    setSaving(true);
    const slug = editing.slug?.trim() ||
      editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const now = new Date().toISOString();
    const payload = { ...editing, slug, updated_at: now };
    if (editing.id) {
      await supabase.from('posts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('posts').insert({ ...payload, created_at: now });
    }
    setSaving(false);
    flash('saved');
    load();
    setView('list');
  };

  const del = async (id: string) => {
    if (!confirm('delete post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    flash('deleted');
    load();
  };

  const newPost = () => { setEditing(empty()); setView('edit'); };
  const editPost = (p: Post) => { setEditing(p); setView('edit'); };

  return (
    <div className="be-overlay" data-color-mode="dark">
      <div className="be-modal">

        {/* Header */}
        <div className="be-header">
          {view === 'edit' ? (
            <button className="be-back" onClick={() => setView('list')}>← posts</button>
          ) : (
            <span className="be-title">// blog</span>
          )}
          <div className="be-header-right">
            {view === 'list' && (
              <button className="be-action-btn" onClick={newPost}>+ new</button>
            )}
            {view === 'edit' && (
              <>
                <label className="be-toggle">
                  <input
                    type="checkbox"
                    checked={!!editing.published}
                    onChange={e => setEditing({ ...editing, published: e.target.checked })}
                  />
                  <span className={editing.published ? 'be-pub' : 'be-draft'}>
                    {editing.published ? 'live' : 'draft'}
                  </span>
                </label>
                <button className="be-save-btn" onClick={save} disabled={saving}>
                  {saving ? '...' : 'save'}
                </button>
              </>
            )}
            <button className="be-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* List view */}
        {view === 'list' && (
          <div className="be-list">
            {posts.length === 0 && (
              <p className="be-empty">// no posts yet — hit + new to write something</p>
            )}
            {posts.map(p => (
              <div key={p.id} className="be-row">
                <span className={`be-status ${p.published ? 'live' : 'draft'}`}>
                  {p.published ? 'live' : 'draft'}
                </span>
                <span className="be-date">{p.created_at.slice(0, 10)}</span>
                <span className="be-row-title">{p.title}</span>
                <div className="be-row-actions">
                  <button className="be-link" onClick={() => editPost(p)}>edit</button>
                  <button className="be-link danger" onClick={() => del(p.id)}>del</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit view */}
        {view === 'edit' && (
          <div className="be-edit">
            <div className="be-fields">
              <input
                className="be-input be-input-title"
                placeholder="title"
                value={editing.title ?? ''}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                autoFocus
              />
              <div className="be-fields-row">
                <input
                  className="be-input"
                  placeholder="slug (auto)"
                  value={editing.slug ?? ''}
                  onChange={e => setEditing({ ...editing, slug: e.target.value })}
                />
                <input
                  className="be-input"
                  placeholder="tags, comma, separated"
                  value={(editing.tags ?? []).join(', ')}
                  onChange={e => setEditing({
                    ...editing,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                />
              </div>
              <input
                className="be-input"
                placeholder="excerpt (optional)"
                value={editing.excerpt ?? ''}
                onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
              />
            </div>
            <div className="be-mde-wrap">
              <MDEditor
                value={editing.body ?? ''}
                onChange={v => setEditing({ ...editing, body: v ?? '' })}
                height="100%"
                preview="live"
                style={{ flex: 1, minHeight: 0 }}
              />
            </div>
          </div>
        )}

        {toast && <div className="be-toast">{toast}</div>}
      </div>
    </div>
  );
}
