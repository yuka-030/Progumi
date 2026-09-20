import Link from "next/link";

type MenuCardProps = {
  href: string;
  title: string;
  description: string;
  icon: string;
  color: "primary" | "accent";
};

export default function MenuCard({
  href,
  title,
  description,
  icon,
  color,
}: MenuCardProps) {
  const colorStyle = {
    primary: "bg-primary/10 border-primary/20",
    accent: "bg-accent/10 border-accent/20",
  }[color];

  const decoColor = {
    primary: "bg-primary",
    accent: "bg-accent",
  }[color];

  const arrowColor = {
    primary: "text-primary",
    accent: "text-accent",
  }[color];

  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden ${colorStyle}`}
    >
      {/* 右下の装飾円 */}
      <div className={`absolute -bottom-4 -right-4 w-14 h-14 rounded-full opacity-20 ${decoColor}`} />

      <div className="text-2xl mb-2">{icon}</div>
      <h3
        className="text-base font-bold text-foreground mb-1"
        style={{ fontFamily: "var(--font-zen-maru)" }}
      >
        {title}
      </h3>
      <p className="text-xs text-gray-500">{description}</p>

      {/* 右下の矢印 */}
      <span className={`absolute bottom-3 right-4 text-sm opacity-40 ${arrowColor}`}>
        →
      </span>
    </Link>
  );
}