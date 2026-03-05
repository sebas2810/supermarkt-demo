import Markdown from 'react-markdown'

const components = {
  // Paragraphs
  p: ({ children }) => (
    <p className="text-xs text-gray-200 leading-relaxed mb-1.5 last:mb-0">{children}</p>
  ),
  // Bold
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  // Italic
  em: ({ children }) => (
    <em className="text-gray-300 italic">{children}</em>
  ),
  // Headings
  h3: ({ children }) => (
    <h3 className="text-[11px] font-semibold text-cap-cyan mb-1 mt-2 first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-[11px] font-semibold text-gray-300 mb-1 mt-1.5 first:mt-0">{children}</h4>
  ),
  // Unordered list
  ul: ({ children }) => (
    <ul className="space-y-0.5 mb-1.5 last:mb-0">{children}</ul>
  ),
  // Ordered list
  ol: ({ children }) => (
    <ol className="space-y-0.5 mb-1.5 last:mb-0 list-decimal list-inside">{children}</ol>
  ),
  // List items
  li: ({ children }) => (
    <li className="text-xs text-gray-300 flex items-start gap-1.5">
      <span className="text-cap-cyan flex-none mt-1">&#x2022;</span>
      <span>{children}</span>
    </li>
  ),
  // Tables
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-navy-mid">
      <table className="w-full text-[10px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-navy-mid/40">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-navy-mid/30">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-navy/30">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-300 uppercase tracking-wider">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 text-gray-200">{children}</td>
  ),
  // Code (inline)
  code: ({ children }) => (
    <code className="text-cap-cyan bg-navy/60 px-1 py-0.5 rounded text-[10px] font-mono">{children}</code>
  ),
}

export default function RichMessage({ text }) {
  if (!text) return null

  return (
    <div className="rich-message">
      <Markdown components={components}>{text}</Markdown>
    </div>
  )
}
