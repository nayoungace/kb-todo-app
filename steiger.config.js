import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,

  { ignores: ['./src/routeTree.gen.ts'] },

  {
    // README "예외 — shared/": shadcn CLI 산출물에 배럴을 두면 깨지므로 두지 않는다.
    files: ['./src/shared/**'],
    rules: { 'fsd/public-api': 'off', 'fsd/no-reserved-folder-names': 'off' },
  },
  {
    // shared 에 배럴이 없으니 바깥에서 파일 단위로 들어오는 것이 정상 경로다.
    rules: { 'fsd/no-public-api-sidestep': 'off' },
  },
  {
    // widgets/pages 는 코드젠 대상인 src/routes 에서만 참조되어 참조 수가 세어지지 않는다.
    rules: { 'fsd/insignificant-slice': 'off' },
  },
])
