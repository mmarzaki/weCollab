'use client';

import { useState } from 'react';
import SkillBadge from './SkillBadge';

const PRESET_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'Figma', 'UI/UX', 'Machine Learning', 'Data Science', 'Flutter', 'Android',
  'iOS', 'DevOps', 'Docker', 'Kubernetes', 'Golang', 'Rust', 'Java', 'Spring',
  'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'C++', 'Unity',
  'Blender', 'Video Editing', 'Copywriting', 'Marketing', 'Lomba', 'Riset',
];

interface SkillPickerProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  label?: string;
}

export default function SkillPicker({
  selectedSkills,
  onChange,
  maxSkills = 10,
  label = 'Skills',
}: SkillPickerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredPresets = PRESET_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedSkills.includes(skill.toLowerCase())
  );

  const addSkill = (skill: string) => {
    const normalized = skill.trim().toLowerCase();
    if (!normalized) return;
    if (selectedSkills.includes(normalized)) return;
    if (selectedSkills.length >= maxSkills) return;
    onChange([...selectedSkills, normalized]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeSkill = (skill: string) => {
    onChange(selectedSkills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addSkill(inputValue);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
        }}
      >
        {label}
        {maxSkills && (
          <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '6px' }}>
            ({selectedSkills.length}/{maxSkills})
          </span>
        )}
      </label>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {selectedSkills.map((skill) => (
            <SkillBadge
              key={skill}
              skill={skill}
              removable
              onRemove={() => removeSkill(skill)}
            />
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ position: 'relative' }}>
        <input
          id="skill-input"
          type="text"
          className="input-field"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik skill atau pilih di bawah..."
          disabled={selectedSkills.length >= maxSkills}
          style={{ opacity: selectedSkills.length >= maxSkills ? 0.5 : 1 }}
        />

        {/* Dropdown suggestions */}
        {showSuggestions && filteredPresets.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              background: 'rgba(13, 13, 26, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '6px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 50,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {filteredPresets.slice(0, 10).map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(108,99,255,0.15)';
                  (e.target as HTMLElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = 'var(--text-secondary)';
                }}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick preset tags */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          maxHeight: showSuggestions ? '0' : 'auto',
          overflow: 'hidden',
        }}
      >
        {PRESET_SKILLS.filter((s) => !selectedSkills.includes(s.toLowerCase()))
          .slice(0, 12)
          .map((skill) => (
            <button
              key={skill}
              onClick={() => addSkill(skill)}
              disabled={selectedSkills.length >= maxSkills}
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
                opacity: selectedSkills.length >= maxSkills ? 0.4 : 1,
              }}
              onMouseEnter={(e) => {
                if (selectedSkills.length < maxSkills) {
                  (e.target as HTMLElement).style.background = 'rgba(108,99,255,0.2)';
                  (e.target as HTMLElement).style.borderColor = 'rgba(108,99,255,0.4)';
                  (e.target as HTMLElement).style.color = 'var(--purple-light)';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.target as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              + {skill}
            </button>
          ))}
      </div>
    </div>
  );
}
