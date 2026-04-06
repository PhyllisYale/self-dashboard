"use client";

import { useState, useMemo } from "react";
import { useStorage } from "@/lib/storage";
import { type Diary } from "@/lib/types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Plus } from "lucide-react";

export default function DiaryPage() {
  const [diaries, setDiaries] = useStorage<Diary[]>("diaries", []);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Diary | null>(null);
  const [form, setForm] = useState({
    content: "",
    photos: [] as string[],
  });

  // 按日期分组
  const groupedDiaries = useMemo(() => {
    const groups: Record<string, Diary[]> = {};
    diaries.forEach((d) => {
      if (!groups[d.date]) {
        groups[d.date] = [];
      }
      groups[d.date].push(d);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        label: format(new Date(date), "M月d日 EEEE", { locale: zhCN }),
        items,
      }));
  }, [diaries]);

  // 处理图片选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 500 * 1024) {
        alert("图片需小于500KB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setForm((f) => ({
            ...f,
            photos: [...f.photos, ev.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 删除图片
  const removePhoto = (index: number) => {
    setForm((f) => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index),
    }));
  };

  // 保存日记
  const handleSave = () => {
    if (!form.content) return;
    const dateStr = format(new Date(), "yyyy-MM-dd");

    if (editingItem) {
      setDiaries(
        diaries.map((d) =>
          d.id === editingItem.id
            ? { ...d, ...form, updatedAt: Date.now() }
            : d
        )
      );
    } else {
      const newDiary: Diary = {
        id: Date.now().toString(),
        ...form,
        date: dateStr,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setDiaries([newDiary, ...diaries]);
    }

    setShowModal(false);
    setForm({ content: "", photos: [] });
    setEditingItem(null);
  };

  // 编辑日记
  const handleEdit = (item: Diary) => {
    setEditingItem(item);
    setForm({
      content: item.content,
      photos: [...(item.photos || [])],
    });
    setShowModal(true);
  };

  // 删除日记
  const handleDelete = (id: string) => {
    if (confirm("确定删除这篇日记？")) {
      setDiaries(diaries.filter((d) => d.id !== id));
    }
  };

  // 打开新建弹窗
  const openAddModal = () => {
    setEditingItem(null);
    setForm({ content: "", photos: [] });
    setShowModal(true);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">每日记录</h2>

      {diaries.length > 0 ? (
        <div className="space-y-4">
          {groupedDiaries.map((group) => (
            <div key={group.date} className="space-y-2">
              <div className="text-sm text-gray-500 py-2">{group.label}</div>
              {group.items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-gray-600 mb-2 whitespace-pre-wrap line-clamp-3">
                    {item.content}
                  </div>
                  {item.photos && item.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {item.photos.slice(0, 3).map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt=""
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-12">
          暂无记录，开始写第一篇日记吧
        </div>
      )}

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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4">
              {editingItem ? "编辑日记" : "写日记"}
            </h3>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="今天发生了什么？"
              className="w-full p-3 border rounded-lg mb-3 h-32 resize-none"
            />
            <div className="mb-4">
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="text-sm w-full"
              />
              {form.photos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.photos.map((photo, i) => (
                    <div key={i} className="relative">
                      <img
                        src={photo}
                        alt=""
                        className="w-16 h-16 object-cover rounded"
                      />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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