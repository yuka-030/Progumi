"use client";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
}: ButtonProps) {
  const baseStyle = "font-semibold rounded-full transition";

  const variantStyle = {
    primary: "bg-primary text-white",
    secondary: "bg-accent text-white",
    ghost: "bg-transparent text-primary",
  }[variant];

  const sizeStyle = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-base px-8 py-4",
  }[size];

  const disabledStyle = "opacity-50 cursor-not-allowed";

  // disabled時はコンポーネントの責務として
  // 明示的にクリック処理を無効化する
  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${
        disabled ? disabledStyle : ""
      }`}
    >
      {children}
    </button>
  );
}