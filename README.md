# FIRE LINER

シンプルなパズルゲーム

[ゲームを表示する](https://hasegawa-campfire.github.io/fire-liner/)

## 動作環境

- モダンブラウザ（スマホ含む）

RIP Internet Explorer

## ローカル実行

ローカルサーバーが立ち上がるだけで、特にビルドなどの処理はありません

```
npm run serve
```

## ビルド

デプロイ時に実行され dist に出力されます

```
npm run build
```

## アセットをまとめる

src/assets 内のファイルを 1 つのデータにまとめます
デプロイ時に実行されますが、手動で実行すればローカル実行でまとめたデータが読まれます
（普段のローカル実行では各ファイルを直接読んでいます）

```
npm run assets:build
```

## アセットまとめの削除

まとめたデータを削除します
デプロイ時にも実行されますが、手動でまとめた場合は手動で消してください

```
npm run assets:clear
```
