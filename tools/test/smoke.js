// 스모크 테스트: 게임을 띄워 모든 탭을 한 번씩 열고 사냥 틱을 돌려 본 뒤, 페이지 오류가 있었는지 확인한다.
// 사용법: (저장소 루트에서) python3 -m http.server 8974 를 띄워 둔 채로 node tools/test/smoke.js
// Firebase는 막혀 있으므로 모두 빈 응답(null)으로 대신한다.
const env = require('./env.js');
const dev = require('./devlib.js');
const { chromium } = require(env.playwright);
const TABS = ['hunt', 'inventory', 'enhance', 'stats', 'rune', 'acc', 'craft', 'box', 'gamble', 'codex', 'blacksmith',
  'disassemble', 'preset', 'raid', 'library', 'worldraid', 'guide', 'patchnotes'];
(async () => {
  const browser = await chromium.launch({ executablePath: env.chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route(env.firebase, r => r.fulfill({ status: 200, body: 'null' }));
  await page.goto(env.url);
  await page.waitForSelector('#floorbtns button');
  await dev.unlock(page);
  const r = await dev.run(page, tabs => {
    hideSyncModal();
    for (const t of tabs) switchTab(t);
    switchTab('hunt');
    for (let i = 0; i < 300; i++) tick(0.1);
    return { kills: S.totalKills };
  }, TABS);
  console.log('결과:', JSON.stringify(r));
  console.log(errors.length ? '오류:\n' + errors.join('\n') : '오류 없음');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
