'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';

export default function LandingPage() {
  const features = [
    {
      icon: '🎯',
      title: 'Smart Skill Matching',
      desc: 'Teknologi Redis SINTER menemukan kandidat yang punya SEMUA skill yang kamu butuhkan secara instan.',
      color: 'rgba(108, 99, 255, 0.15)',
      glow: 'rgba(108, 99, 255, 0.3)',
    },
    {
      icon: '🚀',
      title: 'Browse Projects',
      desc: 'Jelajahi ratusan project kolaborasi mahasiswa, dari lomba hingga startup. Real-time via Redis Sorted Set.',
      color: 'rgba(0, 212, 255, 0.1)',
      glow: 'rgba(0, 212, 255, 0.25)',
    },
    {
      icon: '👥',
      title: 'Build Your Team',
      desc: 'Bergabung dengan project yang sesuai passion dan skillmu. Bangun portofolio nyata bersama.',
      color: 'rgba(0, 229, 160, 0.1)',
      glow: 'rgba(0, 229, 160, 0.25)',
    },
    {
      icon: '⚡',
      title: 'Redis-Powered Speed',
      desc: 'Semua data disimpan di Redis key-value. Query in-memory, hasil instan tanpa latency SQL.',
      color: 'rgba(255, 107, 157, 0.1)',
      glow: 'rgba(255, 107, 157, 0.25)',
    },
  ];

  const stats = [
    { number: '500+', label: 'Mahasiswa' },
    { number: '150+', label: 'Project Aktif' },
    { number: '30+', label: 'Universitas' },
    { number: '99%', label: 'Match Rate' },
  ];

  const categories = [
    '🌐 Web Dev', '📱 Mobile', '🤖 AI/ML', '🎨 UI/UX',
    '📊 Data Science', '🔒 Security', '🎮 Game Dev', '🏆 Lomba',
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px 24px 60px',
            position: 'relative',
          }}
        >
          {/* Grid pattern overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(108, 99, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(108, 99, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', maxWidth: '820px' }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(108, 99, 255, 0.12)',
                border: '1px solid rgba(108, 99, 255, 0.25)',
                borderRadius: '999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#8b85ff',
                marginBottom: '32px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#6c63ff',
                  animation: 'pulse 2s infinite',
                }}
              />
              Platform Kolaborasi Mahasiswa Indonesia
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(40px, 7vw, 80px)',
                fontWeight: '900',
                lineHeight: '1.1',
                marginBottom: '24px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Temukan{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #6c63ff 0%, #00d4ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Rekan Terbaik
              </span>
              <br />
              untuk Proyekmu
            </h1>

            <p
              style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                marginBottom: '44px',
                maxWidth: '600px',
                margin: '0 auto 44px',
              }}
            >
              weCollab menghubungkan mahasiswa berdasarkan skill menggunakan teknologi{' '}
              <strong style={{ color: '#ff6b9d' }}>Redis</strong>. Match kandidat dengan{' '}
              <strong style={{ color: '#00d4ff' }}>SINTER</strong>, browse project lewat{' '}
              <strong style={{ color: '#00e5a0' }}>Sorted Set</strong>.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register">
                <button
                  id="hero-cta-register"
                  style={{
                    background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '16px 36px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 30px rgba(108, 99, 255, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.target as HTMLElement).style.boxShadow = '0 12px 40px rgba(108, 99, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                    (e.target as HTMLElement).style.boxShadow = '0 4px 30px rgba(108, 99, 255, 0.4)';
                  }}
                >
                  🚀 Mulai Kolaborasi
                </button>
              </Link>
              <Link href="/projects">
                <button
                  id="hero-cta-browse"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '14px',
                    padding: '16px 36px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.borderColor = 'rgba(108,99,255,0.5)';
                    (e.target as HTMLElement).style.background = 'rgba(108,99,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                    (e.target as HTMLElement).style.background = 'transparent';
                  }}
                >
                  Lihat Projects →
                </button>
              </Link>
            </div>
          </div>

          {/* Floating orbs */}
          <div
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
              left: '5%',
              top: '20%',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
              right: '8%',
              bottom: '20%',
              pointerEvents: 'none',
            }}
          />

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.2); }
            }
          `}</style>
        </section>

        {/* Stats */}
        <section
          style={{
            padding: '60px 24px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass"
                style={{
                  padding: '28px 20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '900',
                    background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '6px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {stat.number}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          style={{
            padding: '80px 24px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: '800',
                marginBottom: '16px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Fitur{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Unggulan
              </span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
              Dibangun di atas Redis 7.x dengan paradigma key-value murni untuk performa maksimal
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {features.map((feat) => (
              <div
                key={feat.title}
                className="glass card-hover"
                style={{ padding: '28px 24px' }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: feat.color,
                    border: `1px solid ${feat.glow}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    marginBottom: '18px',
                  }}
                >
                  {feat.icon}
                </div>
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {feat.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section
          style={{
            padding: '60px 24px',
            maxWidth: '900px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '800',
              marginBottom: '32px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Kategori Project
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {categories.map((cat) => (
              <Link key={cat} href="/projects">
                <button
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = 'rgba(108,99,255,0.15)';
                    (e.target as HTMLElement).style.borderColor = 'rgba(108,99,255,0.4)';
                    (e.target as HTMLElement).style.color = 'var(--purple-light)';
                    (e.target as HTMLElement).style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                    (e.target as HTMLElement).style.color = 'var(--text-secondary)';
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {cat}
                </button>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            padding: '100px 24px',
            textAlign: 'center',
          }}
        >
          <div
            className="glass-strong"
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              padding: '60px 40px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,212,255,0.05))',
                pointerEvents: 'none',
              }}
            />
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 40px)',
                fontWeight: '800',
                marginBottom: '16px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Siap Memulai Kolaborasi?
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '16px',
                marginBottom: '36px',
                lineHeight: '1.6',
              }}
            >
              Buat profil, daftarkan skill, dan temukan rekan terbaik dalam hitungan detik.
            </p>
            <Link href="/register">
              <button
                id="footer-cta-btn"
                style={{
                  background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '16px 44px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(108, 99, 255, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Daftar Sekarang — Gratis!
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: '24px',
            textAlign: 'center',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © 2024 weCollab · Dibangun dengan Next.js + Redis 7.x · Mini Project SBD
          </p>
        </footer>
      </main>
    </>
  );
}
