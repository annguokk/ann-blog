import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="rounded-xl border border-white/10 bg-[#0d1424] p-6 shadow-md">
        <SignIn />
      </div>
    </div>
  )
}