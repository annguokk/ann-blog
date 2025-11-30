"use client"
import React, { useEffect, useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { parseEther } from 'viem'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { sepolia } from 'viem/chains'

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

type Props = {
  contractAddress?: string
  postId?: string
}

const ABI = [
  {
    type: 'function',
    name: 'donate',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getDonation',
    inputs: [{ name: 'donor', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

function shortAddr(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

// Create viem clients for transaction
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://eth-sepolia.g.alchemy.com/v2/demo'),
})

export default function TipButton({ contractAddress = '0x295066613C2bd716D293Edd0dcEB577D35EF5f40', postId }: Props) {
  const [amount, setAmount] = useState<string>('0.01')
  const [loading, setLoading] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; text: string }>>([])
  const [isClient, setIsClient] = useState(false)

  // Wagmi hooks - called unconditionally at top level
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  function pushToast(text: string) {
    const id = Date.now()
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  async function connectWallet() {
    try {
      // Check if MetaMask is available
      if (typeof window === 'undefined' || !window.ethereum) {
        pushToast('请先安装 MetaMask 钱包扩展')
        return
      }

      // Request account access directly from MetaMask
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts && accounts.length > 0) {
        // Switch to Sepolia network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
          })
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia',
                    rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  },
                ],
              })
              pushToast('已添加 Sepolia 网络')
            } catch (addError) {
              console.error('Failed to add Sepolia network', addError)
              pushToast('无法添加 Sepolia 网络，请手动添加')
              return
            }
          } else {
            console.warn('Failed to switch network', switchError)
            pushToast('请手动切换到 Sepolia 网络')
          }
        }

        // Try to connect via wagmi as well for state sync
        try {
          await connect({ connector: new MetaMaskConnector() })
        } catch (e) {
          console.warn('Wagmi connect failed, but MetaMask accounts available', e)
        }
        pushToast('钱包已连接，已切换到 Sepolia 网络')
      }
    } catch (e: any) {
      console.error('Connect error:', e)
      if (e?.code === 4001) {
        pushToast('用户取消了连接')
      } else {
        pushToast(e?.message ?? '连接钱包失败')
      }
    }
  }

  function confirmTip() {
    const n = Number(amount)
    if (!amount || isNaN(n) || n <= 0) {
      pushToast('请输入有效的金额')
      return
    }
    setShowConfirm(true)
  }

  async function doTip() {
    if (!isConnected || !address) {
      pushToast('钱包未连接')
      return
    }
    try {
      setLoading(true)
      setIsWriting(true)
      setShowConfirm(false)

      // Check if window.ethereum exists (MetaMask injected)
      if (typeof window === 'undefined' || !window.ethereum) {
        pushToast('未检测到钱包扩展')
        return
      }

      // Create wallet client from MetaMask
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      })

      // Send transaction
      const txHash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'donate',
        value: parseEther(amount),
        account: address,
      })

      pushToast('交易已发送，等待确认...')
      setIsWriting(false)
      setConfirming(true)

      try {
        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash: txHash })
        pushToast('打赏成功！')

        // Record to backend
        if (postId && address) {
          const amountWei = parseEther(amount).toString()
          await fetch('/api/donations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, txHash, donor: address, amountWei }),
          })
          pushToast('打赏已记录')
        }
      } catch (err) {
        console.error('Transaction confirmation failed', err)
        pushToast('交易确认失败')
      } finally {
        setConfirming(false)
      }
    } catch (e: any) {
      console.error(e)
      if (e?.message?.includes('User rejected')) {
        pushToast('用户取消交易')
      } else {
        pushToast(e?.message ?? '交易失败')
      }
    } finally {
      setLoading(false)
      setIsWriting(false)
    }
  }

  return (
    <>
      <div className="rounded-md border border-white/10 bg-[#071025] p-4">
        <div className="mb-2 text-sm font-semibold text-white">支持作者（打赏）</div>
        {/* <div className="mb-3 text-xs text-zinc-300">合约地址：{contractAddress}</div> */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            className="rounded bg-white/5 px-3 py-1 text-sm text-white"
          />
          <span className="text-xs text-zinc-400">ETH</span>
          <button
            onClick={confirmTip}
            disabled={!isConnected || loading || isWriting || confirming}
            className="rounded bg-sky-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            type="button"
          >
            {confirming ? '确认中...' : loading || isWriting ? '发送中...' : '打赏'}
          </button>
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="rounded border border-white/10 px-3 py-1 text-sm text-white hover:bg-white/5"
              type="button"
            >
              连接钱包
            </button>
          ) : (
            <div className="ml-auto text-xs text-zinc-300">已连接：{shortAddr(address ?? '')}</div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-md rounded bg-[#0d1424] p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">确认打赏</h3>
            <p className="mb-4 text-sm text-zinc-300">
              你将发送 <span className="font-mono text-sky-400">{amount} ETH</span> 到合约地址，是否继续？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded border border-white/10 px-3 py-1 text-sm text-white hover:bg-white/5"
              >
                取消
              </button>
              <button
                onClick={doTip}
                disabled={loading || isWriting || confirming}
                className="rounded bg-sky-600 px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                {loading || isWriting || confirming ? '处理中...' : '确认并打赏'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in fade-in slide-in-from-top-2 rounded bg-black/80 px-3 py-2 text-sm text-white"
          >
            {t.text}
          </div>
        ))}
      </div>
    </>
  )
}
