// Progumi/frontend/components/admin/AdminSidebar.tsx
import Link from "next/link";

const MENU_ITEMS = [
  { label: "ダッシュボード", href: "/admin" },
  { label: "用語管理", href: "/admin/terms" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 bg-card border-r border-pink-100 min-h-screen p-4 space-y-2">
      {MENU_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2 rounded-2xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
