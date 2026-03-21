"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Logs" },
  { href: "/resume", label: "Resume" },
  { href: "/profile", label: "Profile" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav>
      <div className="nav-brand">Stride</div>
      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={pathname === l.href ? "active" : ""}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Nav;
