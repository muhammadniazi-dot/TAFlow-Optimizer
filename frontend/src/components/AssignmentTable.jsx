const statusClass = (status) => {
  if (status === 'Conflict') {
    return 'status-conflict';
  }

  if (status === 'Overloaded') {
    return 'status-overloaded';
  }

  return 'status-ok';
};

const AssignmentTable = ({ assignments }) => {
  if (!assignments.length) {
    return (
      <section className="card">
        <h2>Assignments</h2>
        <p className="empty-state">No assignments yet. Add TAs and sections, then run optimizer.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Assignments</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>TA Name</th>
              <th>Section</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((item, index) => (
              <tr key={`${item.ta}-${item.section}-${item.time}-${index}`}>
                <td>{item.ta}</td>
                <td>{item.section}</td>
                <td>{item.time}</td>
                <td>
                  <span className={`status-badge ${statusClass(item.status)}`}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AssignmentTable;
