import MainLayout from "../components/layout/MainLayout";
import {
  Plus,
  FolderTree,
  ChevronRight,
  MoreVertical,
  File,
} from "lucide-react";
import Link from "next/link";

// 仮のテストスイートデータ
const testSuites = [
  {
    id: 1,
    name: "認証機能テスト",
    description: "ユーザー認証に関連するテストスイート",
    children: [
      {
        id: 11,
        name: "ログイン機能",
        description: "ユーザーログインに関するテストケース",
        testCases: 12,
      },
      {
        id: 12,
        name: "パスワードリセット",
        description: "パスワードリセット機能のテストケース",
        testCases: 8,
      },
    ],
  },
  {
    id: 2,
    name: "ユーザー管理機能",
    description: "ユーザー情報管理に関するテストスイート",
    children: [
      {
        id: 21,
        name: "プロフィール編集",
        description: "ユーザープロフィール編集機能のテストケース",
        testCases: 15,
      },
    ],
  },
];

export default function TestSuitesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">テストスイート</h1>
            <p className="text-gray-600 mt-1">
              テストスイートとテストケースの管理
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            新規スイート作成
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-12 gap-6">
          {/* サイドバー：スイート一覧 */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <FolderTree className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">スイート一覧</h2>
            </div>
            <div className="space-y-2">
              {testSuites.map((suite) => (
                <div key={suite.id}>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{suite.name}</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {suite.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <File className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{child.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {child.testCases}件
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* メインエリア：スイート詳細 */}
          <div className="col-span-9 space-y-6">
            {/* スイート情報 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    認証機能テスト
                  </h2>
                  <p className="text-gray-600 mt-1">
                    ユーザー認証に関連するテストスイート
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500">総テストケース</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    20
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500">実行済み</p>
                  <p className="text-2xl font-semibold text-green-600 mt-1">
                    15
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500">成功率</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">
                    85%
                  </p>
                </div>
              </div>
            </div>

            {/* テストケース一覧 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">
                  テストケース一覧
                </h3>
                <button className="text-blue-600 hover:text-blue-700 inline-flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  テストケース追加
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      テストケース名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      優先度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最終実行
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ログイン成功パターン
                        </div>
                        <div className="text-sm text-gray-500">
                          正常系のログインテスト
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          高
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          成功
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        2024/03/15
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          編集
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
