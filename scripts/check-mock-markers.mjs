/**
 * conventions.md 3.4절의 규칙을 강제한다.
 * 표에 적힌 타협 지점과 코드의 `//- 프로덕션과 다름.` 마커가 파일별로 같은 개수여야 한다.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const MARKER = '//- 프로덕션과 다름.'
const DOC_PATH = 'docs/conventions/conventions.md'
const SECTION_HEADING = '### 3.4'
const SOURCE_DIR = 'src'

async function collectSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return collectSourceFiles(path)
      return /\.(ts|tsx)$/.test(entry.name) ? [path] : []
    }),
  )
  return files.flat()
}

async function countMarkersByFile() {
  const counts = new Map()
  for (const path of await collectSourceFiles(SOURCE_DIR)) {
    const occurrences = (await readFile(path, 'utf8'))
      .split('\n')
      .filter((line) => line.includes(MARKER)).length
    if (occurrences > 0) counts.set(path, occurrences)
  }
  return counts
}

async function countTableRowsByFile() {
  const doc = await readFile(DOC_PATH, 'utf8')
  const sectionStart = doc.indexOf(SECTION_HEADING)
  if (sectionStart === -1)
    throw new Error(`${DOC_PATH}에서 ${SECTION_HEADING}절을 찾을 수 없습니다.`)

  const sectionEnd = doc.indexOf('\n### ', sectionStart + SECTION_HEADING.length)
  const section = doc.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd)

  const counts = new Map()
  for (const line of section.split('\n')) {
    const location = /^\|\s*`([^`]+)`\s*\|/.exec(line)?.[1]
    if (!location) continue
    const path = join(SOURCE_DIR, location)
    counts.set(path, (counts.get(path) ?? 0) + 1)
  }
  return counts
}

const [markers, rows] = await Promise.all([countMarkersByFile(), countTableRowsByFile()])

const problems = [...new Set([...markers.keys(), ...rows.keys()])].sort().flatMap((path) => {
  const marker = markers.get(path) ?? 0
  const row = rows.get(path) ?? 0
  return marker === row ? [] : [`  ${path}: 마커 ${marker}개, 표 ${row}행`]
})

if (problems.length > 0) {
  console.error(`${DOC_PATH} 3.4절의 표와 코드 마커가 어긋납니다:`)
  console.error(problems.join('\n'))
  console.error(`\n타협 지점을 추가·삭제했다면 표와 \`${MARKER}\` 주석을 함께 갱신하세요.`)
  process.exit(1)
}

console.log(
  `✔ 프로덕션과 다른 지점 ${[...markers.values()].reduce((a, b) => a + b, 0)}건이 표와 일치합니다.`,
)
