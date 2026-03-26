import { signal } from '@preact/signals';

const toastMsg = signal('');
const toastVisible = signal(false);
let toastTimer = null;

export function showToast(msg) {
  toastMsg.value = msg;
  toastVisible.value = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastVisible.value = false; }, 2000);
}

export function Toast() {
  return (
    <div class={`toast ${toastVisible.value ? 'show' : ''}`}>
      {toastMsg.value}
    </div>
  );
}
