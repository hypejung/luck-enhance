// 공용: 표준 세팅 + 전투 시뮬레이터를 페이지에 주입
module.exports.setup = () => {
  window.__fakeNow = Date.now(); Date.now = () => window.__fakeNow;
  S.unlocked = 40; S.raidMaxCleared = 40; S.unlimitedAttempts = true; S.library.best = 40;
  const artifact = GENESIS_ARTIFACTS.find(a => a && a.id === 'camazotz');
  grantGenesisArtifact(artifact);
  const w = S.weapons.find(x => x.genesisId === 'camazotz');
  w.runes = []; let rid = 900000;
  for (const t of ['atkSpeed', 'critChance', 'critDamage', 'extraAtk']) for (let i = 0; i < 2; i++) w.runes.push({ id: rid++, grade: 3, key: t });
  S.equipped = w.id;
  S.training = {}; for (const st of ['atk', 'atkSpeed', 'critChance', 'critDamage', 'extraAtk', 'extraAtkDmg', 'bossDmg']) S.training[st] = 40;
  S.bossAccs = Array.from({ length: 20 }, (_, i) => i);
  S.accEquipped = [];
  const idx = SUBWEAPON_TYPES.findIndex(t => t.name === '도끼걸이');
  const sw = makeSubweapon(5, idx); sw.enhance = 27; sw.activeTiming = 0;
  S.subweapons = [sw]; S.subEquipped = sw.id;
  S.gloves = GLOVE_TYPES.map((t, i) => ({ id: 800000 + i, typeIdx: i, grade: 5, enhance: 30 }));
  S.gloveEquipped = null;
  window.__w = w; window.__sw = sw;
  window.__fight = (kind, stage) => {
    if (bossFight.active) { bossFight.active = false; bossFight.isRaid = false; bossFight.isLibrary = false; bd = null; }
    S.gold = BN.from(1e30);
    if (kind === 'raid') startRaidFight(stage); else startLibraryFight(stage);
    const maxHp = mon.maxHp;
    let g = 0, won = false;
    const wasActive = bossFight.active;
    while (bossFight.active && g < 2000) { window.__fakeNow += 100; tick(0.1); g++; }
    // 승패: 끝났을 때 최고 기록이 아니라 체력으로 판단
    const left = BN.toNumber(BN.div(mon.hp, maxHp));
    return { ticks: g, wasActive };
  };
};
