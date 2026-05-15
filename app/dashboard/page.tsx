'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import SkillBadge from '../components/SkillBadge';
import ProjectCard from '../components/ProjectCard';
import { PageLoading } from '../components/Toast';

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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, projRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/projects'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) setUser(meData.user);
        }

        if (projRes.ok) {
          const projData = await projRes.json();
          if (projData.projects) setProjects(projData.projects.slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <><Navbar /><PageLoading /></>;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

          {/* Hero Greeting */}
          <div
            className="glass"
            style={{
              padding: '36px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,255,0.06))',
              border: '1px solid rgba(108,99,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)' }} />
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              alt="avatar"
              style={{ width: '72px', height: '72px', borderRadius: '18px', border: '3px solid rgba(108,99,255,0.4)', objectFit: 'cover' }}
            />
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{greeting()}, 👋</p>
              <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user?.nama}</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {user?.jurusan}
                {user?.rumpun ? ` · ${user.rumpun}` : ''}
                {' · '}{user?.projectIds?.length || 0} project bergabung
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {[
              { label: 'Project Diikuti', value: user?.projectIds?.length || 0, icon: '📁', color: '#6c63ff' },
              { label: 'Skill Dimiliki', value: user?.skills?.length || 0, icon: '⚡', color: '#00d4ff' },
              { label: 'Project Tersedia', value: projects.length, icon: '🚀', color: '#00e5a0' },
            ].map((stat) => (
              <div key={stat.label} className="glass card-hover" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '40px' }}>
            {[
              { href: '/match', icon: '🎯', label: 'Cari Rekan by Skill', desc: 'Cocokkan berdasarkan skill & rumpun', color: 'rgba(108,99,255,0.15)', border: 'rgba(108,99,255,0.3)' },
              { href: '/projects', icon: '🔍', label: 'Browse Projects', desc: 'Temukan project untuk dilamar', color: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.25)' },
              { href: '/profile', icon: '👤', label: 'Edit Profil & Skill', desc: 'Update jurusan, rumpun, dan skill', color: 'rgba(0,229,160,0.1)', border: 'rgba(0,229,160,0.25)' },
            ].map((action) => (
              <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                <div className="card-hover" style={{ padding: '20px', borderRadius: '16px', background: action.color, border: `1px solid ${action.border}`, cursor: 'pointer', transition: 'all 0.25s ease' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{action.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{action.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{action.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* My Skills */}
          {user?.skills && user.skills.length > 0 && (
            <div className="glass" style={{ padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700' }}>⚡ Skill Saya</h2>
                <Link href="/profile" style={{ fontSize: '13px', color: 'var(--purple-light)', textDecoration: 'none', fontWeight: '600' }}>Edit →</Link>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {user.skills.map((skill) => <SkillBadge key={skill} skill={skill} />)}
              </div>
            </div>
          )}

          {/* Latest Projects */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700' }}>🚀 Project Terbaru</h2>
              <Link href="/projects" style={{ fontSize: '13px', color: 'var(--purple-light)', textDecoration: 'none', fontWeight: '600' }}>Lihat Semua →</Link>
            </div>
            {projects.length === 0 ? (
              <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <p style={{ color: 'var(--text-secondary)' }}>Belum ada project. Jadilah yang pertama!</p>
                <Link href="/projects"><button className="btn-primary" style={{ marginTop: '16px' }}>Buat Project</button></Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={{ ...project, kategori: project.bidang || project.kategori }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}