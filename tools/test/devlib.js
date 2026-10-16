// 게임 코드는 즉시실행함수로 감싸져 있어 전역에서 접근할 수 없다 → __dev(비밀번호)로 연 뒤 __devEval로 내부에서 실행.
// 비밀번호는 환경 변수 LUCK_DEV_PASS(권장) 또는 tools/test/.devpass 파일(.gitignore)에서 읽는다. 절대 커밋하지 않는다.
const fs = require('fs');
function pass() {
  if (process.env.LUCK_DEV_PASS) return process.env.LUCK_DEV_PASS.trim();
  const f = __dirname + '/.devpass';
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  throw new Error('개발자 비밀번호가 없습니다: 환경 변수 LUCK_DEV_PASS를 설정하세요.');
}
module.exports.unlock = async page => {
  const ok = await page.evaluate(p => window.__dev(p), pass());
  if (!ok) throw new Error('개발자 비밀번호가 틀렸습니다.');
};
// fn: 게임 내부에서 실행할 함수(인자 하나). 결과는 JSON으로 돌려받는다.
module.exports.run = (page, fn, arg) => page.evaluate(([src, a]) => window.__devEval(`JSON.stringify((${src})(${JSON.stringify(a)}))`), [fn.toString(), arg]).then(s => s === undefined ? undefined : JSON.parse(s));
