const toastEventTarget = new EventTarget();

export const notifyToast = (message) => {
  toastEventTarget.dispatchEvent(new CustomEvent('toast', { detail: { message } }));
};

export const onToast = (callback) => {
  const listener = (event) => callback(event.detail.message);
  toastEventTarget.addEventListener('toast', listener);
  return () => toastEventTarget.removeEventListener('toast', listener);
};
