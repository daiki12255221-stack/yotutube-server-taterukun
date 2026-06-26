import express from 'express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== 【設定エリア】 ==================
const CHATWORK_API_TOKEN = "47f3a071fe49e7259100d70071c986b7";
const CHATWORK_ROOM_ID = "440162416"; 

// まずは1個目のターゲットで実験します
const TARGET_URL = "https://jhsnlx-8080.csb.app";
// ===================================================

async function sendChatworkMessage(message) {
  const res = await fetch(
    `https://api.chatwork.com/v2/rooms/${CHATWORK_ROOM_ID}/messages`,
    {
      method: "POST",
      headers: {
        "X-ChatWorkToken": CHATWORK_API_TOKEN,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ body: message }),
    }
  );
}

app.get('/', async (req, res) => {
  console.log(`[${new Date().toLocaleString("ja-JP")}] HTML強奪ミッション開始...`);

  try {
    const response = await fetch(TARGET_URL, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    // 相手から返ってきた生のHTMLテキストをそのままぶっこ抜く
    const rawHtml = await response.text();

    // 🔍 Vercelのログ（コンソール）に出力
    console.log("--- 奪取した生のHTMLここから ---");
    console.log(rawHtml);
    console.log("--- 奪取した生のHTMLここまで ---");

    // 💬 長すぎるHTMLはChatworkが拒否する場合があるので、最初の1000文字だけ通知してみる
    const previewText = rawHtml.slice(0, 1000);
    
    await sendChatworkMessage(`📺 【HTML強奪結果】
ステータスコード: ${response.status}
文字数: ${rawHtml.length}文字

🔻冒頭1000文字の生データ:
${previewText}`);

    res.status(200).send("HTMLの強奪と送信が完了しました。ログまたはChatworkを確認してください。");

  } catch (error) {
    console.error("強奪失敗:", error);
    await sendChatworkMessage(`❌ HTMLの強奪中にエラーが発生しました:\n${error.message}`);
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`検証サーバー起動中: ${PORT}`));

export default app;
