export const HistoryTable = ({
  data,
  historyFilter,
  setHistoryFilter,
  appliedHistoryFilter,
  applyHistoryFilter,
  clearHistoryFilter,
}) => {
  const rows = [...data].slice().reverse();
  const isFiltered = Boolean(appliedHistoryFilter.from || appliedHistoryFilter.to);

  const handleChange = (field, value) => {
    setHistoryFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExportCSV = () => {
    if (rows.length === 0) return;

    const headers = ['Ngày', 'Thời gian', 'Nhiệt độ (°C)', 'Độ ẩm (%)', 'Ánh sáng (lux)'];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(item => [
        item.date,
        item.time,
        item.temperature,
        item.humidity,
        item.light
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lich_su_iot_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card history-table-container">
      <div className="history-header">
        <div>
          <h3 className="chart-title">Lịch sử cảm biến</h3>
          <p className="history-subtitle">
            {isFiltered ? 'Đang xem dữ liệu trong khoảng thời gian đã chọn.' : 'Hiển thị các bản ghi cảm biến mới nhất.'}
          </p>
        </div>

        <div className="history-filters">
          <label>
            Từ
            <input
              type="datetime-local"
              value={historyFilter.from}
              onChange={(event) => handleChange('from', event.target.value)}
            />
          </label>
          <label>
            Đến
            <input
              type="datetime-local"
              value={historyFilter.to}
              onChange={(event) => handleChange('to', event.target.value)}
            />
          </label>
          <button className="filter-button primary" onClick={applyHistoryFilter}>
            Xem lịch sử
          </button>
          <button className="filter-button" onClick={clearHistoryFilter}>
            Xóa lọc
          </button>
          <button className="filter-button" onClick={handleExportCSV} style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}>
            Xuất CSV
          </button>
        </div>
      </div>


      {rows.length === 0 ? (
        <div className="empty-table-message">Không có dữ liệu cảm biến trong khoảng thời gian này.</div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Thời gian</th>
                <th>Nhiệt độ</th>
                <th>Độ ẩm</th>
                <th>Ánh sáng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={item.id || `${item.time}-${index}`}>
                  <td>{item.date}</td>
                  <td>{item.time}</td>
                  <td>{item.temperature} °C</td>
                  <td>{item.humidity} %</td>
                  <td>{item.light} lux</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
