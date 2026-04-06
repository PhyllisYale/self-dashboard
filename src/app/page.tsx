"use client";

import Link from "next/link";
import { useStorage } from "@/lib/storage";
import { type Schedule, type Diary, type Transaction } from "@/lib/types";
import { formatMonthDay, formatWeekday } from "@/lib/date";

export default function HomePage() {
  const today = new Date();
  const [schedules] = useStorage<Schedule[]>("schedules", []);
  const [diaries] = useStorage<Diary[]>("diaries", []);
  const [transactions] = useStorage<Transaction[]>("transactions", []);

  const todayStr = formatMonthDay(today).replace("月", "-");
  const todaySchedules = schedules.filter((s) => s.date === todayStr);
  const todayDiary = diaries.find((d) => d.date === todayStr);
  const todayTransactions = transactions.filter((t) => t.date === todayStr);

  const todayExpense = todayTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4">
      {/* 头部日期卡片 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
        <div className="text-sm opacity-80">{formatWeekday(today)}</div>
        <div className="text-3xl font-bold">{formatMonthDay(today)}</div>
      </div>

      <div className="space-y-4">
        {/* 今日日程 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">📅 今日日程</h3>
            <Link href="/schedule" className="text-blue-500 text-sm">查看全部</Link>
          </div>
          {todaySchedules.length > 0 ? (
            <div className="space-y-2">
              {todaySchedules.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">
                      {item.startTime} - {item.endTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">暂无日程</div>
          )}
        </div>

        {/* 今日收支 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">💰 今日收支</h3>
            <Link href="/money" className="text-blue-500 text-sm">记账</Link>
          </div>
          {todayTransactions.length > 0 ? (
            <div className="space-y-2">
              {todayTransactions.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.category}</span>
                    {item.note && (
                      <span className="text-xs text-gray-400">{item.note}</span>
                    )}
                  </div>
                  <span
                    className={
                      item.type === "income" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {item.type === "income" ? "+" : "-"}¥{item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">暂无记录</div>
          )}
        </div>

        {/* 今日日记 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">📝 今日日记</h3>
            <Link href="/diary" className="text-blue-500 text-sm">写日记</Link>
          </div>
          {todayDiary ? (
            <div className="text-gray-600 line-clamp-3">{todayDiary.content}</div>
          ) : (
            <div className="text-gray-400 text-center py-4">今日还未写日记</div>
          )}
        </div>
      </div>
    </div>
  );
}