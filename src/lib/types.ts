export interface Schedule {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  createdAt: number;
}

export interface Diary {
  id: string;
  date: string;
  content: string;
  photos?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: number;
}

export const categories = {
  expense: ["餐饮", "交通", "购物", "娱乐", "住房", "医疗", "教育", "其他"],
  income: ["工资", "奖金", "投资", "兼职", "红包", "其他"],
};