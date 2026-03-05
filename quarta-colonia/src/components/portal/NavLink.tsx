import type { ReactNode } from "react";

interface NavLinkProps {
  icon?: ReactNode;
  label: string;
}

export function NavLink({ icon, label }: NavLinkProps) {
  return (
    <span className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/10">
      <span aria-hidden="true">{icon ?? "•"}</span>
      <span>{label}</span>
    </span>
  );
}
