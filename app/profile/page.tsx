'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SkillBadge from '../components/SkillBadge';
import SkillPicker from '../components/SkillPicker';
import { Toast, useToast, PageLoading, LoadingSpinner } from '../components/Toast';

interface User {
  id: string;
  nama: string;
  email: string;
  jurusan: string;
  bio: string;
  skills: string[];
  avatar: string;
  projectIds: string[];
  created_at: string;
}

interface Project {
  id: string;
  judul: string;
  kategori: string;
  status: string;
  member_count: number;
}

export default function ProfilePage() {
  const { toast, showToast, hideToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ nama: '', jurusan: '', bio: '', skills: [] as string[] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (meData.user) {
          setUser(meData.user);
          setEditForm({
            nama: meData.user.nama,
            jurusan: meData.user.jurusan,
            bio: meData.user.bio || '',
            skills: meData.user.skills || [],
          });

          // Fetch project details
          const projectDetails: Project[] = [];
          for (const pid of (meData.user.projectIds || []).slice(0, 6)) {
            const pRes = await fetch(`/api/projects/${pid}`);
            const pData = await pRes.json();
            if (pData.project) {
              projectDetails.push({
                id: pid,
                judul: pData.project.judul,
                kategori: pData.project.kategori,
                status: pData.project.status,
                member_count: pData.project.member_count,
              });
            }
          }
          setProjects(projectDetails);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal menyimpan', 'error');
      } else {
        setUser((prev) => prev ? { ...prev, ...data.user } : prev);
        setEditing(false);
        showToast('Profil berhasil diperbarui!', 'success');
      }
    } catch {
      showToast('Koneksi gagal', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <><Navbar /><PageLoading /></>;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

          {/* Profile Header */}
          <div
            className="glass"
            style={{
              padding: '40px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.05))',
              border: '1px solid rgba(108,99,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)' }} />

            {!editing ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                <img
                  src={user?.avatar}
                  alt={user?.nama}
                  style={{ width: '88px', height: '88px', borderRadius: '20px', border: '3px solid rgba(108,99,255,0.4)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {user?.nama}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '15px' }}>
                    🎓 {user?.jurusan}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                    📧 {user?.email}
                  </p>
                  {user?.bio && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', maxWidth: '500px' }}>
                      {user.bio}
                    </p>
                  )}
                </div>
                <button
                  id="edit-profile-btn"
                  onClick={() => setEditing(true)}
                  className="btn-secondary"
                  style={{ flexShrink: 0 }}
                >
                  ✏️ Edit Profil
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700' }}>Edit Profil</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Nama</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.nama}
                      onChange={(e) => setEditForm((p) => ({ ...p, nama: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Jurusan</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.jurusan}
                      onChange={(e) => setEditForm((p) => ({ ...p, jurusan: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Bio</label>
                  <textarea
                    className="input-field"
                    value={editForm.bio}
                    onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    style={{ resize: 'vertical', lineHeight: '1.5' }}
                  />
                </div>
                <SkillPicker
                  selectedSkills={editForm.skills}
                  onChange={(skills) => setEditForm((p) => ({ ...p, skills }))}
                  label="Skills"
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setEditing(false)} className="btn-secondary">
                    Batal
                  </button>
                  <button
                    id="save-profile-btn"
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? <LoadingSpinner size={16} /> : null}
                    {saving ? 'Menyimpan...' : '💾 Simpan'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px' }}>⚡ Skills</h2>
            {user?.skills && user.skills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {user.skills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Belum ada skill. Edit profil untuk menambahkan.</p>
            )}
          </div>

          {/* Projects Section */}
          <div className="glass" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px' }}>
              📁 Project Saya ({user?.projectIds?.length || 0})
            </h2>
            {projects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="card-hover"
                    style={{
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '3px' }}>{proj.judul}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {proj.kategori} · {proj.member_count} anggota
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: proj.status === 'open' ? 'rgba(0,229,160,0.15)' : 'rgba(255,255,255,0.08)',
                        color: proj.status === 'open' ? '#00e5a0' : 'var(--text-muted)',
                      }}
                    >
                      {proj.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Belum bergabung di project apapun.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
