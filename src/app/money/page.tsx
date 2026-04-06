"use client";

import { useState, useMemo } from "react";
import { useStorage } from "@/lib/storage";
import { type Transaction, categories } from "@/lib/types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Plus } from "lucide-react";

export default function MoneyPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [transactions, setTransactions] = useStorage<Transaction[]>("transactions", []);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    note: "",
  });

  const currentMonthLabel = format(now, "M月", { locale: zhCN });

  // 本月统计数据
  const stats = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const monthData = transactions.filter((t) => t.date.startsWith(prefix));
    const income = monthData
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthData
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions, year, month]);

  // 分类统计
  const categoryStats = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const monthData = transactions.filter(
      (t) => t.date.startsWith(prefix) && t.type === "expense"
    );
    const stats: Record<string, number> = {};
    monthData.forEach((t) => {
      stats[t.category] = (stats[t.category] || 0) + t.amount;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, year, month]);

  // 计算百分比
  const getPercent = (value: number) => {
    const total = categoryStats.reduce((sum, i) => sum + i.value, 0);
    return total ? Math.round((value / total) * 100) : 0;
  };

  // 保存交易
  const handleSave = () => {
    if (!form.amount || !form.category) return;
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category,
      note: form.note,
      date: format(new Date(), "yyyy-MM-dd"),
      createdAt: Date.now(),
    };
    setTransactions([newTransaction, ...transactions]);
    setShowModal(false);
    setForm({ type: "expense", amount: "", category: "", note: "" });
  };

  // 删除交易
  const handleDelete = (id: string) => {
    if (confirm("确定删除？")) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const currentCategories = categories[form.type];

  return (
    <div className="p-4">
      {/* 统计卡片 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-500">{currentMonthLabel}结余</div>
          <div
            className={`text-3xl font-bold ${
              stats.balance >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            ¥{stats.balance.toFixed(2)}
          </div>
        </div>
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-sm text-gray-500">收入</div>
            <div className="text-green-500 font-semibold">
              ¥{stats.income.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">支出</div>
            <div className="text-red-500 font-semibold">
              ¥{stats.expense.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 分类统计 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold mb-2">支出分类</h3>
        <div className="space-y-2">
          {categoryStats.length > 0 ? (
            categoryStats.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="flex-1 text-sm">{item.name}</div>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${getPercent(item.value)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 w-16 text-right">
                  ¥{item.value.toFixed(0)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-4">暂无支出记录</div>
          )}
        </div>
      </div>

      {/* 交易列表 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">近期记录</h3>
        </div>
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{item.category}</span>
                  {item.note && (
                    <span className="text-xs text-gray-400">{item.note}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      item.type === "income" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {item.type === "income" ? "+" : "-"}¥{item.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 text-xs p-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-4">暂无记录</div>
        )}
      </div>

      {/* 悬浮添加按钮 */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 记账弹窗 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-lg mb-4">记一笔</h3>

            {/* 类型切换 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() =>
                  setForm({ ...form, type: "expense", category: "" })
                }
                className={`flex-1 py-2 rounded-lg ${
                  form.type === "expense"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                支出
              </button>
              <button
                onClick={() => setForm({ ...form, type: "income", category: "" })}
                className={`flex-1 py-2 rounded-lg ${
                  form.type === "income"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                收入
              </button>
            </div>

            {/* 金额输入 */}
            <div className="mb-4">
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="金额"
                className="w-full p-3 border rounded-lg text-2xl text-center"
              />
            </div>

            {/* 分类选择 */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {currentCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`py-2 text-sm rounded-lg ${
                    form.category === cat
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 备注 */}
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="备注（可选）"
              className="w-full p-3 border rounded-lg mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}