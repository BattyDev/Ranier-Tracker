import { currentScreen, theme, userTheme, currentUser } from './lib/state.js';
import { Landing } from './screens/Landing.jsx';
import { PinEntry } from './screens/PinEntry.jsx';
import { WeekSelect } from './screens/WeekSelect.jsx';
import { Tracker } from './screens/Tracker.jsx';

export function App() {
  const screen = currentScreen.value;
  const t = theme.value;
  const user = userTheme.value;

  return (
    <div data-theme={t} data-user={currentUser.value?.name || 'cody'}>
      {screen === 'landing' && <Landing />}
      {screen === 'pin' && <PinEntry />}
      {screen === 'weeks' && <WeekSelect />}
      {screen === 'tracker' && <Tracker />}
    </div>
  );
}
