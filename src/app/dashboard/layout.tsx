"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, Shield, Video, LogOut, KeyRound, Menu, X } from "lucide-react";
import { UserProvider, useUser } from "@/components/UserProvider";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabaseClient";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useUser();

  const navItems = [
    { name: "AI Training", href: "/dashboard", icon: MessageSquare },
    { name: "Gatekeeper Settings", href: "/dashboard/gatekeeper", icon: KeyRound },
    { name: "Asset Vault", href: "/dashboard/assets", icon: Shield },
    { name: "Media Vault", href: "/dashboard/media", icon: Video },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="absolute inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`absolute md:relative w-72 md:w-64 h-full border-r border-border/30 bg-background/95 md:bg-background/50 flex flex-col z-50 backdrop-blur-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-light tracking-tight text-foreground">Digital Legacy</h2>
              <p className="text-xs text-muted-foreground mt-1">Creator Dashboard</p>
            </div>
            <button 
              className="md:hidden p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          {user && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(user.id);
                toast.success("Creator ID copied to clipboard!");
              }}
              className="mt-6 w-full flex flex-col items-start bg-muted/30 p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-all text-left"
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Your Creator ID</span>
              <span className="text-xs font-mono text-indigo-400 mt-0.5 truncate w-full" title="Click to copy">
                {user.id}
              </span>
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-foreground/10 text-foreground shadow-lg shadow-white/5 border border-white/10" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/30">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col w-full h-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/30 bg-background/50 backdrop-blur-md z-30">
          <h1 className="text-lg font-medium tracking-tight text-foreground">Digital Legacy</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Liquid Mesh Background */}
        <div className="absolute inset-0 liquid-mesh opacity-60 mix-blend-screen pointer-events-none filter blur-[80px]" />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 z-10 relative">
          <div className="max-w-5xl mx-auto h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}
