const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** ISO 8601 문자열을 화면 표기용으로 변환한다. 파싱할 수 없으면 원본을 그대로 돌려준다. */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString

  return dateTimeFormatter.format(date)
}
