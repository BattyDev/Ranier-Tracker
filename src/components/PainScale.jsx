export function PainScale({ value, onChange, disabled, title, subtitle }) {
  function getClass(i) {
    if (value !== i) return 'pain-btn';
    if (i <= 3) return 'pain-btn sel-green';
    if (i <= 6) return 'pain-btn sel-yellow';
    return 'pain-btn sel-red';
  }

  return (
    <div class="pain-card">
      <h4>{title || 'Sciatica discomfort today'}</h4>
      <p>{subtitle || '0 = none · 5 = moderate · 10 = severe'}</p>
      <div class="pain-scale">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            class={getClass(i)}
            disabled={disabled}
            onClick={() => onChange(i)}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
