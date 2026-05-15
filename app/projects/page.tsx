'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import SkillBadge from '../components/SkillBadge';
import { Toast, useToast, LoadingSpinner } from '../components/Toast';

interface Project {
  id: string;
  judul: string;
  deskripsi: string;
  owner_id: string;
  owner_nama: string;
  bidang: string;
  kategori: string;
  rumpun: string;
  status: string;
  skills_needed: string[];
  member_count: number;
  applicant_count: number;
  created_at: string;
}

const BIDANG_LIST = ['Lomba', 'Research', 'Proyek', 'Lainnya'];
const RUMPUN_LIST = ['Saintek', 'Soshum', 'Bahasa'];
const FILTER_LIST = ['Semua', ...BIDANG_LIST];

const SKILLS_NEEDED_PRESETS = [
  'React', 'Next.js', 'Python', 'Figma', 'Machine Learning',
  'Flutter', 'Node.js', 'TypeScript', 'Data Science', 'UI/UX',
];

export default function ProjectsPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    judul: '',
    deskripsi: '',
    bidang: '',
    rumpun: '',
    skills_needed: [] as string[],
    cari_langsung: false,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.judul || !newProject.bidang) {
      showToast('Judul dan bidang wajib diisi', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProject, kategori: newProject.bidang }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal membuat project', 'error');
      } else {
        showToast('Project berhasil dibuat! 🚀', 'success');
        setShowCreate(false);
        setNewProject({ judul: '', deskripsi: '', bidang: '', rumpun: '', skills_needed: [], cari_langsung: false });
        // Jika cari langsung, redirect ke match
        if (newProject.cari_langsung && data.project_id) {
          router.push(`/match?skills=${newProject.skills_needed.join(',')}&rumpun=${newProject.rumpun}`);
        }
        await fetchProjects();
      }
    } catch {
      showToast('Koneksi gagal', 'error');
    } finally {
      setCreating(false);
    }
  };

  const toggleSkillNeeded = (skill: string) => {
    const lower = skill.toLowerCase();
    setNewProject((prev) => ({
      ...prev,
      skills_needed: prev.skills_needed.includes(lower)
        ? prev.skills_needed.filter((s) => s !== lower)
        : [...prev.skills_needed, lower],
    }));
  };

  const filtered = filter === 'Semua' ? projects : projects.filter((p) => p.bidang === filter || p.kategori === filter);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Navbar />

      {/* Create Project Modal */}
      {showCreate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div
            className="glass-strong"
            style={{ width: '100%', maxWidth: '540px', padding: '36px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>🚀 Buat Project Baru</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Judul Project</label>
                <input
                  id="new-project-judul"
                  type="text"
                  className="input-field"
                  value={newProject.judul}
                  onChange={(e) => setNewProject((p) => ({ ...p, judul: e.target.value }))}
                  placeholder="Nama project yang keren..."
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>Bidang</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {BIDANG_LIST.map((b) => (
                    <button key={b} type="button" onClick={() => setNewProject((p) => ({ ...p, bidang: b }))}
                      style={{ padding: '7px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: newProject.bidang === b ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.05)', border: newProject.bidang === b ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.08)', color: newProject.bidang === b ? '#8b85ff' : 'var(--text-secondary)' }}>
                      {newProject.bidang === b ? '✓ ' : ''}{b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>Rumpun yang Dibutuhkan</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[...RUMPUN_LIST, 'Semua'].map((r) => (
                    <button key={r} type="button" onClick={() => setNewProject((p) => ({ ...p, rumpun: r === 'Semua' ? '' : r }))}
                      style={{ padding: '7px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: (r === 'Semua' ? !newProject.rumpun : newProject.rumpun === r) ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)', border: (r === 'Semua' ? !newProject.rumpun : newProject.rumpun === r) ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.08)', color: (r === 'Semua' ? !newProject.rumpun : newProject.rumpun === r) ? '#00d4ff' : 'var(--text-secondary)' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Deskripsi</label>
                <textarea
                  id="new-project-deskripsi"
                  className="input-field"
                  value={newProject.deskripsi}
                  onChange={(e) => setNewProject((p) => ({ ...p, deskripsi: e.target.value }))}
                  placeholder="Ceritakan projectmu..."
                  rows={3}
                  style={{ resize: 'vertical', lineHeight: '1.5' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Skills Dibutuhkan <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(opsional)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SKILLS_NEEDED_PRESETS.map((skill) => {
                    const lower = skill.toLowerCase();
                    const selected = newProject.skills_needed.includes(lower);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkillNeeded(skill)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: selected ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.05)',
                          border: selected ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          color: selected ? '#8b85ff' : 'var(--text-secondary)',
                        }}
                      >
                        {selected ? '✓ ' : ''}{skill}
                      </button>
                    );
                  })}
                </div>
                {newProject.skills_needed.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {newProject.skills_needed.map((s) => (
                      <SkillBadge key={s} skill={s} removable onRemove={() => toggleSkillNeeded(s)} />
                    ))}
                  </div>
                )}
              </div>
              {/* Cari Langsung Toggle */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>Setelah dibuat:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { value: false, label: '💾 Simpan — biarkan orang melamar', desc: 'Project tampil di daftar, orang lain bisa apply' },
                    { value: true, label: '🔍 Langsung cari anggota', desc: 'Redirect ke halaman pencarian sesuai skill & rumpun project' },
                  ].map((opt) => (
                    <button key={String(opt.value)} type="button" onClick={() => setNewProject((p) => ({ ...p, cari_langsung: opt.value }))}
                      style={{ padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', background: newProject.cari_langsung === opt.value ? 'rgba(108,99,255,0.15)' : 'transparent', border: newProject.cari_langsung === opt.value ? '1px solid rgba(108,99,255,0.35)' : '1px solid transparent', color: 'var(--text-primary)' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{opt.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary" style={{ flex: 1, padding: '13px' }}>
                  Batal
                </button>
                <button
                  id="create-project-submit"
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: creating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: creating ? 0.7 : 1,
                  }}
                >
                  {creating ? <LoadingSpinner size={16} /> : null}
                  {creating ? 'Membuat...' : (newProject.cari_langsung ? '🔍 Buat & Cari Anggota' : '🚀 Buat Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                🚀 Browse Projects
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {projects.length} project aktif
              </p>
            </div>
            <button
              id="create-project-btn"
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              + Buat Project
            </button>
          </div>

          {/* Filter by Kategori */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px' }}>
            {FILTER_LIST.map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  background: filter === k ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                  border: filter === k ? '1px solid rgba(108,99,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: filter === k ? 'var(--purple-light)' : 'var(--text-secondary)',
                }}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <LoadingSpinner size={36} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                Belum ada project {filter !== 'Semua' ? `kategori ${filter}` : ''}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Jadilah yang pertama membuat project!
              </p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                + Buat Project
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '18px',
              }}
            >
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}