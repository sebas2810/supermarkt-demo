import { ChevronRight } from 'lucide-react'

export default function Breadcrumb({ items = [], onNavigate }) {
  if (items.length === 0) return null

  return (
    <div className="flex items-center gap-1 text-xs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-gray-600" />}
            {isLast ? (
              <span className="text-gray-300 font-medium">{item.label}</span>
            ) : (
              <button
                onClick={() => onNavigate?.(item)}
                className="text-gray-500 hover:text-cap-cyan transition-colors"
              >
                {item.label}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
