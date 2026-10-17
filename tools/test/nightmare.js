// 황혼의 악몽: 제작 → 주간 적응 → 강화 그림자 비용 → 성장 확률 → 보호 규칙 → 화면
const env = require('./env.js');
const dev = require('./devlib.js');
const { chromium } = require(env.playwright);
(async () => {
  const browser = await chromium.launch({ executablePath: env.chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route(env.firebase, r => r.fulfill({ status: 200, body: 'null' }));
  await page.goto(env.url); await page.waitForSelector('#floorbtns button'); await dev.unlock(page);
  const r = await dev.run(page, () => {
    hideSyncModal(); S.unlocked = 41; S.gold = BN.from(1e40); S.enhanceFxEnabled = false;
    const out = {};
    S.twilightShadow = 5; craftNightmare(); out.noCraftLowShadow = !nightmareGlove();
    S.twilightShadow = 100; craftNightmare();
    const g = nightmareGlove(); out.crafted = !!g && g.grade === 5 && S.twilightShadow === 90;
    craftNightmare(); out.onlyOne = S.gloves.filter(x => x.nightmare).length === 1;
    // 적응: 주 패턴 2개의 대응 스탯
    const keys = duelPatternKeys(weekKey()).map(k => DISRUPTIONS[k].counter);
    out.adapt = g.nmMain === keys[0] && g.nmSub === keys[1] && GLOVE_TYPES[g.typeIdx].main === keys[0];
    equipGlove(g.id);
    out.counter = gloveCounterValue(keys[0]) > 0 && gloveCounterValue(keys[1]) > 0 && gloveCounterValue(keys[2]) === 0;
    // 강화 비용: +14 이하 0개, +15~19 1개, +20 이상 2개, 강철실 없음
    out.shadowCost = [14, 15, 19, 20, 29].map(e => { g.enhance = e; return nightmareShadowCost(g); });
    g.enhance = 15; out.noSteel = gloveTryCost(g, false).steel === 0 && gloveTryCost(g, false).shadow === 1 && gloveTryCost(g, true).shadow === 3;
    const before = S.twilightShadow; Math.random = () => 0; tryGloveEnhance(false); out.enhSpent = before - S.twilightShadow;
    S.twilightShadow = 0; g.enhance = 16; const e16 = g.enhance; tryGloveEnhance(false); out.noShadowBlocked = g.enhance === e16;
    // 성장
    g.enhance = 0; S.twilightShadow = 200;
    nightmareGrowInput = 30; out.chance30 = +nightmareGrowthChance(g, 30).toFixed(4);
    Math.random = () => 0.99; growNightmare(); out.failLost = g.grade === 5 && S.twilightShadow === 170;
    nightmareGrowInput = 60; Math.random = () => 0.5; growNightmare(); out.to6 = g.grade === 6 && S.twilightShadow === 110;
    out.ancientDef = !!gloveAncientDef(g) && isAncientGlove(g);
    nightmareGrowInput = 400; S.twilightShadow = 500; Math.random = () => 0.5; growNightmare(); out.to7 = g.grade === 7 && isGenesisGlove(g) && gloveName(g);
    out.noMoreGrow = NIGHTMARE.growN[g.grade] === undefined;
    // 파괴 없음: 신화 단계에서 파괴 판정이 나와도 +0 초기화
    g.grade = 5; g.enhance = 25; S.twilightShadow = 100; Math.random = () => 0.9999; const rolls = []; let seq = [0.9999, 0.00001, 0.9999]; Math.random = () => seq.length ? seq.shift() : 0.5;
    S.penaltyGuard = 0; tryGloveEnhance(false);
    out.afterFail = { exists: S.gloves.some(x => x.nightmare), enh: g.enhance };
    Math.random = () => 0.5;
    // 보호
    sellGlove(g.id); out.noSell = !!nightmareGlove();
    unequipGlove(); out.noDis = !disassemblable('g', g);
    S.gloveAutoSellGrade = 5; out.noAutoSell = !gloveAutoSellMatch(Object.assign({}, g, { enhance: 0 }));
    equipGlove(g.id);
    // 화면
    switchTab('worldraid'); raidTabView = 'duel'; renderWorldRaidTab();
    out.ui = $('worldRaidBox').innerHTML.includes('황혼의 악몽') && $('worldRaidBox').innerHTML.includes('이번 주 적응');
    switchTab('enhance'); renderEnhance(); renderGloveInventory();
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  console.log(errors.length ? '오류:\n' + errors.join('\n') : '오류 없음');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
