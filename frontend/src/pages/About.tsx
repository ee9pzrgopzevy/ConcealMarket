import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Zap, Users, Globe, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Demo Video Section */}
        <section className="mb-12">
          <div className="aspect-video w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden">
            <video
              className="w-full h-full"
              controls
              poster=""
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* About Section */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">About ConcealMarket</h1>
            <p className="text-xl text-muted-foreground">
              The world's first privacy-preserving prediction market powered by Fully Homomorphic Encryption (FHE)
            </p>
          </div>

          <Card className="p-8 max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl font-semibold mb-4">What is ConcealMarket?</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                ConcealMarket is a revolutionary blockchain-based prediction market platform that leverages{" "}
                <strong className="text-foreground">Zama's Fully Homomorphic Encryption (FHE)</strong> technology
                to ensure complete privacy for all participants.
              </p>
              <p>
                Unlike traditional prediction markets where bet amounts and choices are publicly visible on-chain,
                ConcealMarket encrypts all sensitive data using FHE, allowing the smart contracts to perform
                computations on encrypted data without ever revealing the underlying information.
              </p>
              <p>
                This breakthrough technology enables participants to make predictions and place bets with complete
                confidence that their strategies, positions, and bet sizes remain private until market settlement.
              </p>
            </div>
          </Card>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Complete Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      Your bet amounts and predictions are encrypted using FHE technology.
                      No one can see your positions until the market is settled.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
                    <p className="text-sm text-muted-foreground">
                      Data is encrypted on your device before submission to the blockchain.
                      Smart contracts compute on encrypted data without decryption.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Fair & Transparent</h3>
                    <p className="text-sm text-muted-foreground">
                      All market rules and settlement logic are executed by auditable smart contracts
                      on the Ethereum blockchain.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Feature 4 */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Decentralized</h3>
                    <p className="text-sm text-muted-foreground">
                      No central authority controls the markets. Anyone can create markets
                      and participate in predictions.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Feature 5 */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <Globe className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Global Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Accessible worldwide with just a Web3 wallet. No KYC required.
                      Participate from anywhere in the world.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Feature 6 */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-teal-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Low Fees</h3>
                    <p className="text-sm text-muted-foreground">
                      Only 2% platform fee on winnings. Market creation requires a small
                      fee to prevent spam.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>

            <Card className="p-8">
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">1</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Browse Markets</h3>
                    <p className="text-muted-foreground">
                      Explore active prediction markets on various topics including crypto, AI,
                      sports, politics, and more.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-green-600">2</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Place Encrypted Bet</h3>
                    <p className="text-muted-foreground">
                      Select your prediction and bet amount. Your choice and amount are encrypted
                      using FHE on your device before being submitted to the blockchain.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-600">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Wait for Settlement</h3>
                    <p className="text-muted-foreground">
                      After the market deadline, an oracle determines the winning outcome.
                      Your bet remains encrypted throughout this process.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-orange-600">4</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Claim Rewards</h3>
                    <p className="text-muted-foreground">
                      If your prediction was correct, claim your proportional share of the prize pool.
                      Winnings are automatically calculated based on encrypted bet data.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Technology Stack</h2>

            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Blockchain</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ethereum Sepolia Testnet</li>
                    <li>• Solidity Smart Contracts</li>
                    <li>• Hardhat Development</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Encryption</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Zama fhEVM v0.8.0</li>
                    <li>• FHE Relayer SDK v0.2.0</li>
                    <li>• Client-side Encryption</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Frontend</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• React 18 + TypeScript</li>
                    <li>• Vite Build Tool</li>
                    <li>• Tailwind CSS</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Web3 Integration</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Wagmi v2 + RainbowKit</li>
                    <li>• Multi-wallet Support</li>
                    <li>• MetaMask, OKX, Coinbase</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Privacy Guarantee */}
        <section className="mb-12">
          <Card className="p-8 max-w-4xl mx-auto bg-blue-500/5 border-blue-500/20">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold mb-4">Privacy Guarantee</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                ConcealMarket uses cutting-edge Fully Homomorphic Encryption (FHE) technology from Zama.
                This ensures that your bet amounts and predictions remain completely private and encrypted
                on the blockchain, even while smart contracts compute odds and payouts. Your privacy is
                mathematically guaranteed.
              </p>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default About;
