export function RestDayCard({ day, exercises, logData, onLogChange, disabled }) {
  return (
    <div>
      <div class="rest-card">
        <div class="rest-icon">{day.rest_icon || '🌿'}</div>
        <h3>Rest day</h3>
        <p>{day.rest_message}</p>
        {exercises.map(ex => {
          const config = ex.input_config || {};
          const fields = config.fields || [];
          const exLog = logData[ex.id]?.logged_data || {};

          return fields.map(f => (
            <div class="walk-log" key={f.key}>
              <label>{f.label}</label>
              <input
                type={f.input_type || 'number'}
                inputMode="numeric"
                placeholder={f.placeholder || 'Optional'}
                disabled={disabled}
                value={exLog[f.key] || ''}
                onInput={(e) => {
                  const newData = { ...exLog, [f.key]: e.target.value };
                  onLogChange(ex.id, newData);
                }}
              />
            </div>
          ));
        })}
      </div>
    </div>
  );
}
