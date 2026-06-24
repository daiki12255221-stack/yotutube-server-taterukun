import express from 'express';

const app = express();

// ================== 【設定エリア】 ==================
// あなたの量産したサブ垢のURLリスト（生存確認Botと同じものでOK）
const SANDBOX_URLS = [
  "https://jhsnlx-8080.csb.app",
  "https://v52l6d-8080.csb.app/"
];
// ===================================================

app.get('/', async (req, res) => {
  const nowStr = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  console.log(`[${nowStr}] ⏰ サーバー叩き起こしタイマーが起動しました。`);

  // 各サブ垢を一斉にバックグラウンドでノックする
  const wakeUpTasks = SANDBOX_URLS.map(async (url) => {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    try {
      console.log(`🚀 【叩き起こし】通信開始 -> ${baseUrl}`);
      
      // タイムアウトを8.5秒に設定し、Vercelの10秒制限の直前まで粘って起こし続ける
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);

      await fetch(`${baseUrl}/api/ping`, {
        signal: controller.signal,
        headers: { 
          "User-Agent": "Sandbox-WakeUp-Agent",
          "X-CSB-Skip-Incap-Check": "true",
          "Accept": "application/json"
        }
      });
      
      clearTimeout(timeoutId);
      console.log(`🟢 【叩き起こし】返信受信、または起動シグナル送信完了 -> ${baseUrl}`);
    } catch (err) {
      // タイムアウト（AbortError）しても、それは「8.5秒間ノックし続けた」証拠なので成功扱い
      console.log(`⏳ 【叩き起こし】時間切れ、または通信切断（これでOKです） -> ${baseUrl}`);
    }
  });

  // 全員のノック処理が（タイムアウト含めて）終わるのを待つ
  await Promise.all(wakeUpTasks);

  res.status(200).send("すべてのCodeSandboxへ叩き起こし信号を送信しました（5分後の本番をお楽しみに）。");
});

export default app;
