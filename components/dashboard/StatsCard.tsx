import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon size={21} />
        </div>
      </div>

      <h3 className="mt-5 text-3xl font-bold tracking-tight text-white">
        {value}
      </h3>

      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
}
