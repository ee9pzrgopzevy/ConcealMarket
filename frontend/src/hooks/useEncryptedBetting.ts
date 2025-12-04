import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { encryptBet } from "@/lib/fhe";

const BETTING_ADDRESS = "0x7A59912d1C10B9Db146c86ab0eF493290f57A99D" as `0x${string}`;

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
    const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [isEncrypting, setIsEncrypting] = useState(false);

    // Wait for transaction confirmation
    const {
        isLoading: isConfirming,
        isSuccess,
        isError: isConfirmError,
        error: confirmError,
    } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Place encrypted bet with FHE
     */
    const placeBet = async (
        marketId: number,
        selectedOption: number,
        betAmountETH: string
    ): Promise<`0x${string}`> => {
        if (!address) throw new Error("Wallet not connected");

        // Convert ETH to wei
        const amountWei = parseEther(betAmountETH);

        // Get wallet provider for FHE encryption
        const walletProvider = walletClient?.transport || window.ethereum || (window as any).okxwallet;

        // Encrypt bet data using FHE SDK
        setIsEncrypting(true);
        try {
            const { optionHandle, amountHandle, proof } = await encryptBet(
                selectedOption,
                amountWei,
                BETTING_ADDRESS,
                address,
                walletProvider
            );
            setIsEncrypting(false);

            // Submit encrypted bet to contract
            const txHash = await writeContractAsync({
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

            return txHash;
        } catch (error) {
            setIsEncrypting(false);
            throw error;
        }
    };

    /**
     * Refund bet if market cancelled
     */
    const refundBet = async (marketId: number): Promise<`0x${string}`> => {
        const txHash = await writeContractAsync({
            address: BETTING_ADDRESS,
            abi: BETTING_ABI,
            functionName: "refundBet",
            args: [BigInt(marketId)],
        });
        return txHash;
    };

    return {
        placeBet,
        refundBet,
        hash,
        isPending,
        isEncrypting,
        isConfirming,
        isSuccess,
        isConfirmError,
        error: error || confirmError,
        reset,
    };
}
