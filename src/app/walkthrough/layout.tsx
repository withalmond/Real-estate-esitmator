import type { ReactNode } from "react";

export default function WalkthroughLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg">{children}</div>
  );
}
