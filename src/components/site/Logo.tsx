import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/acsess-logo.png.asset.json";

export function Logo({ className = "" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`} aria-label="Acsess Health home">
      <img
        src={logoAsset.url}
        alt="Acsess"
        width={236}
        height={58}
        className="h-8 w-auto lg:h-9"
      />
    </Link>
  );
}
