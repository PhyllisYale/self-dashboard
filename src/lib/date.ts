import { format, isToday as isDateToday, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale";

export const formatDate = (date: Date | string) => format(date, "yyyy-MM-dd");
export const formatDateTime = (date: Date) => format(date, "yyyy-MM-dd HH:mm");
export const formatMonth = (date: Date) => format(date, "yyyy年M月", { locale: zhCN });
export const formatMonthDay = (date: Date) => format(date, "M月d日", { locale: zhCN });
export const formatWeekday = (date: Date) => format(date, "EEEE", { locale: zhCN });
export const formatFullDate = (date: Date) => format(date, "yyyy年M月d日 EEEE", { locale: zhCN });
export const isToday = (date: Date) => isDateToday(date);
export const checkSameDay = (d1: Date, d2: Date) => isSameDay(d1, d2);
