import React, { useEffect, useState } from 'react';

const confirmEvent = new EventTarget();

export const confirm = (message) => {
  return new Promise((resolve) => {
    confirmEvent.dispatchEvent(new CustomEvent('confirm-request', { detail: { message, resolve } }));
  });
};

const ConfirmProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [resolver, setResolver] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail.message || 'Are you sure?');
      setResolver(() => e.detail.resolve);
      setOpen(true);
    };
    confirmEvent.addEventListener('confirm-request', handler);
    return () => confirmEvent.removeEventListener('confirm-request', handler);
  }, []);

  const resolve = (val) => {
    if (resolver) resolver(val);
    setOpen(false);
    setMessage('');
    setResolver(null);
  };

  return (
    <>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <div className="text-lg font-semibold mb-4">Confirm</div>
            <div className="mb-6 text-sm text-gray-700">{message}</div>
            <div className="flex justify-end gap-3">
              <button className="px-3 py-2 rounded-md" onClick={() => resolve(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-md bg-black text-white" onClick={() => resolve(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmProvider;
