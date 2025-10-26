import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Bookmark } from "lucide-react";

interface MarketCardProps {
  id: string;
  title: string;
  icon?: string;
  endDate: string;
  volume: string;
  status: number;
}

export const MarketCard = ({
  id,
  title,
  icon = "🎲",
  endDate,
  volume,
  status,
}: MarketCardProps) => {
  const isActive = status === 0;
  const isClosed = status === 1;
  const isSettled = status === 2;
  const isCancelled = status === 3;
  return (
    <Link to={`/market/${id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start gap-3 mb-3">
          {icon && (
            <div className="text-2xl flex-shrink-0">{icon}</div>
          )}
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
            {title}
          </h3>
          <button className="text-muted-foreground hover:text-foreground">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-600">
                Active
              </span>
            )}
            {isClosed && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-600">
                Closed
              </span>
            )}
            {isSettled && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-600">
                Settled
              </span>
            )}
            {isCancelled && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-600">
                Cancelled
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {volume}
          </span>
          <span>{endDate}</span>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-sm">🔐</span>
            <span className="text-xs text-blue-600 font-semibold">
              FHE Encrypted Market
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
