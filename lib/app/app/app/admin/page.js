'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPanel() {
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState([]);
  const ADMIN_SECRET = 'admin1234'; // 管理者二次認証パスワード（任意のパスワードに設定）

  const handleAuth = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_SECRET) {
      setIsAuthorized(true);
      fetchUsers();
    } else {
      alert('パスワードが違います');
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    setUsers(data || []);
  };

  const toggleBan = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentStatus })
      .eq('id', userId);

    if (!error) fetchUsers();
  };

  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
        <h2>🔒 管理者・副管理者専用領域</h2>
        <form onSubmit={handleAuth}>
          <input
            type="password"
            placeholder="二次認証パスワード"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ padding: 8, width: '100%', marginBottom: 10 }}
          />
          <button type="submit" style={{ padding: '8px 16px' }}>認証して入場</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1>🛠️ ユーザーBAN・管理パネル</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>ユーザー名</th>
            <th style={{ padding: 10, textAlign: 'left' }}>権限</th>
            <th style={{ padding: 10, textAlign: 'left' }}>ステータス</th>
            <th style={{ padding: 10, textAlign: 'left' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10 }}>{u.display_name} (@{u.username})</td>
              <td style={{ padding: 10 }}>{u.role}</td>
              <td style={{ padding: 10 }}>{u.is_banned ? '🚫 BAN済み' : '✅ 正常'}</td>
              <td style={{ padding: 10 }}>
                <button
                  onClick={() => toggleBan(u.id, u.is_banned)}
                  style={{ background: u.is_banned ? '#4caf50' : '#f44336', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4 }}
                >
                  {u.is_banned ? 'BAN解除' : 'アカウントBAN'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
