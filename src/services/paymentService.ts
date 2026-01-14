import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

const CREATION_FEE_SOL = 0.05 // 0.05 SOL for testing (change to 5 for production)

// Treasury wallet address (update this with your actual treasury address)
// TODO: Replace with your actual treasury wallet address
const TREASURY_WALLET = process.env.VITE_TREASURY_WALLET || '11111111111111111111111111111111'

export class PaymentService {
  /**
   * Send SOL payment for market creation
   * @param walletProvider Wallet provider from AppKit
   * @param amount Amount in SOL (defaults to CREATION_FEE_SOL)
   * @returns Transaction signature
   */
  async payMarketCreationFee(
    walletProvider: any,
    amount: number = CREATION_FEE_SOL
  ): Promise<string> {
    if (!walletProvider || !walletProvider.publicKey) {
      throw new Error('Wallet not connected')
    }

    const connection = new Connection(
      import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    )

    const fromPubkey = walletProvider.publicKey
    const toPubkey = new PublicKey(TREASURY_WALLET)
    const lamports = Math.round(amount * LAMPORTS_PER_SOL)

    // Create transfer instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    })

    // Create transaction
    const transaction = new Transaction().add(transferInstruction)

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey

    // Sign transaction
    const signedTransaction = await walletProvider.signTransaction(transaction)
    
    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    })

    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed')

    return signature
  }

  /**
   * Check if user is admin (free creation)
   */
  async isAdmin(userId: string): Promise<boolean> {
    const { supabase } = await import('../lib/supabase')
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return data.is_admin === true
  }

  /**
   * Get creation fee amount
   */
  getCreationFee(): number {
    return CREATION_FEE_SOL
  }
}

export const paymentService = new PaymentService()

