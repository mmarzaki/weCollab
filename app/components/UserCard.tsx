'use client';

import Link from 'next/link';
import SkillBadge from './SkillBadge';

interface User {
  id: string;
  nama: string;
  jurusan: string;
  bio: string;
  skills: string[];
  avatar: string;
  project_count?: number;
}

interface UserCardProps {
  user: User;
  matchedSkills?: string[];
}

export default function UserCard({ user, matchedSkills = [] }: UserCardProps) {
  return (
    <div
      className="glass card-hover fade-in-up"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            alt={user.nama}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              objectFit: 'cover',
              border: '2px solid rgba(108, 99, 255, 0.3)',
            }}
          />
          {matchedSkills.length > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                border: '2px solid var(--bg-primary)',
              }}
            >
              ✓
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '3px',
            }}
          >
            {user.nama}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.jurusan}</p>
        </div>
        {user.project_count !== undefined && (
          <div
            style={{
              background: 'rgba(108,99,255,0.15)',
              border: '1px solid rgba(108,99,255,0.25)',
              borderRadius: '8px',
              padding: '4px 8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--purple-light)' }}>
              {user.project_count}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Project
            </div>
          </div>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
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
          {user.bio}
        </p>
      )}

      {/* Skills */}
      {user.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {user.skills.slice(0, 5).map((skill) => (
            <SkillBadge key={skill} skill={skill} size="sm" />
          ))}
          {user.skills.length > 5 && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              +{user.skills.length - 5} lagi
            </span>
          )}
        </div>
      )}

      {/* Matched Skills Indicator */}
      {matchedSkills.length > 0 && (
        <div
          style={{
            background: 'rgba(0, 229, 160, 0.08)',
            border: '1px solid rgba(0, 229, 160, 0.2)',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#00e5a0',
          }}
        >
          ✅ Cocok: {matchedSkills.join(', ')}
        </div>
      )}

      {/* Action — link menuju profil user yang benar */}
      <Link href={`/profile/${user.id}`} style={{ textDecoration: 'none' }}>
        <button
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(108, 99, 255, 0.3)',
            borderRadius: '10px',
            padding: '9px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--purple-light)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = 'rgba(108, 99, 255, 0.15)';
            (e.target as HTMLElement).style.borderColor = 'rgba(108, 99, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'transparent';
            (e.target as HTMLElement).style.borderColor = 'rgba(108, 99, 255, 0.3)';
          }}
        >
          Lihat Profil →
        </button>
      </Link>
    </div>
  );
}