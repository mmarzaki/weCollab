'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner, Toast, useToast } from '../components/Toast';

const PRESET_SKILLS = [
  'Document', 'UI/UX', 'Design', 'Communication', 'Machine Learning',
  'Project Manager', 'Problem Solving', 'Language', 'Literature',
];

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, showToast, hideToast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regStep, setRegStep] = useState(1);
  const [nama, setNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [rumpun, setRumpun] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Check URL params for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') setActiveTab('register');
  }, [searchParams]);

  // Reset register steps when switching tabs
  useEffect(() => {
    if (activeTab === 'login') setRegStep(1);
  }, [activeTab]);

  // ── Login Handler ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Email dan password wajib diisi', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Login gagal', 'error');
      } else {
        showToast('Login berhasil!', 'success');
        setTimeout(() => router.push('/dashboard'), 600);
      }
    } catch {
      showToast('Koneksi gagal. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegNext = () => {
    if (regStep === 1) {
      if (!nama || !regEmail || !regPassword) {
        showToast('Semua field wajib diisi', 'error');
        return;
      }
      if (regPassword.length < 6) {
        showToast('Password minimal 6 karakter', 'error');
        return;
      }
      if (regPassword !== regConfirm) {
        showToast('Password tidak cocok', 'error');
        return;
      }
    }
    setRegStep((s) => s + 1);
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.some(s => s.toLowerCase() === trimmed.toLowerCase()) || skills.length >= 10) return;
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleRegister = async () => {
    if (skills.length === 0) {
      showToast('Tambahkan minimal 1 skill', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama,
          email: regEmail,
          password: regPassword,
          jurusan,
          rumpun,
          skills,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registrasi gagal', 'error');
      } else {
        showToast('Akun berhasil dibuat! 🎉', 'success');
        setTimeout(() => router.push('/dashboard'), 800);
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

      <div
        className="auth-container"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        {/* ── Left Panel ── */}
        <div className="auth-left-panel">
          {/* Decorative elements */}
          <div className="auth-deco-container">
            {/* Vertical line behind */}
            <div className="auth-left-vertical-line" />

            {/* Circle arcs */}
            <svg
              className="auth-deco-circle"
              viewBox="0 0 320 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="320" cy="0" r="220" stroke="#1a1a1a" strokeWidth="0.8" />
              <circle cx="320" cy="0" r="160" stroke="#1a1a1a" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Logo */}
          <div className="auth-logo-area">
            <div className="auth-logo-box">
              <img
                src="/images/Logo.png"
                alt="WeCollab Logo"
                className="auth-logo-img"
              />
            </div>
          </div>

          {/* Bottom section: Brand + Tabs + Form */}
          <div className="auth-left-bottom">
            <h1 className="auth-brand-name">WeCollab</h1>

            {/* Tabs */}
            <div className="auth-tabs">
              <button
                onClick={() => setActiveTab('login')}
                className={`auth-tab-btn ${activeTab === 'login' ? 'auth-tab-active' : ''}`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`auth-tab-btn ${activeTab === 'register' ? 'auth-tab-active' : ''}`}
              >
                Register
              </button>
            </div>

            {/* ── Login Form ── */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="auth-form-fields">
                <input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-field-input"
                  autoComplete="email"
                  required
                />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-field-input"
                  autoComplete="current-password"
                  required
                />
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                >
                  {loading ? <LoadingSpinner size={16} /> : null}
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* ── Register Form ── */}
            {activeTab === 'register' && (
              <div className="auth-form-fields">
                {/* Step indicator */}
                <div className="auth-step-indicator">
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      className={`auth-step-dot ${s <= regStep ? 'auth-step-dot-active' : ''} ${s === regStep ? 'auth-step-dot-current' : ''}`}
                    >
                      {s}
                    </div>
                  ))}
                </div>

                {/* Step 1: Account Data */}
                {regStep === 1 && (
                  <>
                    <input
                      id="reg-nama"
                      type="text"
                      placeholder="Nama Lengkap"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="auth-field-input"
                    />
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="Email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="auth-field-input"
                    />
                    <input
                      id="reg-password"
                      type="password"
                      placeholder="Password (min. 6)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="auth-field-input"
                    />
                    <input
                      id="reg-confirm-password"
                      type="password"
                      placeholder="Konfirmasi Password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      className="auth-field-input"
                    />
                    <button
                      type="button"
                      onClick={handleRegNext}
                      className="auth-submit-btn"
                    >
                      Lanjut →
                    </button>
                  </>
                )}


                {/* Step 2: Skills */}
                {regStep === 2 && (
                  <>
                    {/* Jurusan */}
                    <input
                      type="text"
                      placeholder="Jurusan (contoh: Teknik Informatika)"
                      value={jurusan}
                      onChange={(e) => setJurusan(e.target.value)}
                      className="auth-field-input"
                    />

                    {/* Rumpun */}
                    <p className="auth-step-desc">Pilih rumpun ilmu</p>
                    <div className="auth-skill-presets">
                      {['Saintek', 'Soshum', 'Bahasa'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRumpun(r)}
                          className="auth-skill-preset-btn"
                          style={{
                            background: rumpun === r ? '#1a1a1a' : undefined,
                            color: rumpun === r ? '#f5f0ea' : undefined,
                            border: rumpun === r ? '1px solid #1a1a1a' : undefined,
                          }}
                        >
                          {rumpun === r ? '✓ ' : ''}{r}
                        </button>
                      ))}
                    </div>

                    <p className="auth-step-desc">
                      Pilih atau ketik skill ({skills.length}/10)
                    </p>

                    {/* Selected skills */}
                    {skills.length > 0 && (
                      <div className="auth-skills-selected">
                        {skills.map((s) => (
                          <span key={s} className="auth-skill-tag">
                            {s}
                            <button
                              type="button"
                              onClick={() => removeSkill(s)}
                              className="auth-skill-remove"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Skill input */}
                    <input
                      type="text"
                      placeholder="Ketik skill anda"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (skillInput.trim()) {
                            addSkill(skillInput);
                          }
                        }
                      }}
                      className="auth-field-input"
                      disabled={skills.length >= 10}
                    />

                    {/* Preset chips */}
                    <div className="auth-skill-presets">
                      {PRESET_SKILLS.filter((s) => !skills.some(skill => skill.toLowerCase() === s.toLowerCase()))
                        .slice(0, 10)
                        .map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => addSkill(s)}
                            className="auth-skill-preset-btn"
                            disabled={skills.length >= 10}
                          >
                            + {s}
                          </button>
                        ))}
                    </div>

                    <div className="auth-btn-row">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="auth-back-btn"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={handleRegister}
                        disabled={loading}
                        className="auth-submit-btn"
                        style={{ flex: 1 }}
                      >
                        {loading ? <LoadingSpinner size={16} /> : null}
                        {loading ? 'Membuat...' : '🎉 Buat Akun'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'login' && (
              <p className="auth-footer-hint">
                Belum punya akun?{' '}
                <span
                  className="auth-footer-link"
                  onClick={() => setActiveTab('register')}
                >
                  Daftar
                </span>
              </p>
            )}
            {activeTab === 'register' && (
              <p className="auth-footer-hint">
                Sudah punya akun?{' '}
                <span
                  className="auth-footer-link"
                  onClick={() => setActiveTab('login')}
                >
                  Masuk
                </span>
              </p>
            )}
          </div>

          {/* Bottom border line */}
          <div className="auth-bottom-line" />
        </div>

        {/* ── Right Panel — Hero Image ── */}
        <div className="auth-right-panel">
          <img
            src="/images/login_images.png"
            alt="Login visual"
            className="auth-hero-img"
          />
          {/* Subtle vignette */}
          <div className="auth-hero-vignette" />
        </div>
      </div>

      <style>{`
        /* =============================================
           AUTH PAGE — Full Layout
        ============================================= */
        .auth-container {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #1a1a1a;
        }

        /* ── Left Panel ── */
        .auth-left-panel {
          position: relative;
          display: flex;
          width: 320px;
          flex-shrink: 0;
          flex-direction: column;
          background: #FFF7EE;
          padding: 24px 28px;
          overflow: hidden;
        }

        /* Decorative Elements */
        .auth-deco-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .auth-left-vertical-line {
          position: absolute;
          left: 42px;
          top: 0;
          bottom: 0;
          width: 1.5px;
          background: #1a1a1a;
          opacity: 1;
          z-index: 1;
        }

        .auth-deco-circle {
          position: absolute;
          right: 0;
          top: 0;
          width: 320px;
          height: 500px;
          z-index: 2;
        }

        /* Logo Area */
        .auth-logo-area {
          position: relative;
          z-index: 10;
          margin-bottom: 20px;
          padding-top: 10px;
        }

        .auth-logo-box {
          position: relative;
          width: 100px;
          height: 120px;
          background-color: transparent;
          margin-left: -5px;
        }

        .auth-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }

        /* Bottom section */
        .auth-left-bottom {
          position: relative;
          z-index: 10;
          margin-top: auto;
          padding-bottom: 8px;
        }

        .auth-brand-name {
          font-family: 'Neuton', 'Georgia', serif;
          font-size: 36px;
          font-weight: 400;
          color: #1a1a1a;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 0;
        }

        /* Tabs */
        .auth-tabs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 20px;
        }

        .auth-tab-btn {
          width: 100%;
          border: none;
          border-radius: 6px;
          padding: 9px 16px;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #e8e3dc;
          color: #555;
        }

        .auth-tab-btn:hover {
          background: #ddd8d0;
        }

        .auth-tab-active {
          background: #d6d0c9 !important;
          color: #1a1a1a !important;
          font-weight: 500;
        }

        /* Form Fields */
        .auth-form-fields {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 18px;
        }

        .auth-field-input {
          width: 100%;
          border: 1px solid #ccc8c0;
          border-radius: 6px;
          background: #ede8e1;
          padding: 9px 12px;
          font-size: 13px;
          font-family: inherit;
          color: #1a1a1a;
          outline: none;
          transition: all 0.2s ease;
        }

        .auth-field-input::placeholder {
          color: #999;
        }

        .auth-field-input:focus {
          border-color: #aaa;
          background: #e8e3dc;
        }

        .auth-field-select {
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        .auth-field-textarea {
          resize: vertical;
          line-height: 1.5;
          min-height: 60px;
        }

        /* Step indicator */
        .auth-step-indicator {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 4px;
        }

        .auth-step-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          background: #e8e3dc;
          color: #999;
          transition: all 0.3s ease;
        }

        .auth-step-dot-active {
          background: #d6d0c9;
          color: #555;
        }

        .auth-step-dot-current {
          background: #1a1a1a;
          color: #f5f0ea;
        }

        .auth-step-desc {
          font-size: 11px;
          color: #888;
          text-align: center;
        }

        /* Skills */
        .auth-skills-selected {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .auth-skill-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          background: #1a1a1a;
          color: #f5f0ea;
          font-size: 11px;
          font-weight: 500;
        }

        .auth-skill-remove {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 13px;
          padding: 0;
          line-height: 1;
        }

        .auth-skill-remove:hover {
          color: #f5f0ea;
        }

        .auth-skill-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .auth-skill-preset-btn {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-family: inherit;
          cursor: pointer;
          background: #ede8e1;
          border: 1px solid #ccc8c0;
          color: #555;
          transition: all 0.2s ease;
        }

        .auth-skill-preset-btn:hover {
          background: #e8e3dc;
          border-color: #aaa;
        }

        .auth-skill-preset-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Submit button */
        .auth-submit-btn {
          width: 100%;
          border: none;
          border-radius: 6px;
          background: #1a1a1a;
          color: #f5f0ea;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 2px;
        }

        .auth-submit-btn:hover {
          background: #333;
        }

        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Button Row */
        .auth-btn-row {
          display: flex;
          gap: 8px;
        }

        .auth-back-btn {
          width: 40px;
          flex-shrink: 0;
          border: 1px solid #ccc8c0;
          border-radius: 6px;
          background: #ede8e1;
          color: #1a1a1a;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-back-btn:hover {
          background: #e8e3dc;
          border-color: #aaa;
        }

        /* Footer */
        .auth-footer-hint {
          margin-top: 12px;
          text-align: center;
          font-size: 11px;
          color: #888;
        }

        .auth-footer-link {
          cursor: pointer;
          text-decoration: underline;
          color: #888;
          transition: color 0.2s;
        }

        .auth-footer-link:hover {
          color: #555;
        }

        /* Decorative lines */
        .auth-bottom-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(26, 26, 26, 0.1);
        }

        .auth-center-line {
          position: absolute;
          bottom: 0;
          left: 160px;
          top: 0;
          width: 1px;
          background: rgba(26, 26, 26, 0.1);
          pointer-events: none;
        }

        /* ── Right Panel ── */
        .auth-right-panel {
          position: relative;
          flex: 1;
          overflow: hidden;
        }

        .auth-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(20%) brightness(0.85);
        }

        .auth-hero-vignette {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right, rgba(245,240,234,0.15) 0%, transparent 30%),
            linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column;
          }

          .auth-left-panel {
            width: 100%;
            min-height: auto;
            padding: 20px 24px 28px;
          }

          .auth-right-panel {
            display: none;
          }

          .auth-center-line {
            display: none;
          }

          .auth-brand-name {
            font-size: 28px;
          }
        }
      `}</style>
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}