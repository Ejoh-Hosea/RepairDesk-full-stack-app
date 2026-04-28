export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent text-black hover:bg-amber-400 active:scale-95",
    secondary:
      "bg-surface-hover text-gray-200 border border-surface-border hover:border-accent/40 hover:text-white active:scale-95",
    danger:
      "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 active:scale-95",
    ghost:
      "text-gray-400 hover:text-gray-200 hover:bg-surface-hover active:scale-95",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
