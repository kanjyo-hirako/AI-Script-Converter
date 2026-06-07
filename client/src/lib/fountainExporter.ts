import type { Character, Location, Scene } from '../../../shared/types'

export function toFountain(
  characters: Character[],
  locations: Location[],
  scenes: Scene[],
): string {
  const locationMap = new Map(locations.map(l => [l.id, l]))
  const characterMap = new Map(characters.map(c => [c.id, c.name]))

  const lines: string[] = []

  // Title page
  lines.push('Title: AI 剧本')
  lines.push('Draft date: ' + new Date().toLocaleDateString('zh-CN'))
  lines.push('')

  for (const scene of scenes) {
    // Scene heading
    const location = locationMap.get(scene.location_id)
    const locationName = location?.name || scene.location_id
    lines.push(`#. ${scene.heading || `${scene.time_of_day === '夜晚' ? 'INT' : 'INT'}. ${locationName} - ${scene.time_of_day}`}`)
    lines.push('')

    for (const item of scene.content) {
      switch (item.type) {
        case 'action':
          lines.push(item.text)
          lines.push('')
          break

        case 'dialogue': {
          const charName = characterMap.get(item.character_id || '') || item.character_id || '未知'
          // Character name: uppercase, indented ~40 chars for standard screenplay format
          lines.push(`@${charName}`)
          if (item.parenthetical) {
            lines.push(`(${item.parenthetical})`)
          }
          lines.push(item.text)
          lines.push('')
          break
        }

        case 'transition':
          lines.push(`> ${item.text}`)
          lines.push('')
          break

        case 'note':
          lines.push(`[[${item.text}]]`)
          lines.push('')
          break
      }
    }
  }

  return lines.join('\n')
}
