"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, FileText, Wallet, Settings } from "lucide-react";

const navItems = [
  { path: "/", label: "首页", icon: Home },
  { path: "/schedule", label: "日程", icon: Calendar },
  { path: "/diary", label: "日记", icon: FileText },
  { path: "/money", label: "记账", icon: Wallet },
  { path: "/settings", label: "设置", icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}