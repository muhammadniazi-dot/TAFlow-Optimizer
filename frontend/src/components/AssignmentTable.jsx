import { useMemo, useState } from 'react';

const STATUS_CONFIG = {
  OK: { className: 'status-ok', icon: '✓', label: 'OK' },
  Conflict: { className: 'status-conflict', icon: '⚠', label: 'Conflict' },
  Overloaded: { className: 'status-overloaded', icon: '⚡', label: 'Overloaded' },
  Unassigned: { className: 'status-unassigned', icon: '○', label: 'Unassigned' },
};

const SORT_OPTIONS = [
  { value: 'none', label: 'Default' },
  { value: 'ta', label: 'TA Name' },
  { value: 'status', label: 'Status' },
  { value: 'time', label: 'Time' },
];

const STATUS_FILTER_OPTIONS = ['All', 'OK', 'Conflict', 'Overloaded', 'Unassigned'];

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.OK;

const AssignmentTable = ({ assignments }) => {
  const [sortBy, setSortBy] = useState('none');
  const [filterStatus, setFilterStatus] = useState('All');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const summary = useMemo(() => {
    const total = assignments.length;
    const conflicts = assignments.filter((a) => a.status === 'Conflict').length;
    const overloaded = assignments.filter((a) => a.status === 'Overloaded').length;
    const ok = assignments.filter((a) => a.status === 'OK').length;
    return { total, conflicts, overloaded, ok };
  }, [assignments]);

  const filtered = useMemo(() => {
    if (filterStatus === 'All') return assignments;
    return assignments.filter((a) => a.status === filterStatus);
  }, [assignments, filterStatus]);

  const sorted = useMemo(() => {
    if (sortBy === 'none') return filtered;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'ta') return (a.ta || '').localeCompare(b.ta || '');
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      if (sortBy === 'time') return (a.time || '').localeCompare(b.time || '');
      return 0;
    });
  }, [filtered, sortBy]);

  if (!assignments.length) {
    return (
      <section className="card assignment-dashboard">
        <div className="assignment-header">
          <h2>Assignments</h2>
        </div>
        <div className="assignment-empty">
          <span className="empty-icon" role="img" aria-label="clipboard">📋</span>
          <p>No assignments generated yet.</p>
          <p className="empty-sub">Add TAs and sections, then run the optimizer.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card assignment-dashboard">
      <div className="assignment-header">
        <h2>Assignments</h2>
        <span className="assignment-count">{assignments.length} total</span>
      </div>

      <div className="assignment-stats">
        <div className="stat-card stat-total">
          <span className="stat-value">{summary.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-ok">
          <span className="stat-value">{summary.ok}</span>
          <span className="stat-label">OK</span>
        </div>
        <div className="stat-card stat-conflict">
          <span className="stat-value">{summary.conflicts}</span>
          <span className="stat-label">Conflicts</span>
        </div>
        <div className="stat-card stat-overloaded">
          <span className="stat-value">{summary.overloaded}</span>
          <span className="stat-label">Overloaded</span>
        </div>
      </div>

      <div className="assignment-controls">
        <div className="filter-group">
          <span className="control-label">Filter:</span>
          <div className="filter-pills">
            {STATUS_FILTER_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`filter-pill${filterStatus === s ? ' filter-pill-active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="sort-group">
          <span className="control-label">Sort by:</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="assignment-list">
        {sorted.length === 0 ? (
          <p className="empty-state">No assignments match this filter.</p>
        ) : (
          sorted.map((item, index) => {
            const config = getStatusConfig(item.status);
            return (
              <div
                key={`${item.ta}-${item.section}-${item.time}-${index}`}
                className={`assignment-row${item.status === 'Conflict' ? ' assignment-row-conflict' : ''}`}
                style={{ animationDelay: `${index * 60}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="assignment-row-main">
                  <div className="assignment-ta">
                    <span className="row-icon" role="img" aria-label="TA">👤</span>
                    <span className="assignment-ta-name">{item.ta || '—'}</span>
                  </div>
                  <div className="assignment-section">
                    <span className="row-icon" role="img" aria-label="section">📚</span>
                    <span className="assignment-section-name">{item.section || '—'}</span>
                  </div>
                  <div className="assignment-time">
                    <span className="row-icon" role="img" aria-label="time">🕐</span>
                    <span className="assignment-time-text">{item.time || '—'}</span>
                  </div>
                  <div className="assignment-status-wrap">
                    <span className={`status-badge ${config.className}`}>
                      <span className="status-icon">{config.icon}</span>
                      {config.label}
                    </span>
                  </div>
                </div>
                {hoveredIndex === index && item.reason && (
                  <div className="assignment-reason">
                    <span className="reason-label">Note:</span> {item.reason}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default AssignmentTable;
