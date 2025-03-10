import React from 'react';
import Link from 'next/link';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
  secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-900 shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
  outline: 'bg-transparent border-2 border-primary-600 text-black hover:bg-primary-50 transform hover:-translate-y-0.5',
  ghost: 'bg-transparent hover:bg-secondary-100 text-black transform hover:-translate-y-0.5',
  danger: 'bg-error-600 hover:bg-error-700 text-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
  accent: 'bg-accent-500 hover:bg-accent-600 text-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
  success: 'bg-success-600 hover:bg-success-700 text-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
};

const sizes = {
  xs: 'py-1 px-2 text-xs rounded',
  sm: 'py-1.5 px-3 text-sm rounded-md',
  md: 'py-2 px-4 text-base rounded-lg',
  lg: 'py-2.5 px-6 text-lg rounded-lg',
  xl: 'py-3 px-8 text-xl rounded-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  disabled = false,
  type = 'button',
  onClick,
  icon,
  iconPosition = 'left',
  loading = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none disabled:transform-none';
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const allClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className} cursor-pointer`;

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span>{children}</span>
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={allClasses} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={allClasses }
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button; 