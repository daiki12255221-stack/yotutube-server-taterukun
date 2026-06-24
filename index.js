import express from 'express';

const app = express();

// ================== 【設定エリア】 ==================
const SANDBOX_URLS = [
  "https://jhsnlx-8080.csb.app/",
  "https://v52l6d-8080.csb.app/"
];
// ===================================================

app.get('/', (req, res) => {
  const nowStr = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  console.log(`[${nowStr}] ⏰ 【撃ち逃げモード】サーバー立てる君が起動しました。`);

  // 各サブ垢に「返事を待たずに」一斉にノックを送りつける
  SANDBOX_URLS.forEach((url) => {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    console.log(`🚀 【投函】起動リクエストを送信中 -> ${baseUrl}`);

    // 🔥 await をつけないことで、相手の返事やクッション画面を待たずに次へ進む！
    fetch(`${baseUrl}/api/ping`, {
      method: "GET",
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", // ブラウザのフリをする
        "X-CSB-Skip-Incap-Check": "true", // Yes Previewを飛ばすおまじない
        "Accept": "application/json",
        "Connection": "keep-alive"
      }
    }).then((response) => {
      // 万が一Vercelが終了する前に返ってきたらログを出すだけ（エラーでも無視）
      console.log(`📡 【バックグラウンド反応】${baseUrl} からステータス: ${response.status} が返りました`);
    }).catch((err) => {
      // 途中で切断されてもコンテナ起動の電気信号は届いているので問題なし！
      console.log(`⏳ 【バックグラウンド切断】${baseUrl} への送信処理を終了しました`);
    });
  });

  // ⚡ サブ垢の返事を一切待たずに、Vercel側は1秒で「送信完了！」と処理を終わらせる
  res.status(200).send("すべてのCodeSandboxへノンストップで叩き起こし信号を撃ち込みました。");
});

export default app;
