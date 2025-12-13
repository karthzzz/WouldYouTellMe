'use client'

interface PlanSelectorProps {
  onSelectPlan: (plan: 'anonymous' | 'reveal') => void
}

export function PlanSelector({ onSelectPlan }: PlanSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-6">Choose Your Plan</h2>
      
      <button
        onClick={() => onSelectPlan('anonymous')}
        className="w-full p-6 rounded-lg border-2 border-purple-400/30 hover:border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Anonymous Only</h3>
            <p className="text-sm text-gray-300 mt-1">Recipient won't know who sent this</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">₹499</p>
            <p className="text-xs text-gray-400">One-time payment</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelectPlan('reveal')}
        className="w-full p-6 rounded-lg border-2 border-pink-400/30 hover:border-pink-400 bg-pink-500/10 hover:bg-pink-500/20 transition text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Reveal After 7 Days</h3>
            <p className="text-sm text-gray-300 mt-1">Your identity reveals automatically after 7 days</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-pink-400">₹999</p>
            <p className="text-xs text-gray-400">One-time payment</p>
          </div>
        </div>
      </button>
    </div>
  )
}
