// 종언의 결투장 스모크: 레이드 탭 결투장 보기 → 도전 → 120초 틱 → 종료 기록/패턴/결산 확인
const env = require('./env.js');
const dev = require('./devlib.js');
const { chromium } = require(env.playwright);
(async () => {
  const browser = await chromium.launch({ executablePath: env.chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const store = {};
  await page.route(env.firebase, async r => {
    const u = new URL(r.request().url()); const path = decodeURIComponent(u.pathname).replace(/^\//, '').replace(/\.json$/, '');
    if (r.request().method() === 'PUT') { store[path] = JSON.parse(r.request().postData()); return r.fulfill({ status: 200, body: 'null' }); }
    const sub = {}; let found = false;
    for (const [k, v] of Object.entries(store)) if (k.startsWith(path + '/')) { sub[k.slice(path.length + 1)] = v; found = true; }
    r.fulfill({ status: 200, body: JSON.stringify(found ? sub : (store[path] || null)) });
  });
  await page.goto(env.url); await page.waitForSelector('#floorbtns button'); await dev.unlock(page);
  const r = await dev.run(page, () => {
    hideSyncModal(); S.unlocked = 41; S.unlimitedAttempts = true;
    window.__t = Date.now(); window.__fakeNow = Date.now(); Date.now = () => window.__fakeNow;
    switchTab('worldraid'); raidTabView = 'duel'; renderWorldRaidTab();
    const html0 = $('worldRaidBox').innerHTML;
    startDuelFight();
    const started = bossFight.active && bossFight.isDuel && !!bd && bd.list.length === 3;
    const counters = new Set(bd.list.map(e => DISRUPTIONS[e.key].counter)).size;
    let ticks = 0, enraged = false;
    while (bossFight.active && ticks < 2000) { window.__fakeNow += 100; tick(0.1); ticks++; if (bd && bd.enraged) enraged = true; }
    const d = S.duel;
    return { html: html0.includes('종언의 결투장'), started, counters, ticks, enraged, best: BN.toNumber(d.best) > 0, dayCount: d.dayCount, pushDirty: d.pushDirty, bd: bd };
  });
  await page.waitForTimeout(500);
  const r2 = await dev.run(page, () => { duelPushCurrent(); return { setup: !!S.duel.setupPending }; });
  await page.waitForTimeout(500);
  console.log(JSON.stringify(r), JSON.stringify(r2), Object.keys(store));
  // 결산 시뮬레이션: 지난주로 넘기기
  const r3 = await dev.run(page, () => { const d = S.duel; d.unsettled.push({ week: prevWeekKey(), best: BN.from(1e20) }); return 1; });
  await dev.run(page, () => { duelSettle(); return 1; });
  await page.waitForTimeout(1500);
  console.log(JSON.stringify(await dev.run(page, () => ({ ess: BN.toNumber(S.twilightEssence), shadow: S.twilightShadow, ls: S.duel.lastSettled, title: S.duel.rankTitle }))));
  console.log(errors.length ? '오류:\n' + errors.join('\n') : '오류 없음');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
