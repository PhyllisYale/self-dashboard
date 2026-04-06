"use client";

import { useRef } from "react";
import { useStorage, storage } from "@/lib/storage";
import { type Schedule, type Diary, type Transaction } from "@/lib/types";
import { ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [schedules] = useStorage<Schedule[]>("schedules", []);
  const [diaries] = useStorage<Diary[]>("diaries", []);
  const [transactions] = useStorage<Transaction[]>("transactions", []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 导出数据
  const exportData = () => {
    const data = {
      schedules,
      diaries,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入数据
  const importData = () => {
    fileInputRef.current?.click();
  };

  // 处理文件导入
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.schedules) storage.set("schedules", data.schedules);
        if (data.diaries) storage.set("diaries", data.diaries);
        if (data.transactions) storage.set("transactions", data.transactions);
        alert("数据导入成功，请刷新页面");
        location.reload();
      } catch {
        alert("文件格式错误");
      }
    };
    reader.readAsText(file);
  };

  // 清空所有数据
  const clearAll = () => {
    if (confirm("确定清空所有数据？此操作不可恢复！")) {
      storage.clear();
      alert("数据已清空，请刷新页面");
      location.reload();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">设置</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-1">数据管理</h3>
          <p className="text-sm text-gray-500">所有数据存储在浏览器本地</p>
        </div>

        <button
          onClick={exportData}
          className="w-full p-4 text-left flex justify-between items-center border-b hover:bg-gray-50"
        >
          <span>📥 导出数据</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={importData}
          className="w-full p-4 text-left flex justify-between items-center border-b hover:bg-gray-50"
        >
          <span>📤 导入数据</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={clearAll}
          className="w-full p-4 text-left flex justify-between items-center text-red-500 hover:bg-gray-50"
        >
          <span>🗑️ 清空所有数据</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-1">统计信息</h3>
        </div>
        <div className="p-4 text-sm text-gray-600 space-y-1">
          <p>📅 日程数量: {schedules.length}</p>
          <p>📝 日记数量: {diaries.length}</p>
          <p>💰 记账记录: {transactions.length} 笔</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-1">关于</h3>
        </div>
        <div className="p-4 text-sm text-gray-600">
          <p>Self Dashboard v1.0</p>
          <p className="mt-1">个人自我管理工具</p>
          <p className="mt-2 text-xs text-gray-400">
            技术栈: Next.js + Tailwind CSS
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileImport}
        accept=".json"
        className="hidden"
      />
    </div>
  );
}