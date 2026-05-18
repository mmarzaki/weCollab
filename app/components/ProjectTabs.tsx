'use client';

interface ProjectTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ProjectTabs({ activeTab, setActiveTab }: ProjectTabsProps) {
  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'buat', label: 'BUAT PROJECT' },
    { id: 'cari', label: 'CARI PROJECT' },
  ];

  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}

      <style jsx>{`
        .tabs-container {
          display: flex;
          background: #1a1a1a;
          padding: 0 24px;
          gap: 40px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tabs-container::-webkit-scrollbar {
          display: none;
        }

        .tab-button {
          background: none;
          border: none;
          color: #999;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.1em;
          padding: 16px 0;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.2s;
          position: relative;
        }

        .tab-button:hover {
          color: #fff;
        }

        .tab-button.active {
          color: #fff;
        }

        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #ff4d00; /* Superdry orange accent */
        }
      `}</style>
    </div>
  );
}
