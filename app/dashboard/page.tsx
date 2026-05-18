'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toast, useToast, LoadingSpinner } from '../components/Toast';
import SkillBadge from '../components/SkillBadge';
import ProjectCard from '../components/ProjectCard';
import styles from './dashboard.module.css';

interface User {
  id: string;
  nama: string;
  email: string;
  jurusan: string;
  rumpun: string;
  bio: string;
  skills: string[];
  avatar: string;
  projectIds: string[];
}

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
const SKILLS_PRESETS = [
  'React', 'Next.js', 'Python', 'Figma', 'Machine Learning',
  'Flutter', 'Node.js', 'TypeScript', 'Data Science', 'UI/UX',
];

type Tab = 'dashboard' | 'cari' | 'buat';

export default function DashboardPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Cari Project filters
  const [search, setSearch] = useState('');
  const [filterBidang, setFilterBidang] = useState('Semua');

  // Buat Project form
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
    const fetchData = async () => {
      try {
        const [meRes, projRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/projects'),
        ]);
        if (meRes.ok) {
          const d = await meRes.json();
          if (d.user) setUser(d.user);
        }
        if (projRes.ok) {
          const d = await projRes.json();
          if (d.projects) setProjects(d.projects);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredProjects = projects.filter((p) => {
    const matchBidang = filterBidang === 'Semua' || p.bidang === filterBidang || p.kategori === filterBidang;
    const matchSearch = !search || p.judul.toLowerCase().includes(search.toLowerCase()) || p.deskripsi.toLowerCase().includes(search.toLowerCase());
    return matchBidang && matchSearch;
  });

  const toggleSkill = (skill: string) => {
    const lower = skill.toLowerCase();
    setNewProject((prev) => ({
      ...prev,
      skills_needed: prev.skills_needed.includes(lower)
        ? prev.skills_needed.filter((s) => s !== lower)
        : [...prev.skills_needed, lower],
    }));
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
        setNewProject({ judul: '', deskripsi: '', bidang: '', rumpun: '', skills_needed: [], cari_langsung: false });
        const projRes = await fetch('/api/projects');
        const projData = await projRes.json();
        if (projData.projects) setProjects(projData.projects);
        if (newProject.cari_langsung && data.project_id) {
          router.push(`/match?skills=${newProject.skills_needed.join(',')}&rumpun=${newProject.rumpun}`);
        } else {
          setActiveTab('cari');
        }
      }
    } catch {
      showToast('Koneksi gagal', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Google Workspace-style Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>W</div>
            <span className={styles.logoText}>weCollab</span>
          </Link>
          <nav className={styles.headerNav}>
            <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
            <Link href="/match" className={styles.navLink}>Cari Rekan</Link>
            <Link href="/profile" className={styles.navLink}>Profil</Link>
          </nav>
          {user && (
            <div className={styles.userChip}>
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                alt={user.nama}
                className={styles.userAvatar}
              />
              <span className={styles.userName}>{user.nama.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {/* ─── DASHBOARD SECTION ─── */}
        <section className={styles.dashboardSection}>
          <div className={styles.container}>

            {/* Greeting Banner */}
            <div className={styles.greetingBanner}>
              <div className={styles.greetingLeft}>
                {loading ? (
                  <div className={styles.greetingLoading}>
                    <div className={styles.skeletonLine} style={{ width: 200 }} />
                    <div className={styles.skeletonLine} style={{ width: 140, height: 14 }} />
                  </div>
                ) : (
                  <>
                    <p className={styles.greetingHello}>{greeting()},</p>
                    <h1 className={styles.greetingName}>{user?.nama ?? 'Pengguna'} 👋</h1>
                    <p className={styles.greetingMeta}>
                      {user?.jurusan}{user?.rumpun ? ` · ${user.rumpun}` : ''} · {user?.projectIds?.length ?? 0} project
                    </p>
                  </>
                )}
              </div>
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
                alt="avatar"
                className={styles.greetingAvatar}
              />
            </div>

            {/* Stats Row */}
            <div className={styles.statsRow}>
              {[
                { label: 'Project Diikuti', value: user?.projectIds?.length ?? 0, icon: '📁', color: '#1a73e8' },
                { label: 'Skill Dimiliki', value: user?.skills?.length ?? 0, icon: '⚡', color: '#34a853' },
                { label: 'Project Tersedia', value: projects.length, icon: '🚀', color: '#ea4335' },
                { label: 'Pencarian Aktif', value: 0, icon: '🔍', color: '#fbbc04' },
              ].map((s) => (
                <div key={s.label} className={styles.statCard}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div className={styles.statValue} style={{ color: s.color }}>{loading ? '—' : s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <Link href="/match" className={styles.quickCard}>
                <span className={styles.quickIcon}>🎯</span>
                <div>
                  <div className={styles.quickTitle}>Cari Rekan</div>
                  <div className={styles.quickDesc}>Cocokkan berdasarkan skill</div>
                </div>
              </Link>
              <Link href="/profile" className={styles.quickCard}>
                <span className={styles.quickIcon}>👤</span>
                <div>
                  <div className={styles.quickTitle}>Edit Profil</div>
                  <div className={styles.quickDesc}>Update skill & jurusan</div>
                </div>
              </Link>
              {user?.skills && user.skills.length > 0 && (
                <div className={styles.skillsQuick}>
                  <p className={styles.quickTitle}>Skill Saya</p>
                  <div className={styles.skillRow}>
                    {user.skills.slice(0, 5).map((sk) => <SkillBadge key={sk} skill={sk} />)}
                    {user.skills.length > 5 && <span className={styles.moreSkills}>+{user.skills.length - 5}</span>}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ─── TABS SECTION ─── */}
        <section className={styles.tabsSection}>
          <div className={styles.container}>

            {/* Tab Bar */}
            <div className={styles.tabBar}>
              <button
                id="tab-cari"
                className={`${styles.tabBtn} ${activeTab === 'cari' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('cari')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Cari Project
              </button>
              <button
                id="tab-buat"
                className={`${styles.tabBtn} ${activeTab === 'buat' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('buat')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Buat Project
              </button>
            </div>

            {/* ── Tab: Cari Project ── */}
            {activeTab === 'cari' && (
              <div className={styles.tabContent}>
                {/* Search Bar */}
                <div className={styles.searchBar}>
                  <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    id="search-project"
                    type="text"
                    placeholder="Cari project berdasarkan judul atau deskripsi..."
                    className={styles.searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className={styles.filterRow}>
                  {['Semua', ...BIDANG_LIST].map((b) => (
                    <button
                      key={b}
                      className={`${styles.chip} ${filterBidang === b ? styles.chipActive : ''}`}
                      onClick={() => setFilterBidang(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                {/* Results */}
                <div className={styles.resultsInfo}>
                  {!loading && <span>{filteredProjects.length} project ditemukan</span>}
                </div>

                {loading ? (
                  <div className={styles.loadingCenter}><LoadingSpinner size={36} /></div>
                ) : filteredProjects.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📭</div>
                    <h3 className={styles.emptyTitle}>Belum ada project</h3>
                    <p className={styles.emptyDesc}>Coba ubah filter atau buat project baru.</p>
                    <button className={styles.btnPrimary} onClick={() => setActiveTab('buat')}>
                      + Buat Project
                    </button>
                  </div>
                ) : (
                  <div className={styles.projectsGrid}>
                    {filteredProjects.map((p) => (
                      <ProjectCard key={p.id} project={{ ...p, kategori: p.bidang || p.kategori }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Buat Project ── */}
            {activeTab === 'buat' && (
              <div className={styles.tabContent}>
                <div className={styles.formCard}>
                  <div className={styles.formHeader}>
                    <h2 className={styles.formTitle}>Buat Project Baru</h2>
                    <p className={styles.formSubtitle}>Isi detail project untuk mulai mencari kolaborator</p>
                  </div>

                  <form onSubmit={handleCreate} className={styles.form}>
                    {/* Judul */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Judul Project <span className={styles.required}>*</span></label>
                      <input
                        id="new-project-judul"
                        type="text"
                        className={styles.formInput}
                        placeholder="Nama project yang menarik..."
                        value={newProject.judul}
                        onChange={(e) => setNewProject((p) => ({ ...p, judul: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Deskripsi */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Deskripsi</label>
                      <textarea
                        id="new-project-deskripsi"
                        className={styles.formTextarea}
                        placeholder="Ceritakan tujuan dan detail projectmu..."
                        value={newProject.deskripsi}
                        onChange={(e) => setNewProject((p) => ({ ...p, deskripsi: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    {/* Bidang */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Bidang <span className={styles.required}>*</span></label>
                      <div className={styles.chipRow}>
                        {BIDANG_LIST.map((b) => (
                          <button
                            key={b} type="button"
                            className={`${styles.chip} ${newProject.bidang === b ? styles.chipActive : ''}`}
                            onClick={() => setNewProject((p) => ({ ...p, bidang: b }))}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rumpun */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Rumpun Dibutuhkan</label>
                      <div className={styles.chipRow}>
                        {[...RUMPUN_LIST, 'Semua'].map((r) => {
                          const isActive = r === 'Semua' ? !newProject.rumpun : newProject.rumpun === r;
                          return (
                            <button
                              key={r} type="button"
                              className={`${styles.chip} ${isActive ? styles.chipActiveCyan : ''}`}
                              onClick={() => setNewProject((p) => ({ ...p, rumpun: r === 'Semua' ? '' : r }))}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Skills Dibutuhkan <span className={styles.optional}>(opsional)</span></label>
                      <div className={styles.chipRow}>
                        {SKILLS_PRESETS.map((sk) => {
                          const sel = newProject.skills_needed.includes(sk.toLowerCase());
                          return (
                            <button
                              key={sk} type="button"
                              className={`${styles.chip} ${sel ? styles.chipActive : ''}`}
                              onClick={() => toggleSkill(sk)}
                            >
                              {sel ? '✓ ' : ''}{sk}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* After Create Option */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Setelah dibuat</label>
                      <div className={styles.optionRow}>
                        {[
                          { value: false, label: 'Simpan & tunggu lamaran', icon: '💾' },
                          { value: true, label: 'Langsung cari anggota', icon: '🔍' },
                        ].map((opt) => (
                          <button
                            key={String(opt.value)} type="button"
                            className={`${styles.optionBtn} ${newProject.cari_langsung === opt.value ? styles.optionBtnActive : ''}`}
                            onClick={() => setNewProject((p) => ({ ...p, cari_langsung: opt.value }))}
                          >
                            <span className={styles.optionIcon}>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.formActions}>
                      <button type="button" className={styles.btnSecondary} onClick={() => setActiveTab('cari')}>
                        Batal
                      </button>
                      <button
                        id="create-project-submit"
                        type="submit"
                        disabled={creating}
                        className={styles.btnPrimary}
                      >
                        {creating ? <><LoadingSpinner size={16} /> Membuat...</> : (newProject.cari_langsung ? '🔍 Buat & Cari Anggota' : '🚀 Buat Project')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>
    </>
  );
}