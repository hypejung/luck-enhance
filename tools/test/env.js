// 테스트 환경 경로. 클라우드 컨테이너 기본값이고, 다르면 환경 변수로 덮어쓴다.
module.exports = {
  playwright: process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright',
  chrome: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  url: `http://localhost:${process.env.PORT || 8974}/game-source.html`,
  firebase: 'https://luck-enhance-default-rtdb.asia-southeast1.firebasedatabase.app/**',
};
