// 결투장 업로드: 서버가 거절(401)해도 기록을 버리지 않고, 규칙이 고쳐지면 다시 올라간다 + 상태 표시
const env = require('./env.js');
const dev = require('./devlib.js');
const { chromium } = require(env.playwright);
(async () => {
  const browser = await chromium.launch({ executablePath: env.chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const store = {}; let reject = true;
  await page.route(env.firebase, async r => {
    const u = new URL(r.request().url()); const path = decodeURIComponent(u.pathname).replace(/^\//, '').replace(/\.json$/, '');
    if (r.request().method() === 'PUT') {
      if (reject) return r.fulfill({ status: 401, body: '{"error":"Permission denied"}' });
      store[path] = JSON.parse(r.request().postData()); return r.fulfill({ status: 200, body: 'null' });
    }
    const sub = {}; let found = false;
    for (const [k, v] of Object.entries(store)) if (k.startsWith(path + '/')) { sub[k.slice(path.length + 1)] = v; found = true; }
    r.fulfill({ status: 200, body: JSON.stringify(found ? sub : (store[path] || null)) });
  });
  await page.goto(env.url); await page.waitForSelector('#floorbtns button'); await dev.unlock(page);
  const r = await dev.run(page, () => {
    hideSyncModal(); S.unlocked = 41; window.__fakeNow = Date.now(); Date.now = () => window.__fakeNow;
    startDuelFight(); let t = 0; while (bossFight.active && t < 2000) { window.__fakeNow += 100; tick(0.1); t++; }
    return { best: BN.toNumber(S.duel.best) > 0, dirty: S.duel.pushDirty };
  });
  await page.waitForTimeout(800);
  const r2 = await dev.run(page, () => { duelPushCurrent(); return 1; });
  await page.waitForTimeout(800);
  const rejected = await dev.run(page, () => { switchTab('worldraid'); raidTabView = 'duel'; renderWorldRaidTab(); return { dirtyKept: S.duel.pushDirty, status: duelPushStatus, line: ($('duelStatusLine') || {}).textContent }; });
  reject = false;
  await dev.run(page, () => { duelPushCurrent(); return 1; });
  await page.waitForTimeout(800);
  const ok = await dev.run(page, () => { renderWorldRaidTab(); return { dirty: S.duel.pushDirty, pushedOk: S.duel.pushedOk, status: duelPushStatus, line: ($('duelStatusLine') || {}).textContent }; });
  console.log(JSON.stringify({ r, rejected, ok, uploaded: Object.keys(store).filter(k => k.startsWith('duelRecords/')).length }, null, 1));
  console.log(errors.length ? '오류:\n' + errors.join('\n') : '오류 없음');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
