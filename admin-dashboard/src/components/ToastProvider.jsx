import { useEffect, useState } from 'react';
import { onToast } from '../utils/toast';

const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const removeListener = onToast((text) => {
      setMessage(text);
      window.setTimeout(() => setMessage(''), 4000);
    });
    return removeListener;
  }, []);

  return (
    <>
      {children}
      {message && (
        <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl shadow-slate-950/40">
          {message}
        </div>
      )}
    </>
  );
};

export default ToastProvider;
