# 日本酒記録アプリ

飲んだ日本酒を記録・管理するWebアプリ。

- **フロントエンド**: GitHub Pages（GitHub Actions でデプロイ）
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
clasp push
```

GAS IDEを開いてWebアプリとしてデプロイ:
1. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
2. 実行ユーザー: **自分**、アクセス: **全員**
3. デプロイURLをコピー

### 3. GitHub Secret に GAS URL を登録

1. GitHubリポジトリの **Settings → Secrets and variables → Actions**
2. 「New repository secret」をクリック
3. Name: `GAS_URL`、Value: コピーしたデプロイURL
4. 「Add secret」をクリック

### 4. GitHub Pages を GitHub Actions に切り替え

GitHubリポジトリの **Settings → Pages → Source → GitHub Actions** を選択

### 5. デプロイ実行

```bash
git push origin main  # push すると自動でデプロイされる
```

---

## 更新手順（コード変更後）

```bash
# フロントエンド・設定変更
git add .
git commit -m "変更内容"
git push origin main   # GitHub Actions が自動で GitHub Pages にデプロイ

# GASバックエンド（gas/ を変更した場合）
cd gas
clasp push
# GAS IDE で「デプロイ」→「デプロイを管理」→「新しいバージョン」→「デプロイ」
```

---

## ローカル開発

`config.js` は gitignore されているため、ローカルで動作確認する場合は手動で作成:

```bash
cp docs/js/config.example.js docs/js/config.js
# config.js を編集して GAS_URL を設定
```

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
.github/workflows/
  deploy.yml         GitHub Actions デプロイ設定

docs/                GitHub Pages で公開するファイル
  index.html         入力フォーム
  stats.html         統計ダッシュボード
  quiz.html          クイズ
  css/style.css      共通スタイル
  js/
    config.js        GAS URL設定（gitignore済み・Secret から生成）
    config.example.js  config.js のテンプレート
    form.js / suggest.js / stats.js / quiz.js
  tests/             Jest テスト

gas/                 Google Apps Script のソースコード
  Code.gs            API エントリーポイント
  SheetService.gs    スプレッドシート操作
  StatsService.gs    統計集計
  QuizService.gs     クイズ生成
  Code.test.gs       GAS 内テストランナー
```
