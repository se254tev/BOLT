import React, { useState } from 'react';
import { notifyToast } from '../utils/toast';
import { confirm } from './ConfirmProvider';

const Button = ({ children, variant = 'primary', className = '', onClick, confirmText, successMessage, errorMessage, disabled: disabledProp, type = 'button', ...props }) => {
  const [loading, setLoading] = useState(false);
  const base = 'px-4 py-2 rounded-md font-medium focus:outline-none disabled:opacity-50';
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900',
    secondary: 'bg-white border text-gray-800 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700',
  };

  const handleClick = async (e) => {
    if (loading) return;
    if (confirmText) {
      const ok = await confirm(confirmText);
      if (!ok) return;
    }
    if (!onClick) return;
    try {
      const res = onClick(e);
      if (res && res.then) {
        setLoading(true);
        await res;
      }
      if (successMessage) notifyToast(successMessage);
    } catch (err) {
      notifyToast(errorMessage || (err?.message || 'An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type={type} className={`${base} ${variants[variant] || variants.primary} ${className}`} onClick={handleClick} disabled={loading || disabledProp} {...props}>
      {loading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
};

export default Button;
