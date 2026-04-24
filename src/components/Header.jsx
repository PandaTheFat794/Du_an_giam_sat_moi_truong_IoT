import { Bell, User } from 'lucide-react';

export const Header = ({ title }) => {
  return (
    <div className="header">
      <div className="header-title">
        {title || 'Home Dashboard'}
      </div>
      <div className="header-actions">
        <button style={{ position: 'relative' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 8,
            height: 8,
            backgroundColor: 'var(--danger-color)',
            borderRadius: '50%'
          }}></span>
        </button>
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <span>Ember Crest</span>
        </div>
      </div>
    </div>
  );
};
