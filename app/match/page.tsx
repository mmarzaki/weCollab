'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import UserCard from '../components/UserCard';
import SkillPicker from '../components/SkillPicker';
import { Toast, useToast, LoadingSpinner } from '../components/Toast';

interface Candidate {
  id: string;
  nama: string;
  email: string;
  jurusan: string;
  rumpun: string;
  bio: string;
  skills: string[];
  avatar: string;
  same_rumpun: boolean;
}

function MatchContent() {
  const searchParams = useSearchParams();
  const { toast, showToast, hideToast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRumpun, setSelectedRumpun] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchedSkills, setSearchedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const skillsParam = searchParams.get('skills');
    const rumpunParam = searchParams.get('rumpun');
    if (skillsParam) setSelectedSkills(skillsParam.split(',').filter(Boolean));
    if (rumpunParam) setSelectedRumpun(rumpunParam);
  }, [searchParams]);

  const handleSearch = async () => {
    if (selectedSkills.length === 0) {
      showToast('Pilih minimal 1 skill untuk pencarian', 'error');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setSelectedCandidate(null);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: selectedSkills, rumpun: selectedRumpun || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Pencarian gagal', 'error');
      } else {
        setCandidates(data.candidates || []);
        setSearchedSkills(data.searched_skills || []);
        if (data.candidates?.length === 0) {
          showToast('Tidak ada kandidat dengan semua skill tersebut', 'info');
        } else {
          showToast(`Ditemukan ${data.candidates.length} kandidat! 🎯`, 'success');
        }
      }
    } catch {
      showToast('Koneksi gagal. Pastikan Redis berjalan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(108, 99, 255, 0.12)',
                border: '1px solid rgba(108, 99, 255, 0.25)',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#8b85ff',
                marginBottom: '20px',
              }}
            >
              🔴 Redis SINTER Operation
            </div>
            <h1
              style={{
                fontSize: 'clamp(26px, 5vw, 44px)',
                fontWeight: '900',
                marginBottom: '14px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Cari{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Rekan Kolaborasi
              </span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
              Pilih skill yang kamu cari. Sistem menggunakan{' '}
              <code style={{ color: '#ff6b9d', background: 'rgba(255,107,157,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                SINTER
              </code>{' '}
              untuk menemukan kandidat yang memiliki <strong>SEMUA</strong> skill tersebut.
            </p>
          </div>

          {/* Search Panel */}
          <div
            className="glass-strong"
            style={{
              padding: '32px',
              marginBottom: '40px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Redis command preview */}
            {selectedSkills.length > 0 && (
              <div
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#00d4ff',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: '#6c63ff' }}>SINTER</span>{' '}
                {selectedSkills.map((s) => `skill:${s}:users`).join(' ')}
              </div>
            )}

            {/* Rumpun filter */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Filter Rumpun <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(opsional — rumpun sama tampil lebih atas)</span>
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Semua', 'Saintek', 'Soshum', 'Bahasa'].map((r) => (
                  <button key={r} onClick={() => setSelectedRumpun(r === 'Semua' ? '' : r)}
                    style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: (r === 'Semua' ? !selectedRumpun : selectedRumpun === r) ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)', border: (r === 'Semua' ? !selectedRumpun : selectedRumpun === r) ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.08)', color: (r === 'Semua' ? !selectedRumpun : selectedRumpun === r) ? '#00d4ff' : 'var(--text-secondary)' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <SkillPicker
              selectedSkills={selectedSkills}
              onChange={setSelectedSkills}
              maxSkills={6}
              label="Skill yang dicari (SINTER akan dijalankan untuk semua skill ini)"
            />

            <button
              id="match-search-btn"
              onClick={handleSearch}
              disabled={loading || selectedSkills.length === 0}
              style={{
                marginTop: '24px',
                width: '100%',
                background: selectedSkills.length === 0
                  ? 'rgba(108,99,255,0.2)'
                  : 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading || selectedSkills.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: selectedSkills.length > 0 ? '0 4px 20px rgba(108,99,255,0.3)' : 'none',
                opacity: selectedSkills.length === 0 ? 0.5 : 1,
              }}
            >
              {loading ? <LoadingSpinner size={20} /> : '🎯'}
              {loading ? 'Menjalankan SINTER...' : 'Cari Kandidat'}
            </button>
          </div>

          {/* Panel kontak kandidat yang dipilih */}
          {selectedCandidate && (
            <div className="glass" style={{ padding: '20px', marginBottom: '28px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#00e5a0' }}>📬 Kontak Kandidat Terpilih</h3>
                <button onClick={() => setSelectedCandidate(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <img src={selectedCandidate.avatar} alt={selectedCandidate.nama} style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(0,229,160,0.3)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '3px' }}>{selectedCandidate.nama}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>{selectedCandidate.jurusan}{selectedCandidate.rumpun ? ` · ${selectedCandidate.rumpun}` : ''}</p>
                  <a href={`mailto:${selectedCandidate.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00d4ff', fontWeight: '600', fontSize: '14px', textDecoration: 'none', background: 'rgba(0,212,255,0.1)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(0,212,255,0.2)' }}>
                    📧 {selectedCandidate.email}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {hasSearched && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
                    {loading ? 'Mencari...' : `${candidates.length} Kandidat Ditemukan`}
                  </h2>
                  {!loading && searchedSkills.length > 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Memiliki skill:{' '}
                      {searchedSkills.map((s, i) => (
                        <span key={s}>
                          <code style={{ color: '#00d4ff', background: 'rgba(0,212,255,0.08)', padding: '1px 5px', borderRadius: '4px', fontSize: '12px' }}>
                            {s}
                          </code>
                          {i < searchedSkills.length - 1 && ' + '}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                {!loading && candidates.length > 0 && (
                  <div
                    style={{
                      background: 'rgba(0,229,160,0.1)',
                      border: '1px solid rgba(0,229,160,0.25)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      color: '#00e5a0',
                      fontWeight: '600',
                    }}
                  >
                    ✅ SINTER selesai
                  </div>
                )}
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <LoadingSpinner size={36} />
                </div>
              ) : candidates.length === 0 ? (
                <div
                  className="glass"
                  style={{ padding: '60px', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                    Tidak ada kandidat yang cocok
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto', lineHeight: '1.6' }}>
                    Coba kurangi jumlah skill atau coba kombinasi skill yang berbeda. SINTER membutuhkan kandidat yang memiliki <strong>semua</strong> skill sekaligus.
                  </p>
                  <button
                    onClick={() => { setSelectedSkills([]); setHasSearched(false); }}
                    className="btn-secondary"
                    style={{ marginTop: '20px' }}
                  >
                    Reset Pencarian
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {candidates.map((candidate) => (
                    <div key={candidate.id} onClick={() => setSelectedCandidate(candidate as Candidate)} style={{ cursor: 'pointer' }}>
                      <UserCard user={candidate} matchedSkills={searchedSkills} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State (sebelum search) */}
          {!hasSearched && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🎯</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Pilih skill di atas dan klik "Cari Kandidat" untuk memulai matching
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner size={36} /></div>}>
      <MatchContent />
    </Suspense>
  );
}