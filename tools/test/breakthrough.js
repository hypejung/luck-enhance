// 무기 돌파: 분해로 조각 획득 → 돌파 판정(성공/실패/조건) → 공격력·고유 효과 증폭 → 별 표시
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
    hideSyncModal(); S.enhanceFxEnabled = false;
    const out = {};
    const mk = (grade, enh) => { const w = genWeapon(grade); w.enhance = enh; S.weapons.push(w); return w; };
    const w = mk(5, 27); S.equipped = w.id;
    out.stars0 = breakStarsHtml(w).includes('☆☆☆☆☆☆☆☆☆☆');
    out.lowNoStars = breakStarsHtml(genWeapon(4)) === '';
    // 분해로 신화 조각
    const f1 = mk(5, 0), f2 = mk(5, 20), g1 = mk(6, 0);
    out.yield = [breakPiecesYield(f1), breakPiecesYield(f2), breakPiecesYield(g1)];
    const rr = disassembleReward(f2, 'w'); out.rewardPieces = rr.pieces;
    doDisassemble('w', f1); doDisassemble('w', f2); doDisassemble('w', g1);
    out.pieces = { 5: breakPiecesOf(5), 6: breakPiecesOf(6) };
    out.subNoPieces = Object.keys(disassembleReward({ grade: 5, typeIdx: 0, enhance: 3 }, undefined).pieces).length === 0;
    // 공격력
    S.breakPieces[5] = 100000;
    const atk0 = weaponAtk(w);
    Math.random = () => 0; // 항상 성공
    for (let i = 0; i < 10; i++) tryBreakthrough();
    out.step = w.breakthrough; out.spent = 100000 - S.breakPieces[5];
    out.expectSpent = BREAK.cost.reduce((a, b) => a + b, 0);
    out.atkRatio = +(weaponAtk(w) / atk0).toFixed(3);
    tryBreakthrough(); out.maxBlocked = w.breakthrough === 10;
    out.stars10 = breakStarsHtml(w).includes('★★★★★★★★★★') && !breakStarsHtml(w).includes('☆');
    // 실패하면 조각만 소모
    w.breakthrough = 3; const before = S.breakPieces[5]; Math.random = () => 0.999; tryBreakthrough();
    out.failKeep = w.breakthrough === 3 && before - S.breakPieces[5] === BREAK.cost[3];
    // 조건: 강화 +10 미만
    w.enhance = 5; const b2 = S.breakPieces[5]; Math.random = () => 0; tryBreakthrough(); out.lowEnh = S.breakPieces[5] === b2 && w.breakthrough === 3; w.enhance = 27;
    // 조각 부족
    S.breakPieces[5] = 1; tryBreakthrough(); out.lowPieces = w.breakthrough === 3;
    // 고유 효과 증폭(신화 효과 5종 모두)
    const res = {};
    for (const k of Object.keys(EFFECTS).filter(k => EFFECTS[k].grade === 5)) {
      const x = mk(5, 27); x.effect = k;
      const e0 = weaponEffect(x); x.breakthrough = 10; const e1 = weaponEffect(x);
      const diffs = Object.keys(e0).filter(q => typeof e0[q] === 'number' && e1[q] !== e0[q]).map(q => q + ':' + e0[q] + '→' + e1[q]);
      if (e0.crit) diffs.push('crit:' + e0.crit.chance + '→' + e1.crit.chance);
      res[k] = diffs;
    }
    out.effAmp = res;
    // 고대는 효과 증폭 없음, 공격력만
    const a = mk(6, 27); const a0 = weaponAtk(a); a.breakthrough = 10; out.ancientAtk = +(weaponAtk(a) / a0).toFixed(3);
    out.ancientEffSame = !a.effect || weaponEffect(a) === EFFECTS[a.effect];
    // 화면
    switchTab('enhance'); renderEnhance();
    out.ui = $('breakthroughBox').innerHTML.includes('돌파') && $('enhweapon').innerHTML.includes('breakstars');
    switchTab('inventory'); renderInventory();
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  console.log(errors.length ? '오류:\n' + errors.join('\n') : '오류 없음');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
