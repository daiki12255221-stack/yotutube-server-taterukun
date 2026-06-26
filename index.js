import express from 'express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== 【設定エリア】 ==================
const CHATWORK_API_TOKEN = "47f3a071fe49e7259100d70071c986b7";
const CHATWORK_ROOM_ID = "440162416"; 

// 🔥 3つのURLリスト
const SANDBOX_URLS = [
  "https://jhsnlx-8080.csb.app",
  "https://v52l6d-8080.csb.app",
  "https://znpf9v-3000.csb.app"
];
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

// 🛠️ クッション画面のHTMLテキストを正面から読み、生存ワードを探す関数
async function checkHtmlKeywords(url) {
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const controller = new AbortController();
  
  // ⚡ Vercelが死なないよう、1サイトあたり2秒で見切る
  const timeoutId = setTimeout(() => controller.abort(), 2000); 

  try {
    const res = await fetch(baseUrl, {
      signal: controller.signal,
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    clearTimeout(timeoutId);

    const rawText = await res.text();

    // 🎯 【ユーザーさん考案の完全無欠ロジック】
    // すでに起きてて200 OKの場合、またはクッション画面のボタン（文字）が含まれていれば「合格」！
    if (
      res.status === 200 || 
      rawText.includes("proceed to preview") || 
      rawText.includes("do you want to continue")
    ) {
      console.log(`🟢 [${baseUrl}] クッション画面（生存ワード）を検出しました！`);
      return { baseUrl, success: true };
    }

    console.log(`❌ [${baseUrl}] 生存ワードが見つかりません。`);
    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.log(`⚠️ [${baseUrl}] タイムアウト、または完全にアクセス拒否（死亡）`);
    return null; 
  }
}

// 🌐 1時間ごとのcronアクセスを受信するメイン処理
app.get('/', async (req, res) => {
  console.log(`[${new Date().toLocaleString("ja-JP")}] クッション画面HTML解析・選別を開始します...`);

  let finalUrl = null;

  // 🔄 3つのURLを上から順番に1個ずつチェック（生きてるやつを見つけたら即終了）
  for (const url of SANDBOX_URLS) {
    const result = await checkHtmlKeywords(url);
    if (result && result.success) {
      finalUrl = result.baseUrl;
      break; 
    }
  }

  try {
    let replyMessage = "";

    if (finalUrl) {
      replyMessage = `📺 自作YouTubeサイト案内Bot (自動巡回完了)

現在クレジットが残っていて快適に動くURLはこちらです！
👇
${finalUrl}`;
    } else {
      replyMessage = `📺 自作YouTubeサイト案内Bot (警告)

⚠️ 現在、利用可能なサブ垢がすべて停止しているか、クレジットが切れている可能性があります。`;
    }

    await sendChatworkMessage(replyMessage);
    res.status(200).send(`巡回完了。結果をChatworkへ送信しました。`);

  } catch (error) {
    res.status(500).send(`エラー: ${error.message}`);
  }
});

export default app;
