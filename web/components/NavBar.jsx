import Link from "next/link";

export default function NavBar({ variant = "default" }) {
  const isCopilot = variant === "copilot";

  return (
    <nav className="bg-dark-green h-[52px] px-4 sm:px-8 flex items-center justify-between flex-shrink-0">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="text-gold text-[18px]">◈</span>
        <span className="text-cream font-display font-bold text-[17px]">yatra</span>
        <span className="text-green text-[11px] font-medium ml-0.5 hidden sm:inline">discover india</span>
      </Link>

      {isCopilot ? (
        <Link
          href="/compare"
          className="bg-gold text-dark-green text-[13px] font-semibold px-4 py-[7px] rounded-[6px] no-underline"
        >
          Compare trips →
        </Link>
      ) : (
        <Link
          href="/copilot"
          className="bg-gold text-dark-green text-[13px] font-semibold px-3 sm:px-4 py-[7px] rounded-[6px] no-underline whitespace-nowrap"
        >
          <span className="sm:hidden">Get co-pilot</span>
          <span className="hidden sm:inline">Foreign traveler? Get a co-pilot</span>
        </Link>
      )}
    </nav>
  );
}
