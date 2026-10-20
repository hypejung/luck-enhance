// 보스 세트 효과(보스 장신구 + 보스 무기/보조무기/장갑) 월드별 발동 확인
const env = require('./env.js');
const dev = require('./devlib.js');
const { chromium } = require(env.playwright);
(async () => {
  const browser = await chromium.launch({ executablePath: env.chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(env.firebase, r => r.fulfill({ status: 200, body: 'null' }));
  await page.goto(env.url.replace('game-source.html','tools/test/out/devcopy.html')); await page.waitForSelector('#floorbtns button');
  const r = await dev.run(page, () => {
    hideSyncModal(); S.unlocked = 61;
    const out = {};
    for (const f of [5, 25, 45, 59]) {
      S.floor = f; S.bossAccs = [];
      const base = accEff();
      S.bossAccs = [f];
      const g = { id: uid++, typeIdx: 0, grade: 5, enhance: 0, bossFloor: f };
      S.gloves = [g]; S.gloveEquipped = g.id;
      const sw = { id: uid++, grade: 5, enhance: 0, bossFloor: f, typeIdx: 0 };
      S.subweapons = []; S.subEquipped = null;
      const w = { id: uid++, grade: 5, type: S.weapons[0] && S.weapons[0].type, enhance: 0, bossFloor: f, runes: [] };
      out[f] = { gloveSet: gloveBossSetFloor(), subSet: subBossSetFloor(), wSet: bossSetFloor(), statDrop: computeStats().setDropActive, atk: accEff().atk, base: base.atk };
    }
    return out;
  });
  console.log(JSON.stringify(r, null, 1), errors);
  await browser.close();
})();
