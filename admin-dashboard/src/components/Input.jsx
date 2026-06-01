import React from 'react';

const Input = ({ label, ...props }) => (
  <label className="block">
    {label && <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>}
    <input className="w-full border rounded-md px-3 py-2 bg-white focus:ring-1 focus:ring-black" {...props} />
  </label>
);

export default Input;
