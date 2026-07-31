import type { RequestHandler } from 'msw'

/**
 * openapi.yaml 기준의 실제 핸들러(sign-in / refresh / user / dashboard / task)는 후속 단계에서 추가한다.
 * 브라우저와 테스트(node) 양쪽이 같은 핸들러를 공유하도록 이 파일을 단일 소스로 둔다.
 */
export const handlers: RequestHandler[] = []
