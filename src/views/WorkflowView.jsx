import { ArrowLeft } from 'lucide-react'
import App from '../App'

const WORKFLOW_TITLES = {
  intervention: 'Predictive Fresh Supply Chain — Interactive Workflow Demo',
  'digital-twin': 'Digital Twin & Scale — Strategic Workflow Demo',
}

export default function WorkflowView({ onBack, workflowId = 'intervention' }) {
  return (
    <div className="h-full flex flex-col">
      {/* Back bar */}
      <div className="flex-none flex items-center gap-2 px-4 py-1.5 bg-navy border-b border-navy-mid/30">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-navy-mid/50 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Platform</span>
        </button>
        <div className="h-4 w-px bg-navy-mid" />
        <span className="text-[10px] text-gray-500">{WORKFLOW_TITLES[workflowId] || WORKFLOW_TITLES.intervention}</span>
      </div>

      {/* Embedded workflow */}
      <div className="flex-1 min-h-0">
        <App embedded onBack={onBack} workflowId={workflowId} />
      </div>
    </div>
  )
}
