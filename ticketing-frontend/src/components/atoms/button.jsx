import React from 'react';

const Button = ({ text, className = '', type = 'button', onClick, disabled = false }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`p-4 text-sm rounded-lg font-semibold md:text-xl text-shadow-lg select-none ${className}`}
        >
            {text}
        </button>
    );
};

export default Button;
