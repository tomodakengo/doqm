"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TestSuite } from "@/lib/types/test-suite";
import { createTestSuite } from "@/lib/api/test-suite";

const formSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  version: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (suite: TestSuite) => void;
  parentSuite?: TestSuite;
}

export function CreateTestSuiteModal({
  isOpen,
  onClose,
  onSuccess,
  parentSuite,
}: CreateTestSuiteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: parentSuite?.id,
      version: "1.0",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const suite = await createTestSuite(data);
      onSuccess(suite);
      onClose();
    } catch (error) {
      console.error("Failed to create test suite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            新しいテストスイートを作成
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名前
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="テストスイート名"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                {...register("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="テストスイートの説明"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                バージョン
              </label>
              <input
                type="text"
                {...register("version")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? "作成中..." : "作成"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
