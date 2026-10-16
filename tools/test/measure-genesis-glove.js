// 태초 장갑 측정: 같은 종류 신화 +27 장갑 대비 필요 화력 비율(그 층 보스 / 토벌전 35단계 / 도서관 30서고)
// 사용법: node tools/test/measure-genesis-glove.js 0,1,2  (GLOVE_GENESES 인덱스, 생략하면 구현된 10종 전부)  [P_JSON: 인덱스별 p 덮어쓰기]
const env = require('./env.js');
const { chromium } = require(env.playwright);
const lib = require('./sim_lib.js');
const dev = require('./devlib.js');
const idxs = process.argv[2] ? process.argv[2].split(',').map(Number) : [...Array(10).keys()];
const pOverride = process.argv[3] ? JSON.parse(process.argv[3]) : {};
(async () => {
  const browser = await chromium.launch({ executablePath: env.chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.route(env.firebase, r => r.fulfill({ status: 200, body: 'null' }));
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  await page.goto(env.url); await page.waitForSelector('#floorbtns button');
  await dev.unlock(page);
  await page.evaluate(src => window.__devEval(`(${src})()`), lib.setup.toString());
  await dev.run(page, (po) => {
    for (const [k, v] of Object.entries(po)) { if (k === 'nofx') { for (const a of GLOVE_GENESES) if (a) a.id = 'none'; continue; } Object.assign(GLOVE_GENESES[+k].p, v); }
    window.__fx = {}; const oFT = floatText; floatText = t => { window.__fx[t] = (window.__fx[t] || 0) + 1; };
    const w = window.__w; w.enhance = 30; S.unlocked = 60; S.raidMaxCleared = 40; S.unlimitedAttempts = true;
    log = () => {}; renderHP = () => {}; renderFloorUI = () => {}; renderTop = () => {}; save = () => {}; renderBossBtn = () => {};
    renderRaidTab = () => {}; renderLibraryTab = () => {}; renderEnhance = () => {};
    window.__M = 1;
    // 필요 화력 배율 M = 보스 체력을 1/M로 바꿔서 잼(피해에 곱하면 자기 피해를 다시 쓰는 효과가 M²가 됨)
    window.__scaleHp = () => { mon.maxHp = BN.mul(mon.maxHp, 1 / window.__M); mon.hp = mon.maxHp; };
    const oR = endRaidFight; endRaidFight = function (win) { window.__win = win; return oR.call(this, win); };
    const oL = endLibraryFight; endLibraryFight = function (win) { window.__win = win; return oL.call(this, win); };
    const RR = Math.random;
    const seed = s => { let a = s >>> 0; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
    window.__fightWin = (kind, arg, s) => {
      seed(1000 + s);
      window.__win = false;
      S.gold = BN.from(1e30);
      if (kind === 'floor') { S.floor = arg; spawnMonster(); S.bossCooldowns[arg] = 0; const wins = S.bossWins; startBossFight(); window.__scaleHp(); let g = 0; while (bossFight.active && g < 1500) { window.__fakeNow += 100; tick(0.1); g++; } Math.random = RR; return S.bossWins > wins; }
      if (kind === 'raid') { S.raid.done = {}; S.raid.count = 0; startRaidFight(arg); }
      else { S.library.done = {}; S.library.count = 0; startLibraryFight(arg); }
      window.__scaleHp();
      let g = 0; while (bossFight.active && g < 2500) { window.__fakeNow += 100; tick(0.1); g++; }
      Math.random = RR;
      return !!window.__win;
    };
    window.__reqM = (kind, arg) => {
      let lo = -14, hi = 16;
      for (let i = 0; i < 11; i++) {
        const mid = (lo + hi) / 2; window.__M = Math.pow(2, mid);
        let ok = 0; for (let r = 0; r < 3; r++) if (window.__fightWin(kind, arg, r)) ok++;
        if (ok >= 2) hi = mid; else lo = mid;
      }
      window.__M = 1; return Math.pow(2, (lo + hi) / 2);
    };
    window.__equipGlove = g => { S.gloves = S.gloves.filter(x => x.id < 800000 || x.id >= 800100); g.id = 800050; S.gloves.push(g); S.gloveEquipped = g.id; gloveAmpCache.t = 0; };
    return 1;
  }, pOverride);
  const base = {};
  const out = [];
  for (const i of idxs) {
    const r = await dev.run(page, ([i, baseIn]) => {
      const type = GLOVE_BOSS_NAMES[i].typeIdx;
      const fights = [['floor', WORLD3_START_FLOOR + i], ['raid', 34], ['lib', 29]];
      const res = { i, name: GLOVE_GENESES[i].name, ratios: {}, base: {} };
      for (const [kind, arg] of fights) {
        const bk = `${kind}${arg}_${type}`;
        let bm = baseIn[bk];
        if (bm == null) { window.__equipGlove({ typeIdx: type, grade: 5, enhance: 27 }); bm = window.__reqM(kind, arg); res.base[bk] = bm; }
        const ag = makeGenesisGlove(WORLD3_START_FLOOR + i); ag.enhance = 27; window.__fx = {};
        window.__equipGlove(ag);
        const am = window.__reqM(kind, arg);
        res.ratios[kind] = +(bm / am).toFixed(3);
        res.fx = res.fx || {}; res.fx[kind] = Object.fromEntries(Object.entries(window.__fx).filter(([t]) => /[💤💭🐘🧜🕳🗝👟🌚🪆🪔]/u.test(t)));
      }
      const v = Object.values(res.ratios);
      res.geo = +Math.pow(v.reduce((a, b) => a * b, 1), 1 / v.length).toFixed(3);
      return res;
    }, [i, base]);
    Object.assign(base, r.base);
    console.log(`${String(41 + r.i)} ${r.name.padEnd(16)} floor ${r.ratios.floor} raid ${r.ratios.raid} lib ${r.ratios.lib} → ×${r.geo}  ${JSON.stringify(r.fx)}`);
    out.push(r);
  }
  require('fs').mkdirSync(__dirname + '/out', { recursive: true }); require('fs').writeFileSync(__dirname + '/out/measure-genesis-glove.json', JSON.stringify(out));
  await browser.close();
})();
