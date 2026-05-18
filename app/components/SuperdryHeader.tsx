'use client';

import Link from 'next/link';

export default function SuperdryHeader() {
  return (
    <header className="superdry-header">
      <div className="superdry-top-bar">
        <div className="superdry-announcement">
          <span>WECOLLAB → CONNECT. COLLABORATE. CREATE.</span>
          <span className="superdry-search-icon">🔍</span>
        </div>
        <div className="superdry-top-right">
          <span>INDONESIA</span>
          <span>HELP</span>
        </div>
      </div>
      
      <div className="superdry-main-nav">
        <div className="superdry-logo-container">
          <h1 className="superdry-logo">
            WeCollab<span>®</span>
          </h1>
          <div className="superdry-japanese">
            極度協力<span>(しなさい)</span>
          </div>
        </div>
        
        <div className="superdry-nav-actions">
          <div className="superdry-user-info">
            <span className="superdry-currency">IDR</span>
            <div className="superdry-icon-group">
              <span className="superdry-icon">👤</span>
              <span className="superdry-icon">❤️</span>
              <span className="superdry-icon">≡</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .superdry-header {
          width: 100%;
          background: #FFF7EE;
          border-bottom: 2px solid #1a1a1a;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1a1a1a;
        }

        .superdry-top-bar {
          display: flex;
          justify-content: space-between;
          padding: 8px 24px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(26, 26, 26, 0.1);
        }

        .superdry-announcement {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .superdry-top-right {
          display: flex;
          gap: 16px;
        }

        .superdry-main-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          height: 100px;
        }

        .superdry-logo-container {
          display: flex;
          flex-direction: column;
        }

        .superdry-logo {
          font-size: 64px;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.9;
          margin: 0;
          text-transform: none;
        }

        .superdry-logo span {
          font-size: 32px;
          vertical-align: top;
          margin-left: 4px;
        }

        .superdry-japanese {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-top: -4px;
        }

        .superdry-japanese span {
          font-weight: 400;
          margin-left: 4px;
        }

        .superdry-nav-actions {
          display: flex;
          align-items: center;
        }

        .superdry-user-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .superdry-currency {
          font-size: 12px;
          font-weight: 700;
        }

        .superdry-icon-group {
          display: flex;
          gap: 12px;
        }

        .superdry-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1a1a1a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .superdry-logo {
            font-size: 40px;
          }
          .superdry-main-nav {
            height: 80px;
          }
          .superdry-top-bar {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
