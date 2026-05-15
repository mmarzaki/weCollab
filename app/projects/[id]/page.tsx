'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import SkillBadge from '../../components/SkillBadge';
import { Toast, useToast, PageLoading, LoadingSpinner } from '../../components/Toast';

interface Member { id: string; nama: string; jurusan: string; avatar: string; skills: string[]; }
interface Applicant { id: string; nama: string; email: string; jurusan: string; rumpun: string; bio: string; skills: string[]; avatar: string; }
interface Owner { id: string; nama: string; avatar: string; email: string; }
interface Project {
  id: string; judul: string; deskripsi: string;
  bidang: string; kategori: string; rumpun: string;
  owner_id: string; owner_nama: string; owner: Owner;
  status: string; skills_needed: string[];
  members: Member[]; member_count: number; applicant_count: number;
  created_at: string;
  is_owner: boolean; is_member: boolean; is_applicant: boolean;
  is_accepted: boolean; show_owner_contact: boolean;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [closing, setClosing] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);

  const projectId = params.id as string;

  const loadProject = async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    if (data.project) setProject(data.project);
  };

  const loadApplications = async () => {
    const res = await fetch(`/api/projects/${projectId}/applications`);
    const data = await res.json();
    if (data.applicants) setApplicants(data.applicants);
  };

  useEffect(() => {
    const init = async () => {
      try { await loadProject(); } finally { setLoading(false); }
    };
    init();
  }, [projectId]);

  useEffect(() => {
    if (project?.is_owner) loadApplications();
  }, [project?.is_owner]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/apply`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) showToast(data.error || 'Gagal melamar', 'error');
      else { showToast(data.message, 'success'); await loadProject(); }
    } catch { showToast('Koneksi gagal', 'error'); }
    finally { setApplying(false); }
  };

  const handleCancelApply = async () => {
    try {
      await fetch(`/api/projects/${projectId}/apply`, { method: 'DELETE' });
      showToast('Lamaran dibatalkan', 'info');
      await loadProject();
    } catch { showToast('Koneksi gagal', 'error'); }
  };

  const handleRespond = async (applicantId: string, action: 'accept' | 'reject') => {
    setResponding(applicantId);
    try {
      const res = await fetch(`/api/projects/${projectId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId, action }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || 'Gagal', 'error');
      else { showToast(data.message, 'success'); await Promise.all([loadProject(), loadApplications()]); }
    } catch { showToast('Koneksi gagal', 'error'); }
    finally { setResponding(null); }
  };

  const handleClose = async () => {
    if (!confirm('Tutup project ini? Project akan hilang dari daftar aktif.')) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) showToast(data.error || 'Gagal menutup project', 'error');
      else { showToast('Project ditutup', 'info'); setTimeout(() => router.push('/projects'), 800); }
    } catch { showToast('Koneksi gagal', 'error'); }
    finally { setClosing(false); }
  };

  if (loading) return <><Navbar /><PageLoading /></>;
  if (!project) return (
    <><Navbar />
      <main style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Project tidak ditemukan</h2>
          <Link href="/projects"><button className="btn-primary" style={{ marginTop: '16px' }}>← Kembali</button></Link>
        </div>
      </main>
    </>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

          <Link href="/projects" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', transition: 'color 0.2s' }}>
            ← Kembali ke Projects
          </Link>

          {/* Header */}
          <div className="glass" style={{ padding: '36px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.05))', border: '1px solid rgba(108,99,255,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {project.bidang && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--purple-light)', background: 'rgba(108,99,255,0.15)', padding: '4px 10px', borderRadius: '999px' }}>
                      {project.bidang}
                    </span>
                  )}
                  {project.rumpun && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#00d4ff', background: 'rgba(0,212,255,0.1)', padding: '4px 10px', borderRadius: '999px' }}>
                      {project.rumpun}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', fontWeight: '600', color: project.status === 'open' ? '#00e5a0' : 'var(--text-muted)', background: project.status === 'open' ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                    {project.status === 'open' ? 'Open Recruitment' : 'Closed'}
                  </span>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{project.judul}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Dibuat oleh <strong style={{ color: 'var(--text-primary)' }}>{project.owner_nama}</strong>
                  {' · '}{project.member_count} anggota · {project.applicant_count} pelamar
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {project.is_owner && project.status === 'open' && (
                  <button onClick={handleClose} disabled={closing} style={{ background: 'rgba(255,107,157,0.15)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', color: '#ff6b9d', cursor: closing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: closing ? 0.7 : 1 }}>
                    {closing ? <LoadingSpinner size={14} /> : '🔒'} Tutup Project
                  </button>
                )}
                {!project.is_owner && !project.is_member && !project.is_applicant && project.status === 'open' && (
                  <button id="apply-project-btn" onClick={handleApply} disabled={applying} style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', cursor: applying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(108,99,255,0.3)', opacity: applying ? 0.7 : 1 }}>
                    {applying ? <LoadingSpinner size={16} /> : '📝'} {applying ? 'Mengirim...' : 'Lamar Project'}
                  </button>
                )}
                {project.is_applicant && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', color: '#ffc107' }}>⏳ Menunggu Konfirmasi</div>
                    <button onClick={handleCancelApply} style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: '#ff6b9d', cursor: 'pointer' }}>Batalkan</button>
                  </div>
                )}
                {project.is_member && !project.is_owner && (
                  <div style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', color: '#00e5a0' }}>✅ Kamu Anggota</div>
                )}
              </div>
            </div>

            {project.deskripsi && <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7' }}>{project.deskripsi}</p>}
          </div>

          {/* Kontak owner — muncul setelah lamaran diterima */}
          {project.show_owner_contact && !project.is_owner && (
            <div className="glass" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.25)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: '#00e5a0' }}>🎉 Lamaranmu Diterima! Kontak pemilik project:</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={project.owner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.owner.id}`} alt={project.owner.nama} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }} />
                <div>
                  <p style={{ fontWeight: '700', fontSize: '15px' }}>{project.owner.nama}</p>
                  <a href={`mailto:${project.owner.email}`} style={{ color: '#00d4ff', fontSize: '14px', textDecoration: 'none' }}>📧 {project.owner.email}</a>
                </div>
              </div>
            </div>
          )}

          {/* Skills Needed */}
          {project.skills_needed.length > 0 && (
            <div className="glass" style={{ padding: '24px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>🎯 Skills yang Dibutuhkan</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.skills_needed.map((skill) => <SkillBadge key={skill} skill={skill} />)}
              </div>
            </div>
          )}

          {/* Panel Pelamar — khusus owner */}
          {project.is_owner && (
            <div className="glass" style={{ padding: '24px', marginBottom: '20px', border: '1px solid rgba(108,99,255,0.2)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>📋 Pelamar ({applicants.length})</h2>
              {applicants.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Belum ada yang melamar.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {applicants.map((applicant) => (
                    <div key={applicant.id} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <img src={applicant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${applicant.id}`} alt={applicant.nama} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>{applicant.nama}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{applicant.jurusan}{applicant.rumpun ? ` · ${applicant.rumpun}` : ''}</p>
                        <p style={{ fontSize: '12px', color: '#00d4ff', marginTop: '2px' }}>📧 {applicant.email}</p>
                        {applicant.skills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                            {applicant.skills.slice(0, 4).map((s) => <SkillBadge key={s} skill={s} size="sm" />)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => handleRespond(applicant.id, 'accept')} disabled={responding === applicant.id} style={{ background: 'linear-gradient(135deg, #00e5a0, #00d4ff)', color: '#0a1628', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '700', cursor: responding === applicant.id ? 'not-allowed' : 'pointer', opacity: responding === applicant.id ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {responding === applicant.id ? <LoadingSpinner size={12} /> : '✓'} Terima
                        </button>
                        <button onClick={() => handleRespond(applicant.id, 'reject')} disabled={responding === applicant.id} style={{ background: 'rgba(255,107,157,0.15)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#ff6b9d', cursor: responding === applicant.id ? 'not-allowed' : 'pointer' }}>
                          ✕ Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Members */}
          <div className="glass" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>👥 Anggota ({project.member_count})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {project.members.map((member) => (
                <div key={member.id} className="card-hover" style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: member.id === project.owner_id ? '1px solid rgba(108,99,255,0.3)' : '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} alt={member.nama} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {member.nama}
                      {member.id === project.owner_id && <span style={{ fontSize: '10px', color: 'var(--purple-light)', background: 'rgba(108,99,255,0.15)', padding: '1px 6px', borderRadius: '999px' }}>Owner</span>}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{member.jurusan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}