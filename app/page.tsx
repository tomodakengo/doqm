import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="fixed w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">doqm</div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/features"
                className="text-gray-600 hover:text-gray-900"
              >
                機能
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900"
              >
                料金
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                ドキュメント
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                ログイン
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AIが支援する
            <br />
            次世代テストドキュメント管理
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            テストケースの作成から実行、レポート作成までを
            <br />
            効率的に管理できるオールインワンプラットフォーム
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              無料で始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              デモを見る
            </Link>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            主な機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-medium text-gray-900">
                    {feature}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">製品</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="hover:text-white">
                    機能
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    料金
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white">
                    ドキュメント
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">会社</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-white">
                    会社概要
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    ブログ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 TestDoc AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
