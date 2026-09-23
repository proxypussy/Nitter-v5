'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [unblurredPosts, setUnblurredPosts] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error) setPosts(data || []);
  };

  const handleAuth = async (type) => {
    const action = type === 'login' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await action({ email, password });
    if (error) alert(error.message);
    else location.reload();
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    const { error } = await supabase.from('posts').insert([
      { user_id: user.id, content, is_spoiler: isSpoiler },
    ]);
    if (!error) {
      setContent('');
      setIsSpoiler(false);
      fetchPosts();
    }
  };

  const toggleBlur = (id) => {
    setUnblurredPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
        <h2>ログイン / 新規登録</h2>
        <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
        <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
        <button onClick={() => handleAuth('login')}>ログイン</button>
        <button onClick={() => handleAuth('signup')} style={{ marginLeft: 10 }}>新規登録</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1>SNS タイムライン</h1>
        <button onClick={() => supabase.auth.signOut().then(() => location.reload())}>ログアウト</button>
      </header>
      <form onSubmit={handlePost} style={{ marginBottom: 30, background: '#f5f5f5', padding: 15, borderRadius: 8 }}>
        <textarea placeholder="いまどうしてる？" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', height: 80, borderRadius: 4, padding: 8 }} />
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <label style={{ color: '#e91e63', fontWeight: 'bold' }}>
            <input type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} /> 🌸 ピンクボタン（ぼかし）
          </label>
          <button type="submit" style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4 }}>投稿する</button>
        </div>
      </form>
      <div>
        {posts.map((post) => {
          const isBlurred = post.is_spoiler && !unblurredPosts[post.id];
          return (
            <div key={post.id} style={{ borderBottom: '1px solid #ddd', padding: '15px 0' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 5 }}>
                {post.profiles?.display_name || 'ユーザー'} <span style={{ color: '#888', fontWeight: 'normal' }}>@{post.profiles?.username}</span>
              </div>
              <div style={{
                filter: isBlurred ? 'blur(6px)' : 'none',
                userSelect: isBlurred ? 'none' : 'text',
                background: isBlurred ? '#fce4ec' : 'transparent',
                padding: isBlurred ? 10 : 0, borderRadius: 4
              }}>
                {post.content}
              </div>
              {post.is_spoiler && (
                <button onClick={() => toggleBlur(post.id)} style={{ marginTop: 8, background: '#e91e63', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px' }}>
                  {isBlurred ? '👁️ ぼかし解除' : '🙈 再度ぼかす'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
