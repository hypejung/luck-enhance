// 황혼 상점: 정수가 모자라면 구매 불가, 충분하면 각 상품이 지급되고 정수가 줄어든다
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
    hideSyncModal(); S.unlocked = 41; switchTab('worldraid'); raidTabView = 'duel';
    const out = {};
    S.twilightEssence = BN.from(10); renderWorldRaidTab();
    out.disabled = [...document.querySelectorAll('.twilight-buy-btn')].every(b => b.disabled);
    buyTwilightShop('penaltyGuard'); out.noBuy = (S.penaltyGuard || 0) === 0 && BN.toNumber(S.twilightEssence) === 10;
    S.twilightEssence = BN.from(1000); renderWorldRaidTab();
    out.enabled = [...document.querySelectorAll('.twilight-buy-btn')].every(b => !b.disabled);
    const before = { w: BN.toNumber(S.weaponEssence), a: BN.toNumber(S.awakeningEssence), t: BN.toNumber(S.raidTokens), s: BN.toNumber(S.steelThread || 0), g: S.penaltyGuard || 0 };
    for (const id of ['weaponEssence', 'awakenEssence', 'raidTokens', 'steelThread', 'penaltyGuard']) buyTwilightShop(id);
    out.gain = { w: BN.toNumber(S.weaponEssence) - before.w, a: BN.toNumber(S.awakeningEssence) - before.a, t: BN.toNumber(S.raidTokens) - before.t, s: BN.toNumber(S.steelThread) - before.s, g: (S.penaltyGuard || 0) - before.g };
    out.spent = 1000 - BN.toNumber(S.twilightEssence);
    out.shadowBuyable = TWILIGHT_SHOP.some(h => /그림자/.test(typeof h.name === 'function' ? h.name() : h.name));
    return out;
  });
  console.log(JSON.stringify(r));
  console.log(errors.length ? '오류:\n' + errors.join('\n') : '오류 없음');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
