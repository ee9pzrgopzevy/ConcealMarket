import { useWriteContract, useAccount, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { encryptBet } from "@/lib/fhe";
import { toast } from "sonner";

const BETTING_ADDRESS = "0x4875B940F966dBEfDe7b46f309C83C77be2Ca99F" as `0x${string}`;

const BETTING_ABI = [
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "encryptedOption", type: "bytes32" },
      { name: "encryptedAmount", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "refundBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function useEncryptedBetting() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  /**
   * Place encrypted bet with FHE
   */
  const placeBet = async (
    marketId: number,
    selectedOption: number,
    betAmountETH: string
  ) => {
    if (!address) throw new Error("Wallet not connected");

    try {
      // Convert ETH to wei
      const amountWei = parseEther(betAmountETH);

      // Get wallet provider for FHE encryption
      const walletProvider = walletClient?.transport || window.ethereum || (window as any).okxwallet;

      // Encrypt bet data using FHE SDK
      toast.info("Encrypting your bet...");
      const { optionHandle, amountHandle, proof } = await encryptBet(
        selectedOption,
        amountWei,
        BETTING_ADDRESS,
        address,
        walletProvider
      );

      // Submit encrypted bet to contract
      toast.info("Submitting encrypted bet...");
      return await writeContractAsync({
        address: BETTING_ADDRESS,
        abi: BETTING_ABI,
        functionName: "placeBet",
        args: [
          BigInt(marketId),
          optionHandle as `0x${string}`,
          amountHandle as `0x${string}`,
          proof as `0x${string}`,
        ],
        value: amountWei,
      });
    } catch (error) {
      console.error("Bet error:", error);
      throw error;
    }
  };

  /**
   * Refund bet if market cancelled
   */
  const refundBet = async (marketId: number) => {
    return await writeContractAsync({
      address: BETTING_ADDRESS,
      abi: BETTING_ABI,
      functionName: "refundBet",
      args: [BigInt(marketId)],
    });
  };

  return { placeBet, refundBet };
}
