import { Inbox } from 'lucide-react'

export default function EmptyState({
  title = 'Nothing here yet',
  description = '',
  action = null  // optional: { label: 'Do X', onClick: fn } or { label: 'Do X', href: '/path' }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <Inbox className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-gray-700 font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm max-w-xs mb-4">{description}</p>}
      {action && (
        action.href
          ? <a href={action.href} className="text-sm text-primary-600 hover:underline font-medium">{action.label}</a>
          : <button onClick={action.onClick} className="text-sm text-primary-600 hover:underline font-medium">{action.label}</button>
      )}
    </div>
  )
}
