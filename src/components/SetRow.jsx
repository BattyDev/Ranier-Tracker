const FEEL_OPTS = ['Easy', 'Moderate', 'Hard', 'Max'];

export function SetRows({ config, logData, onChange, disabled }) {
  const sets = config.sets || 3;
  const fieldsPerSet = config.fields_per_set || ['weight', 'reps', 'feel'];
  const setsData = logData?.sets || [];

  function updateSet(setIdx, field, value) {
    const newSets = [...setsData];
    while (newSets.length <= setIdx) newSets.push({});
    newSets[setIdx] = { ...newSets[setIdx], [field]: value };
    onChange({ ...logData, sets: newSets });
  }

  return (
    <div>
      <div class="set-row-header">
        <span></span>
        {fieldsPerSet.includes('weight') && <span>Weight (lbs)</span>}
        {fieldsPerSet.includes('reps') && <span>Reps</span>}
        {fieldsPerSet.includes('feel') && <span>Feel</span>}
      </div>
      <div class="sets-rows">
        {Array.from({ length: sets }, (_, i) => {
          const setData = setsData[i] || {};
          return (
            <div class="set-input-row" key={i}>
              <span class="set-num">S{i + 1}</span>
              {fieldsPerSet.includes('weight') && (
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="—"
                  value={setData.weight || ''}
                  disabled={disabled}
                  onInput={(e) => updateSet(i, 'weight', e.target.value)}
                />
              )}
              {fieldsPerSet.includes('reps') && (
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="—"
                  value={setData.reps || ''}
                  disabled={disabled}
                  onInput={(e) => updateSet(i, 'reps', e.target.value)}
                />
              )}
              {fieldsPerSet.includes('feel') && (
                <select
                  value={setData.feel || 'Easy'}
                  disabled={disabled}
                  onChange={(e) => updateSet(i, 'feel', e.target.value)}
                >
                  {FEEL_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
