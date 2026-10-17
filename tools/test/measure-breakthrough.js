// 돌파 밸런스: 신화 +27 무기의 돌파 0 / 5 / 10단계 펀치기계 120초 피해(고유 효과별) + 고대 +27과의 기본 공격력 비교
// 사용법: node tools/test/measure-breakthrough.js [시행 횟수]
const env = require('./env.js');
const lib = require('./sim_lib.js');
const dev = require('./devlib.js');
const { chromium } = require(env.playwright);
const TRIALS = +(process.argv[2] || 4);
(async () => {
  const browser = await chromium.launch({ executablePath: env.chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.route(env.firebase, r => r.fulfill({ status: 200, body: 'null' }));
  await page.goto(env.url); await page.waitForSelector('#floorbtns button'); await dev.unlock(page);
  await page.evaluate(src => window.__devEval(`(${src})()`), lib.setup.toString());
  const out = await dev.run(page, TR => {
    log = () => {}; renderHP = () => {}; renderBossBtn = () => {}; save = () => {}; floatText = () => {};
    const RR = Math.random;
    const trial = s => { let a = s >>> 0; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      S.gold = BN.from(1e30); startPunchFight(); let g = 0; while (bossFight.active && g < 1300) { window.__fakeNow += 100; tick(0.1); g++; } Math.random = RR; return BN.toNumber(punchDealtOverflow); };
    const avg = () => { let s = 0; for (let i = 0; i < TR; i++) s += trial(500 + i); return s / TR; };
    const res = {};
    const base = genWeapon(5); base.type = '검'; base.enhance = 27; base.runes = [];
    S.weapons = [base]; S.equipped = base.id;
    for (const k of Object.keys(EFFECTS).filter(k => EFFECTS[k].grade === 5)) {
      base.effect = k; const row = {};
      for (const b of [0, 5, 10]) { base.breakthrough = b; row[b] = avg(); }
      res[k] = { b5: +(row[5] / row[0]).toFixed(3), b10: +(row[10] / row[0]).toFixed(3) };
    }
    const m = genWeapon(5); m.enhance = 27; const a = genWeapon(6); a.enhance = 27;
    res.baseAtkAncientOverMythic = +(weaponAtk(a) / weaponAtk(m)).toFixed(3);
    m.breakthrough = 10; res.mythic10OverAncient0 = +(weaponAtk(m) / weaponAtk(a)).toFixed(3);
    a.breakthrough = 10; res.ancient10OverMythic10 = +(weaponAtk(a) / weaponAtk(m)).toFixed(3);
    return res;
  }, TRIALS);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
