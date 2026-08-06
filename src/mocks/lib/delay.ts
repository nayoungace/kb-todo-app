import { delay } from 'msw'

//- 프로덕션과 다름. 로딩 상태를 눈으로 확인할 수 있도록 지연을 인위적으로 넣는다(테스트에서는 0).
//  실제 환경이라면 네트워크가 알아서 만드는 시간이다.
export function networkDelay(): Promise<void> {
  if (import.meta.env.TEST) return Promise.resolve()
  return delay()
}
