export function FieldGrid({ fields, logData, onChange, disabled }) {
  const data = logData || {};

  function updateField(key, value) {
    onChange({ ...data, [key]: value });
  }

  const isSingle = fields.length === 1;

  return (
    <div class={`field-grid ${isSingle ? 'single' : ''}`}>
      {fields.map(f => {
        const isTextarea = f.input_type === 'textarea';
        const isSelect = f.input_type === 'select';
        const isFullWidth = isTextarea;

        return (
          <div class={`field-item ${isFullWidth ? 'full-width' : ''}`} key={f.key}>
            <label>{f.label}</label>
            {isTextarea ? (
              <textarea
                placeholder={f.placeholder || ''}
                rows="2"
                disabled={disabled}
                value={data[f.key] || ''}
                onInput={(e) => updateField(f.key, e.target.value)}
              />
            ) : isSelect ? (
              <select
                value={data[f.key] || (f.options?.[0] || '')}
                disabled={disabled}
                onChange={(e) => updateField(f.key, e.target.value)}
              >
                {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.input_type || 'text'}
                inputMode={f.input_type === 'number' ? 'decimal' : undefined}
                placeholder={f.placeholder || ''}
                disabled={disabled}
                value={data[f.key] || ''}
                onInput={(e) => updateField(f.key, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
