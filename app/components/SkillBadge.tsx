'use client';

import Link from 'next/link';

const SKILL_COLORS: Record<string, string> = {
  react: 'cyan',
  nextjs: 'purple',
  typescript: 'cyan',
  javascript: 'pink',
  python: 'green',
  nodejs: 'green',
  figma: 'pink',
  'ui/ux': 'pink',
  machine_learning: 'purple',
  data_science: 'cyan',
  flutter: 'cyan',
  android: 'green',
  ios: 'purple',
  devops: 'green',
  docker: 'cyan',
  kubernetes: 'cyan',
  golang: 'cyan',
  rust: 'pink',
  java: 'pink',
  spring: 'green',
  default: 'purple',
};

function getSkillColor(skill: string): string {
  const lower = skill.toLowerCase().replace(/\s+/g, '_');
  return SKILL_COLORS[lower] || SKILL_COLORS['default'];
}

interface SkillBadgeProps {
  skill: string;
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
}

export default function SkillBadge({ skill, size = 'md', removable = false, onRemove }: SkillBadgeProps) {
  const color = getSkillColor(skill);

  const colorStyles = {
    cyan: {
      background: 'rgba(0, 212, 255, 0.15)',
      color: '#40e0ff',
      border: '1px solid rgba(0, 212, 255, 0.25)',
    },
    purple: {
      background: 'rgba(108, 99, 255, 0.2)',
      color: '#8b85ff',
      border: '1px solid rgba(108, 99, 255, 0.3)',
    },
    green: {
      background: 'rgba(0, 229, 160, 0.15)',
      color: '#00e5a0',
      border: '1px solid rgba(0, 229, 160, 0.25)',
    },
    pink: {
      background: 'rgba(255, 107, 157, 0.15)',
      color: '#ff6b9d',
      border: '1px solid rgba(255, 107, 157, 0.25)',
    },
  };

  const styles = colorStyles[color as keyof typeof colorStyles] || colorStyles.purple;
  const paddingStyle = size === 'sm' ? '3px 8px' : '4px 10px';
  const fontSizeStyle = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: paddingStyle,
        borderRadius: '999px',
        fontSize: fontSizeStyle,
        fontWeight: '600',
        letterSpacing: '0.02em',
        ...styles,
      }}
    >
      {skill}
      {removable && (
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            padding: '0',
            marginLeft: '2px',
            fontSize: '13px',
            lineHeight: '1',
            opacity: '0.7',
          }}
          title={`Hapus ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
