import { Link, useLocation } from 'wouter';
import { Bell, LayoutGrid, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location, setLocation] = useLocation();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
    { href: "/analytics", label: "Analytics" },
    { href: "/pricing", label: "Pricing" },
  ];

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/dashboard">
          <div className="flex items-center gap-2 mr-8 cursor-pointer group">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <LayoutGrid className="size-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">PolyTrack</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                location === link.href 
                  ? "bg-secondary text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}>
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="size-5" />
          </Button>
          
          <div className="h-8 w-px bg-border mx-2" />
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">Alex Trader</p>
              <p className="text-xs text-muted-foreground">Pro Member</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="size-9 border border-border cursor-pointer hover:border-primary/50 transition-colors">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>AT</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
