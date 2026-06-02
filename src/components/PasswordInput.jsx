import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({ className = '', wrapperClassName = '', children, disabled, ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      {children}
      <input
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={className}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
        aria-label={visible ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
      >
        {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;
