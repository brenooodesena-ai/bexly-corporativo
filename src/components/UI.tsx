import type { ReactNode, CSSProperties } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    style?: CSSProperties;
}

export const Button = ({
    children,
    variant = 'primary',
    onClick,
    className = '',
    type = 'button',
    disabled = false,
    style
}: ButtonProps) => {
    const baseStyles = 'btn-primary';
    const variantStyles = variant === 'secondary' ? 'btn-secondary' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={style}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) => (
    <div className={`card ${className}`} style={style}>
        {children}
    </div>
);

export const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false
}: {
    label: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-gray)' }}>
            {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
    </div>
);
