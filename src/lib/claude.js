import prompts from '../data/claude_prompts.json'
import brands from '../data/brands.json'
import useCases from '../data/use_cases.json'

function buildPayload() {
  return JSON.stringify({
    brands: brands.map(b => ({
      name: b.name,
      region: b.region,
      stores: b.stores,
      ...b.summary,
      deployedUseCases: b.deployedUseCases.map(uc => {
        const def = useCases.find(u => u.id === uc.useCaseId)
        return {
          name: def?.name || uc.useCaseId,
          status: uc.status,
          kpi: uc.kpi,
          lastAgentAction: uc.lastAgentAction,
        }
      }),
    })),
    useCases: useCases.map(u => ({
      name: u.name,
      domain: u.domain,
      status: u.status,
      brandsDeployed: u.brands.length,
    })),
  }, null, 2)
}

export async function generateDashboard() {
  const data = buildPayload()

  try {
    const res = await fetch('/api/claude/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompts.dashboard.user_template.replace('{data}', data),
        }],
        system: prompts.dashboard.system,
      }),
    })

    if (!res.ok) throw new Error(`API error: ${res.status}`)

    const json = await res.json()
    const text = json.content?.[0]?.text || ''
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0])
    }
    return JSON.parse(text)
  } catch (err) {
    console.warn('Claude API unavailable, using fallback:', err.message)
    return null
  }
}

export async function queryDashboard(question) {
  const data = buildPayload()

  try {
    const res = await fetch('/api/claude/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompts.query.user_template
            .replace('{data}', data)
            .replace('{question}', question),
        }],
        system: prompts.query.system,
      }),
    })

    if (!res.ok) throw new Error(`API error: ${res.status}`)

    const json = await res.json()
    const text = json.content?.[0]?.text || ''
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0])
    }
    return JSON.parse(text)
  } catch (err) {
    console.warn('Claude query API unavailable:', err.message)
    return null
  }
}

export function getFallbackDashboard() {
  return prompts.fallback_dashboard
}
