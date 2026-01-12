import { solana } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'

// Get projectId from https://dashboard.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID || 'YOUR_PROJECT_ID'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [solana]

export const solanaWeb3JsAdapter = new SolanaAdapter()

export const metadata = {
  name: 'Colosseum Prediction Market',
  description: 'Prediction Market for Colosseum Project',
  url: window.location.origin,
  icons: ['/images/colosseum-logo.png']
}

// export const config = wagmiAdapter.wagmiConfigl