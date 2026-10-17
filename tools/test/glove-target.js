// 장갑 강화기: 가방의 다른(미장착) 장갑 강화 대상 고르기
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
    hideSyncModal(); S.enhanceFxEnabled = false; S.gold = BN.from(1e40); S.steelThread = BN.from(1e9); S.unlocked = 41;
    const out = {};
    const A = { id: uid++, typeIdx: 0, grade: 5, enhance: 3 }, B = { id: uid++, typeIdx: 1, grade: 5, enhance: 5 }, C = { id: uid++, typeIdx: 2, grade: 4, enhance: 0 };
    S.gloves = [A, B, C]; S.gloveEquipped = A.id;
    switchTab('enhance'); enhSubTab = 'glove'; renderEnhance();
    out.barRendered = !!$('gloveEnhTargetBar') && $('gloveEnhTargetBar').innerHTML.includes('다른 장갑 강화하기');
    out.defaultTarget = getGloveEnhanceTarget() === A;
    gloveEnhTargetPickerOpen = true; renderEnhance();
    out.listCount = document.querySelectorAll('[data-glovepick]').length; // 장착 장갑 제외 2개
    document.querySelector(`[data-glovepick="${B.id}"]`).click();
    out.pickedB = getGloveEnhanceTarget() === B && $('gloveEnhTargetBar').innerHTML.includes('가방의 장갑을 강화 중');
    // B 강화: A는 그대로
    Math.random = () => 0; tryGloveEnhance(false);
    out.enhancedB = B.enhance === 6 && A.enhance === 3 && S.gloveEquipped === A.id;
    // 자동 강화: 목표 +8까지 (대상 B)
    startAutoGloveEnhance(8); for (let i = 0; i < 6; i++) autoGloveEnhanceTick();
    out.autoB = B.enhance === 8 && A.enhance === 3;
    // 대상 파괴: 고른 장갑이 사라지면 장착 장갑으로 복귀
    S.gloves = S.gloves.filter(x => x.id !== B.id);
    out.fallback = getGloveEnhanceTarget() === A && gloveEnhanceTargetId === null;
    // 장착 장갑을 고르면 미장착 모드가 풀림
    gloveEnhanceTargetId = C.id; renderEnhance(); gloveEnhTargetPickerOpen = true; renderEnhance();
    document.querySelector(`[data-glovepick="${A.id}"]`).click();
    out.backToEquipped = gloveEnhanceTargetId === null;
    // 파괴 경로: 대상 C를 고르고 파괴시키면 대상·가방에서 사라진다
    gloveEnhanceTargetId = C.id; C.enhance = 12; S.penaltyGuard = 0;
    const seq = [0.9999, 0.00001]; Math.random = () => seq.length ? seq.shift() : 0.5; tryGloveEnhance(false);
    out.destroyed = !S.gloves.some(x => x.id === C.id) && gloveEnhanceTargetId === null && S.gloveEquipped === A.id;
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  console.log(errors.length ? '오류:\n' + errors.join('\n') : '오류 없음');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
