import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={className}
      style={{
        minHeight: "100dvh",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
}
