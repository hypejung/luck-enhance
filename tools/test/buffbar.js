// 지속 효과 표시줄: 사냥 중 무기 효과, 전투 중 결전의 기백·태초 장갑 효과가 남은 시간과 함께 표시되는지
const env = require('./env.js');
const dev = require('./devlib.js');
const { chromium } = require(env.playwright);
(async () => {
  const browser = await chromium.launch({ executablePath: env.chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(env.firebase, r => r.fulfill({ status: 200, body: 'null' }));
  await page.goto(env.url); await page.waitForSelector('#floorbtns button'); await dev.unlock(page);
  const r = await dev.run(page, () => {
    hideSyncModal(); S.unlocked = 41;
    const out = {};
    // 사냥 중: Date.now 기반 효과
    fx.tiangouUntil = Date.now() + 5000; tick(0.1); buffBarLast = 0; renderBuffBar(true);
    out.hunt = ($('buffBar') || {}).textContent;
    fx.tiangouUntil = 0; buffBarLast = 0; renderBuffBar(true);
    out.huntGone = !$('buffBar');
    // 결투장 전투: 결전의 기백 + 태초 장갑 효과
    switchTab('worldraid'); raidTabView = 'duel'; renderWorldRaidTab();
    startDuelFight();
    bossFight.dmgBonus = 1; bossFight.subActiveEndAt = Date.now() + 4000;
    gglState().arrowUntil = bossFight.elapsed + 6; gglState().curseUntil = bossFight.elapsed + 3;
    tick(0.1); buffBarLast = 0; renderBuffBar(true);
    const bar = $('buffBar');
    out.fight = bar ? bar.textContent : null;
    out.hostOk = !!bar && bar.parentNode === $('worldRaidMonBox');
    out.chips = bar ? bar.querySelectorAll('.buffchip').length : 0;
    // 끝나면 사라짐
    endBossFight(false); buffBarLast = 0; renderBuffBar(true);
    out.afterEnd = !$('buffBar');
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  console.log(errors.length ? '오류:\n' + errors.join('\n') : '오류 없음');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
