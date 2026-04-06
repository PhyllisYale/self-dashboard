"use client";

import { useState, useMemo } from "react";
import { useStorage } from "@/lib/storage";
import { type Schedule } from "@/lib/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useStorage<Schedule[]>("schedules", []);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Schedule | null>(null);
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    note: "",
  });

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startDay = getDay(start);
    const prefix = Array(startDay).fill(null);
    return [...prefix, ...days];
  }, [currentMonth]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedSchedules = schedules.filter((s) => s.date === selectedDateStr);

  const monthLabel = format(currentMonth, "yyyy年M月", { locale: zhCN });

  // 检查某天是否有日程
  const hasSchedule = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedules.some((s) => s.date === dateStr);
  };

  // 保存日程
  const handleSave = () => {
    if (!form.title) return;
    const data = {
      ...form,
      date: selectedDateStr,
    };

    if (editingItem) {
      setSchedules(
        schedules.map((s) =>
          s.id === editingItem.id ? { ...s, ...data } : s
        )
      );
    } else {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        ...data,
        createdAt: Date.now(),
      };
      setSchedules([...schedules, newSchedule]);
    }

    setShowModal(false);
    setForm({ title: "", startTime: "", endTime: "", note: "" });
    setEditingItem(null);
  };

  // 删除日程
  const handleDelete = (id: string) => {
    if (confirm("确定删除？")) {
      setSchedules(schedules.filter((s) => s.id !== id));
    }
  };

  // 编辑日程
  const handleEdit = (item: Schedule) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      startTime: item.startTime,
      endTime: item.endTime,
      note: item.note || "",
    });
    setShowModal(true);
  };

  // 打开新建弹窗
  const openAddModal = () => {
    setEditingItem(null);
    setForm({ title: "", startTime: "", endTime: "", note: "" });
    setShowModal(true);
  };

  return (
    <div className="p-4">
      {/* 月份切换 */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold">{monthLabel}</span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 日历 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDays.map((day) => (
            <span key={day} className="text-xs text-gray-400">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <button
              key={i}
              onClick={() => day && setSelectedDate(day)}
              disabled={!day}
              className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg relative
                ${!day ? "invisible" : ""}
                ${
                  day && isSameDay(day, selectedDate)
                    ? "bg-blue-500 text-white"
                    : day && isSameMonth(day, currentMonth)
                    ? "hover:bg-blue-50"
                    : "text-gray-300"
                }
                ${day && isSameDay(day, new Date()) ? "ring-2 ring-blue-300" : ""}
              `}
            >
              {day?.getDate()}
              {day && hasSchedule(day) && (
                <div className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 选中日期的日程列表 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">
          {format(selectedDate, "M月d日 EEEE", { locale: zhCN })}
        </h3>
        {selectedSchedules.length > 0 ? (
          <div className="space-y-3">
            {selectedSchedules.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">
                    {item.startTime} - {item.endTime}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-4">当天暂无日程</div>
        )}
      </div>

      {/* 悬浮添加按钮 */}
      <button
        onClick={openAddModal}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-lg mb-4">
              {editingItem ? "编辑日程" : "新建日程"}
            </h3>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="标题"
              className="w-full p-3 border rounded-lg mb-3"
            />
            <div className="flex gap-2 mb-3">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="flex-1 p-3 border rounded-lg"
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="flex-1 p-3 border rounded-lg"
              />
            </div>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="备注（可选）"
              className="w-full p-3 border rounded-lg mb-4 h-20 resize-none"
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