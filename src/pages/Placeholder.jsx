export const Placeholder = ({ title }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '50%', marginBottom: '24px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      </div>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center' }}>
        Mô-đun này đang trong quá trình phát triển để kết nối với cơ sở dữ liệu thực.
      </p>
    </div>
  );
};
