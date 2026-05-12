'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import UserCard from '../components/UserCard';
import SkillPicker from '../components/SkillPicker';
import { Toast, useToast, LoadingSpinner } from '../components/Toast';

interface Candidate {
  id: string;
  nama: string;
  jurusan: string;
  bio: string;
  skills: string[];
  avatar: string;
  project_count: number;
}

export default function MatchPage() {
  const { toast, showToast, hideToast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchedSkills, setSearchedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (selectedSkills.length === 0) {
      showToast('Pilih minimal 1 skill untuk pencarian', 'error');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: selectedSkills }),
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
                    <UserCard
                      key={candidate.id}
                      user={candidate}
                      matchedSkills={searchedSkills}
                    />
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
