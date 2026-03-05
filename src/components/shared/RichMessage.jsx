import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Pre-process Claude's response text to fix common markdown issues:
 * - Ensure literal \n are actual newlines
 * - Fix table rows that got joined on one line
 * - Clean up double-bullet markers (* •)
 * - Ensure blank lines around block elements
 */
function preprocessMarkdown(text) {
  if (!text) return ''

  let out = text

  // 1. Convert any literal \n that survived JSON parsing
  out = out.replace(/\\n/g, '\n')

  // 2. Fix tables: if pipe-delimited rows are on a single line, split them.
  //    Pattern: "| ... | | ... |" → separate rows on newlines
  //    Detect: a closing "| " immediately followed by "| " (row boundary)
  out = out.replace(/\|\s*\|\s*(?=[A-Za-z0-9#\-])/g, '|\n| ')

  // 3. Fix header separator row that got joined: "| |---" → newline before separator
  out = out.replace(/\|\s*\|(\s*[-:]+)/g, '|\n|$1')

  // 4. Clean up double-bullet markers: "* •" or "- •" → just "- "
  out = out.replace(/[*-]\s*•\s*/g, '- ')

  // 5. Ensure headings have a blank line before them (unless at start)
  out = out.replace(/([^\n])\n(#{1,4}\s)/g, '$1\n\n$2')

  // 6. Ensure table has blank line before it
  out = out.replace(/([^\n])\n(\|[^\n]*\|)/g, '$1\n\n$2')

  return out.trim()
}

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
      <span className="flex-1">{children}</span>
    </li>
  ),
  // Tables
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-navy-mid">
      <table className="w-full text-[10px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-cap-cyan/10">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-navy-mid/30">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-navy/30">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-2.5 py-1.5 text-left text-[9px] font-semibold text-cap-cyan uppercase tracking-wider border-b border-navy-mid/50 whitespace-nowrap">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-2.5 py-1.5 text-gray-200 border-b border-navy-mid/20">{children}</td>
  ),
  // Code (inline)
  code: ({ children }) => (
    <code className="text-cap-cyan bg-navy/60 px-1 py-0.5 rounded text-[10px] font-mono">{children}</code>
  ),
  // Horizontal rule
  hr: () => (
    <hr className="border-navy-mid/40 my-2" />
  ),
}

export default function RichMessage({ text }) {
  if (!text) return null

  const processed = preprocessMarkdown(text)

  return (
    <div className="rich-message">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>{processed}</Markdown>
    </div>
  )
}
