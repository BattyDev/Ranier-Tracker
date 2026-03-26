import { currentUser } from '../lib/state.js';
import { PainScale } from './PainScale.jsx';
import { FeelingPicker } from './FeelingPicker.jsx';

export function CheckInWidget({ checkIn, onPainChange, onFeelingChange, disabled }) {
  const user = currentUser.value;
  const type = user?.check_in_type || 'pain_scale';

  if (type === 'pain_scale') {
    return (
      <PainScale
        value={checkIn?.pain_score ?? null}
        onChange={onPainChange}
        disabled={disabled}
      />
    );
  }

  return (
    <FeelingPicker
      value={checkIn?.feeling || ''}
      onChange={onFeelingChange}
      disabled={disabled}
    />
  );
}
