import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md bg-card rounded-[24px] shadow-sm p-8 border border-pink-100">
      {children}
    </div>
  );
}
