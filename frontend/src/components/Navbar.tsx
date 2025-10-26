import { Link } from "react-router-dom";
import { Search, TrendingUp } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  "Trending",
  "Breaking",
  "New",
  "Politics",
  "Sports",
  "Finance",
  "Crypto",
  "Geopolitics",
  "Tech",
  "Culture",
];

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span>Prediction Market</span>
          </Link>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search markets..."
                className="pl-10 bg-card"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link to="/create">
              <Button variant="outline">Create Market</Button>
            </Link>
            <ConnectButton />
          </div>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
