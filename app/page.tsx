import {
  ArrowRight,
  CheckCircle,
  FolderTree,
  History,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    "AIによるテストケース生成支援",
    "バージョン管理機能",
    "チーム協業機能",
    "リアルタイムレポート",
    "テストスイート管理",
    "カスタマイズ可能なワークフロー",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Doqm</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              ログイン
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              新規登録
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        {/* ヒーローセクション */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              テスト管理をシンプルに、効率的に
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Doqmは、テストケースの作成から実行結果の管理まで、テスト業務全体をサポートする次世代のテスト管理プラットフォームです。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 text-lg font-medium"
              >
                無料で始める
              </Link>
              <Link
                href="#features"
                className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-lg font-medium"
              >
                詳細を見る
              </Link>
            </div>
          </div>
        </section>

        {/* 機能セクション */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">主な機能</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FolderTree className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">階層型テスト管理</h3>
                <p className="text-gray-600">
                  テストスイートとテストケースを階層構造で管理し、大規模なテスト計画も整理できます。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">バージョン管理</h3>
                <p className="text-gray-600">
                  テストケースの変更履歴を追跡し、いつでも過去のバージョンを参照できます。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">チーム協業</h3>
                <p className="text-gray-600">
                  複数のチームメンバーでテストを共有し、効率的に協業できる環境を提供します。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Doqm</h3>
              <p className="text-gray-400 max-w-md">
                テスト管理の新しいスタンダードを提供し、品質向上とリリースサイクルの短縮を実現します。
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">製品</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      機能
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      料金プラン
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      API
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">サポート</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      ドキュメント
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      よくある質問
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      お問い合わせ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">会社情報</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      会社概要
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      プライバシーポリシー
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      利用規約
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2023 Doqm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
