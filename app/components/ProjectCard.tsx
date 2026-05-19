'use client';

import Link from 'next/link';
import SkillBadge from './SkillBadge';

interface Project {
  id: string;
  judul: string;
  deskripsi: string;
  owner_id: string;
  owner_nama: string;
  kategori: string;
  status: string;
  skills_needed: string[];
  member_count: number;
  created_at: string;
}

interface ProjectCardProps {
  project: Project;
  showJoinBtn?: boolean;
}

const KATEGORI_ICONS: Record<string, string> = {
  'Web Development': '🌐', 'Mobile App': '📱', 'Machine Learning': '🤖',
  'Data Science': '📊', 'UI/UX Design': '🎨', 'Cybersecurity': '🔒',
  'IoT': '⚡', 'Game Development': '🎮', 'Riset': '🔬', 'Research': '🔬',
  'Bisnis': '💼', 'Lomba': '🏆', 'Proyek': '📁', 'Lainnya': '📁', 'Other': '📁',
};

export default function ProjectCard({ project, showJoinBtn = true }: ProjectCardProps) {
  const icon = KATEGORI_ICONS[project.kategori] || '📁';
  const timeAgo = getTimeAgo(parseInt(project.created_at));

  return (
    <div style={{
      background: '#FFF7EE',
      border: '1.5px solid #1a1a1a',
      borderRadius: '10px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      cursor: 'pointer',
      transition: 'box-shadow 0.15s, transform 0.15s',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      boxSizing: 'border-box',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.boxShadow = '3px 3px 0 #1a1a1a';
      (e.currentTarget as HTMLElement).style.transform = 'translate(-1px,-1px)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      (e.currentTarget as HTMLElement).style.transform = 'none';
    }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '8px',
          background: '#ede8e1', border: '1px solid #ccc8c0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '10px', fontWeight: '600', color: '#888',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {project.kategori}
            </span>
            {project.status === 'open' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '10px', fontWeight: '600', color: '#1a1a1a',
                background: '#ede8e1', padding: '2px 7px', borderRadius: '999px',
                border: '1px solid #ccc8c0',
              }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: '#2d8a4e', animation: 'pcPulse 2s infinite',
                }} />
                Open
              </span>
            )}
          </div>
          <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{
              fontSize: '15px', fontWeight: '700', color: '#1a1a1a',
              lineHeight: '1.3', marginBottom: '4px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#555'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#1a1a1a'; }}
            >
              {project.judul}
            </h3>
          </Link>
          <p style={{ fontSize: '11px', color: '#999' }}>
            by {project.owner_nama} · {timeAgo}
          </p>
        </div>
      </div>

      {/* Deskripsi */}
      {project.deskripsi && (
        <p style={{
          fontSize: '13px', color: '#555', lineHeight: '1.5',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {project.deskripsi}
        </p>
      )}

      {/* Skills Needed */}
      {project.skills_needed && project.skills_needed.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {project.skills_needed.slice(0, 4).map((skill) => (
            <span key={skill} style={{
              padding: '3px 10px', borderRadius: '5px', fontSize: '11px',
              fontWeight: '500', background: '#ede8e1', border: '1px solid #ccc8c0',
              color: '#555',
            }}>
              {skill}
            </span>
          ))}
          {project.skills_needed.length > 4 && (
            <span style={{ fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center' }}>
              +{project.skills_needed.length - 4} lagi
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '12px', borderTop: '1px solid rgba(26,26,26,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#999' }}>
          <span>👥</span>
          <span>{project.member_count} anggota</span>
        </div>
        {showJoinBtn && project.status === 'open' && (
          <Link href={`/projects/${project.id}`}>
            <button style={{
              background: '#1a1a1a', color: '#FFF7EE', border: 'none',
              borderRadius: '6px', padding: '6px 14px', fontSize: '12px',
              fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#333'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#1a1a1a'; }}
            >
              Lihat →
            </button>
          </Link>
        )}
      </div>

      <style>{`
        @keyframes pcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID');
}
