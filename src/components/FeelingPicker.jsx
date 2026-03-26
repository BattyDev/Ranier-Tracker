const FEELINGS = ['Easy', 'Good', 'Hard', 'Beat'];
const FEEL_CLASSES = { Easy: 'sel-easy', Good: 'sel-good', Hard: 'sel-hard', Beat: 'sel-beat' };

export function FeelingPicker({ value, onChange, disabled }) {
  return (
    <div class="pain-card">
      <h4>How did this feel?</h4>
      <p>Rate your overall session</p>
      <div class="feeling-row">
        {FEELINGS.map(f => (
          <button
            key={f}
            class={`feel-btn ${value === f ? FEEL_CLASSES[f] : ''}`}
            disabled={disabled}
            onClick={() => onChange(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
