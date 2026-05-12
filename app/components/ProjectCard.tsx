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
  'Web Development': '🌐',
  'Mobile App': '📱',
  'Machine Learning': '🤖',
  'Data Science': '📊',
  'UI/UX Design': '🎨',
  'Cybersecurity': '🔒',
  'IoT': '⚡',
  'Game Development': '🎮',
  'Riset': '🔬',
  'Bisnis': '💼',
  'Lomba': '🏆',
  'Other': '📁',
};

export default function ProjectCard({ project, showJoinBtn = true }: ProjectCardProps) {
  const icon = KATEGORI_ICONS[project.kategori] || '📁';
  const timeAgo = getTimeAgo(parseInt(project.created_at));

  return (
    <div
      className="glass card-hover fade-in-up"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow accent */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '600',
                color: 'var(--purple-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {project.kategori}
            </span>
            {project.status === 'open' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'var(--green)',
                  background: 'rgba(0,229,160,0.1)',
                  padding: '2px 6px',
                  borderRadius: '999px',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--green)',
                    animation: 'pulse 2s infinite',
                  }}
                />
                Open
              </span>
            )}
          </div>
          <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                lineHeight: '1.3',
                marginBottom: '4px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = 'var(--purple-light)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = 'var(--text-primary)';
              }}
            >
              {project.judul}
            </h3>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            by {project.owner_nama} · {timeAgo}
          </p>
        </div>
      </div>

      {/* Deskripsi */}
      {project.deskripsi && (
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.deskripsi}
        </p>
      )}

      {/* Skills Needed */}
      {project.skills_needed && project.skills_needed.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {project.skills_needed.slice(0, 4).map((skill) => (
            <SkillBadge key={skill} skill={skill} size="sm" />
          ))}
          {project.skills_needed.length > 4 && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              +{project.skills_needed.length - 4} lagi
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <span>👥</span>
          <span>{project.member_count} anggota</span>
        </div>
        {showJoinBtn && project.status === 'open' && (
          <Link href={`/projects/${project.id}`}>
            <button
              style={{
                background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              Lihat →
            </button>
          </Link>
        )}
      </div>

      <style>{`
        @keyframes pulse {
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
