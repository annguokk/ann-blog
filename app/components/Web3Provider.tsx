"use client"
import React, { useEffect, useState } from 'react'

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const [ProviderComp, setProviderComp] = useState<React.ElementType | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const wagmi: any = await import('wagmi')
        const publicProv: any = await import('wagmi/providers/public')
        const mm: any = await import('wagmi/connectors/metaMask')
        const viemChains: any = await import('viem/chains')

        const { configureChains, createConfig, WagmiConfig } = wagmi
        const { publicProvider } = publicProv
        const { MetaMaskConnector } = mm
        const { sepolia } = viemChains

        if (!configureChains || !publicProvider || !MetaMaskConnector || !sepolia) {
          console.warn('Wagmi dependencies not available (missing configureChains, publicProvider, MetaMaskConnector, or sepolia)')
          return
        }

        let config: any = null
        try {
          const configured = configureChains([sepolia], [publicProvider()])
          const publicClient = configured?.publicClient

          config = createConfig({
            autoConnect: true,
            connectors: [new MetaMaskConnector({ chains: [sepolia] })],
            publicClient,
          })
        } catch (configErr) {
          console.warn('configureChains or createConfig failed; creating minimal config', configErr)
          // Fallback: create a minimal config without publicClient
          try {
            config = createConfig({
              autoConnect: true,
              connectors: [new MetaMaskConnector({ chains: [sepolia] })],
            })
          } catch (minimalErr) {
            console.error('Fallback createConfig also failed', minimalErr)
            return
          }
        }

        if (!config) return

        const Comp: React.FC<any> = ({ children: c }) => React.createElement(WagmiConfig, { config }, c)
        if (mounted) setProviderComp(() => Comp)
      } catch (e) {
        console.error('Failed to initialize wagmi client dynamically', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (!ProviderComp) return <>{children}</>

  const Comp = ProviderComp
  return <Comp>{children}</Comp>
}
