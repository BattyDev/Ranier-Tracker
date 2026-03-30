import { useSignal } from '@preact/signals';
import { SetRows } from './SetRow.jsx';
import { FieldGrid } from './FieldGrid.jsx';

export function ExerciseCard({ exercise, logData, onLogChange, onMarkDone }) {
  const isOpen = useSignal(false);
  const showInfo = useSignal(false);
  const config = exercise.input_config || {};
  const isCompleted = logData?.is_completed || false;
  const isWeightedSets = config.type === 'weighted_sets';

  function toggleOpen() {
    isOpen.value = !isOpen.value;
  }

  function handleDataChange(newData) {
    onLogChange(exercise.id, newData);
  }

  function handleNotesChange(e) {
    const current = logData?.logged_data || {};
    onLogChange(exercise.id, { ...current, notes: e.target.value });
  }

  function handleMarkDone() {
    onMarkDone(exercise.id);
    isOpen.value = false;
  }

  return (
    <div class={`ex-card ${isCompleted ? 'logged' : ''}`}>
      <div class="ex-top" onClick={toggleOpen}>
        <div class="ex-dot" />
        <div class="ex-label">
          <div class="ex-name">{exercise.name}</div>
          {exercise.detail && <div class="ex-detail">{exercise.detail}</div>}
          {exercise.note && <div class="ex-note-text">{exercise.note}</div>}
        </div>
        {exercise.is_rainier && <span class="ex-rainier-tag">Rainier</span>}
        {exercise.description && (
          <button
            class="ex-info-btn"
            onClick={(e) => { e.stopPropagation(); showInfo.value = !showInfo.value; }}
            title="Exercise info"
          >ℹ</button>
        )}
        <span class={`ex-chevron ${isOpen.value ? 'open' : ''}`}>▼</span>
      </div>
      {showInfo.value && exercise.description && (
        <div class="ex-description">{exercise.description}</div>
      )}
      <div class={`ex-log ${isOpen.value ? 'open' : ''}`}>
        {isWeightedSets ? (
          <SetRows
            config={config}
            logData={logData?.logged_data || {}}
            onChange={handleDataChange}
            disabled={isCompleted}
          />
        ) : config.fields ? (
          <FieldGrid
            fields={config.fields}
            logData={logData?.logged_data || {}}
            onChange={handleDataChange}
            disabled={isCompleted}
          />
        ) : null}

        {config.has_notes && isWeightedSets && (
          <textarea
            class="notes-input"
            placeholder="Notes (pain level, how it felt...)"
            disabled={isCompleted}
            value={logData?.logged_data?.notes || ''}
            onInput={handleNotesChange}
          />
        )}

        <button
          class={`done-btn ${isCompleted ? 'completed' : ''}`}
          disabled={isCompleted}
          onClick={handleMarkDone}
        >
          {isCompleted ? 'Logged ✓' : 'Mark complete ✓'}
        </button>
      </div>
    </div>
  );
}
