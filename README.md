# 日本酒記録アプリ

飲んだ日本酒を記録・管理するWebアプリ。

- **フロントエンド**: GitHub Pages
- **バックエンド**: Google Apps Script (GAS)
- **データ**: Googleスプレッドシート

---

## 初回セットアップ

### 1. 依存関係のインストール

```bash
# フロントエンドのテスト環境
cd docs
npm install

# clasp（GASデプロイ用CLI）
npm install -g @google/clasp
clasp login  # ブラウザでGoogleアカウント認証
```

### 2. GASプロジェクトの作成とデプロイ

```bash
cd gas
clasp create --type webapp --title "日本酒記録"
clasp push
```

GAS IDEを開いてWebアプリとしてデプロイ:
1. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
2. 実行ユーザー: **自分**、アクセス: **自分のみ**
3. デプロイURLをコピー

### 3. フロントエンドにURLを設定

`docs/js/config.js` を編集:

```js
var CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
```

### 4. GitHub Pagesを有効化

```bash
cd docs
git push origin main
```

GitHubリポジトリの Settings → Pages → Branch: main → Save

---

## 更新手順（コード変更後）

```bash
# フロントエンド
git add .
git commit -m "変更内容"
git push origin main   # GitHub Pages に自動反映

# GASバックエンド（gas/ を変更した場合）
cd gas
clasp push
```

GASはコード変更後にデプロイの更新が必要:
「デプロイ」→「デプロイを管理」→「新しいバージョン」→「デプロイ」

---

## テスト

```bash
cd docs
npm test              # 全テスト実行
npm run test:coverage # カバレッジ付き
```

GASのテストはGAS IDE上で `runAllTests()` を実行してログを確認。

---

## ファイル構成

```
docs/        GitHub Pagesで公開するファイル
  index.html     入力フォーム
  stats.html     統計ダッシュボード
  quiz.html      クイズ
  css/style.css  共通スタイル
  js/            ロジック（config.js, form.js, suggest.js, stats.js, quiz.js）
  tests/         Jestテスト

gas/             Google Apps Scriptのソースコード
  Code.gs        APIエントリーポイント
  SheetService.gs  スプレッドシート操作
  StatsService.gs  統計集計
  QuizService.gs   クイズ生成
  Code.test.gs   GAS内テストランナー
```
