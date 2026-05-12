'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SkillPicker from '../components/SkillPicker';
import { LoadingSpinner, Toast, useToast } from '../components/Toast';

const JURUSAN_LIST = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Ilmu Komputer',
  'Teknik Elektro',
  'Teknik Industri',
  'Matematika',
  'Statistika',
  'Desain Komunikasi Visual',
  'Manajemen',
  'Ekonomi',
  'Lainnya',
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    jurusan: '',
    bio: '',
    skills: [] as string[],
  });

  const updateForm = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.nama || !form.email || !form.password) {
        showToast('Semua field wajib diisi', 'error');
        return;
      }
      if (form.password.length < 6) {
        showToast('Password minimal 6 karakter', 'error');
        return;
      }
      if (form.password !== form.confirmPassword) {
        showToast('Password tidak cocok', 'error');
        return;
      }
    }
    if (step === 2 && !form.jurusan) {
      showToast('Pilih jurusan terlebih dahulu', 'error');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleRegister = async () => {
    if (form.skills.length === 0) {
      showToast('Tambahkan minimal 1 skill', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          password: form.password,
          jurusan: form.jurusan,
          bio: form.bio,
          skills: form.skills,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registrasi gagal', 'error');
      } else {
        showToast('Akun berhasil dibuat! 🎉', 'success');
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } catch {
      showToast('Koneksi gagal. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                weCollab
              </span>
            </Link>
            <h1 style={{ fontSize: '22px', fontWeight: '800', marginTop: '8px', marginBottom: '4px' }}>
              Buat Akun Baru
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Langkah {step} dari 3
            </p>
          </div>

          {/* Progress */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '28px',
            }}
          >
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '3px',
                  borderRadius: '999px',
                  background: s <= step ? 'linear-gradient(90deg, #6c63ff, #00d4ff)' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          <div className="glass-strong" style={{ padding: '32px' }}>
            {/* Step 1 — Data Akun */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
                  Data Akun
                </h2>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Nama Lengkap
                  </label>
                  <input
                    id="reg-nama"
                    type="text"
                    className="input-field"
                    value={form.nama}
                    onChange={(e) => updateForm('nama', e.target.value)}
                    placeholder="Nama lengkapmu"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="nama@email.com"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Password
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    className="input-field"
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Konfirmasi Password
                  </label>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    className="input-field"
                    value={form.confirmPassword}
                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                    placeholder="Ulangi password"
                  />
                </div>
                <button onClick={nextStep} className="btn-primary" style={{ marginTop: '8px', padding: '14px', width: '100%' }}>
                  Lanjut →
                </button>
              </div>
            )}

            {/* Step 2 — Profil */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
                  Profil Akademik
                </h2>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Jurusan
                  </label>
                  <select
                    id="reg-jurusan"
                    className="input-field"
                    value={form.jurusan}
                    onChange={(e) => updateForm('jurusan', e.target.value)}
                    style={{ appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Pilih jurusan...</option>
                    {JURUSAN_LIST.map((j) => (
                      <option key={j} value={j} style={{ background: '#0d0d1a' }}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Bio <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(opsional)</span>
                  </label>
                  <textarea
                    id="reg-bio"
                    className="input-field"
                    value={form.bio}
                    onChange={(e) => updateForm('bio', e.target.value)}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    rows={3}
                    style={{ resize: 'vertical', lineHeight: '1.5' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>
                    ← Kembali
                  </button>
                  <button onClick={nextStep} className="btn-primary" style={{ flex: 1, padding: '14px' }}>
                    Lanjut →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Skills */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
                    Skills & Keahlian
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Pilih skill yang kamu kuasai — ini akan digunakan untuk matching
                  </p>
                </div>
                <SkillPicker
                  selectedSkills={form.skills}
                  onChange={(skills) => updateForm('skills', skills)}
                  maxSkills={10}
                  label="Skills kamu"
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>
                    ← Kembali
                  </button>
                  <button
                    id="register-submit"
                    onClick={handleRegister}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? <LoadingSpinner size={18} /> : null}
                    {loading ? 'Membuat akun...' : '🎉 Buat Akun'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: 'var(--purple-light)', fontWeight: '600', textDecoration: 'none' }}>
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
