import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background-primary">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        {children}
      </div>
    </div>
  );
}

