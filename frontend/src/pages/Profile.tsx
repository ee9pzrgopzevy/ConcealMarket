import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, History, LineChart } from "lucide-react";
import { formatEther } from "viem";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Profile = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  // Mock data - Replace with actual data from contracts
  const [walletBalance] = useState("1.5"); // ETH
  const [totalBets] = useState(12);
  const [totalWagered] = useState("2.5"); // ETH
  const [totalProfit] = useState("0.8"); // ETH
  const [profitPercentage] = useState(32); // %

  // Mock betting history
  const bettingHistory = [
    {
      marketId: 0,
      question: "Will Bitcoin reach $150,000 by end of 2025?",
      option: "Yes",
      amount: "0.1",
      status: "pending",
      date: "2025-01-20",
    },
    {
      marketId: 1,
      question: "Will Ethereum upgrade to ETH 3.0 successfully in 2025?",
      option: "No",
      amount: "0.2",
      status: "pending",
      date: "2025-01-19",
    },
    {
      marketId: 2,
      question: "Which AI company will have the highest valuation?",
      option: "Anthropic",
      amount: "0.15",
      status: "won",
      profit: "0.3",
      date: "2025-01-18",
    },
  ];

  // Mock profit chart data
  const profitChartData = [
    { date: "Jan 15", profit: 0 },
    { date: "Jan 16", profit: 0.1 },
    { date: "Jan 17", profit: 0.05 },
    { date: "Jan 18", profit: 0.3 },
    { date: "Jan 19", profit: 0.5 },
    { date: "Jan 20", profit: 0.8 },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to view your profile
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Wallet Balance</span>
            </div>
            <p className="text-2xl font-bold">{walletBalance} ETH</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <History className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Bets</span>
            </div>
            <p className="text-2xl font-bold">{totalBets}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Wagered</span>
            </div>
            <p className="text-2xl font-bold">{totalWagered} ETH</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <LineChart className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Profit</span>
            </div>
            <p className="text-2xl font-bold text-green-500">
              +{totalProfit} ETH
            </p>
            <p className="text-sm text-muted-foreground">+{profitPercentage}%</p>
          </Card>
        </div>

        {/* Profit Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Profit Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={profitChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </Card>

        {/* Betting History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Betting History</h2>
          <div className="space-y-4">
            {bettingHistory.map((bet, index) => (
              <div
                key={index}
                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{bet.question}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Option: {bet.option}</span>
                      <span>Amount: {bet.amount} ETH</span>
                      <span>{bet.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bet.status === "won"
                          ? "bg-green-500/10 text-green-500"
                          : bet.status === "lost"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {bet.status === "won"
                        ? "Won"
                        : bet.status === "lost"
                        ? "Lost"
                        : "Pending"}
                    </span>
                    {bet.status === "won" && bet.profit && (
                      <span className="text-sm font-medium text-green-500">
                        +{bet.profit} ETH
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/market/${bet.marketId}`)}
                >
                  View Market
                </Button>
              </div>
            ))}
          </div>

          {bettingHistory.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No betting history yet</p>
              <Button onClick={() => navigate("/")}>Browse Markets</Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Profile;
