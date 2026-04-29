export const Header = ({ title }) => {
  return (
    <div className="header">
      <div className="header-title">
        {title || 'Dashboard'}
      </div>
    </div>
  );
};
