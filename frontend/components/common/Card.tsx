"use client";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function Card({ children, className = "", onClick }: CardProps) {
  const baseStyle =
    "bg-card rounded-2xl border border-pink-100 shadow-sm p-6";

  const clickableStyle = onClick
    ? "cursor-pointer hover:shadow-md transition"
    : "";

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${clickableStyle} ${className}`}
    >
      {children}
    </div>
  );
}