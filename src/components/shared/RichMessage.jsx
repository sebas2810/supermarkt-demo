import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Fix markdown tables where multiple rows got joined on a single line.
 * Uses the header row (first | line with text content) to determine column count,
 * then splits any line with too many pipes into proper rows.
 */
function fixMarkdownTables(text) {
  const lines = text.split('\n')

  // Step 1: Find the header row to determine column count.
  // The header row is the first pipe-delimited line that contains text (not just dashes/colons).
  let pipesPerRow = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue
    // Skip separator rows (only |, -, :, spaces)
    if (/^\|[\s:-]+(\|[\s:-]+)*\|$/.test(trimmed)) continue
    // This is a content row — count its pipes
    const count = (trimmed.match(/\|/g) || []).length
    if (count >= 3) { // at least 2 columns
      pipesPerRow = count
      break
    }
  }

  // If no clean header found, try the shortest pipe-starting line as reference
  if (pipesPerRow === 0) {
    let minPipes = Infinity
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const count = (trimmed.match(/\|/g) || []).length
        if (count >= 3 && count < minPipes) minPipes = count
      }
    }
    if (minPipes < Infinity) pipesPerRow = minPipes
  }

  if (pipesPerRow < 3) return text // not a table

  // Step 2: Split lines that have too many pipes (multiple rows joined)
  const result = []
  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed.startsWith('|')) {
      result.push(line)
      continue
    }

    const pipeCount = (trimmed.match(/\|/g) || []).length

    if (pipeCount <= pipesPerRow) {
      result.push(trimmed)
      continue
    }

    // Multiple rows joined — split by finding every pipesPerRow-th pipe
    const pipePositions = []
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '|') pipePositions.push(i)
    }

    for (let start = 0; start < pipePositions.length; start += pipesPerRow) {
      const endIdx = start + pipesPerRow - 1
      if (endIdx < pipePositions.length) {
        result.push(trimmed.substring(pipePositions[start], pipePositions[endIdx] + 1).trim())
      } else {
        // Leftover — append to previous row or keep as-is
        const leftover = trimmed.substring(pipePositions[start]).trim()
        if (leftover.length > 1) result.push(leftover)
      }
    }
  }

  return result.join('\n')
}

/**
 * Pre-process Claude's response text to fix common markdown issues.
 */
function preprocessMarkdown(text) {
  if (!text) return ''

  let out = text

  // 1. Convert any literal \n that survived JSON parsing
  out = out.replace(/\\n/g, '\n')

  // 2. Fix tables with joined rows using column-count approach
  out = fixMarkdownTables(out)

  // 3. Clean up double-bullet markers: "* •" or "- •" → just "- "
  out = out.replace(/[*-]\s*•\s*/g, '- ')

  // 4. Ensure headings have a blank line before them (unless at start)
  out = out.replace(/([^\n])\n(#{1,4}\s)/g, '$1\n\n$2')

  // 5. Ensure blank line before first table row (required by GFM)
  out = out.replace(/([^\n|])\n(\|[^\n]*\|)/g, '$1\n\n$2')

  // 6. Ensure blank line after last table row before non-table content
  out = out.replace(/(\|[^\n]*\|)\n([^\n|#\-\s])/g, '$1\n\n$2')

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
