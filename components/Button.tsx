import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'gold';
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform active:scale-95 uppercase tracking-wide";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 focus:ring-blue-500",
        secondary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 focus:ring-emerald-500",
        danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 focus:ring-rose-500",
        outline: "bg-white border-2 border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600",
        gold: "bg-gradient-to-b from-yellow-400 to-orange-500 text-white border-b-4 border-yellow-700 hover:from-yellow-300 hover:to-orange-400 shadow-orange-500/50 text-shadow-sm"
    };
    const sizes = { sm: "px-4 py-1.5 text-sm", md: "px-6 py-2 text-base", lg: "px-10 py-3 text-xl" };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;