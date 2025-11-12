import dayjs from "dayjs";

export const formatDate = (date, format = "YYYY-MM-DD") => {
  if (!date) return "";
  return dayjs(date).format(format);
};

export const isDateBeforeToday = (date) => {
  return dayjs(date).isBefore(dayjs(), "day");
};

export const getDaysUntilDue = (dueDate) => {
  const today = dayjs();
  const due = dayjs(dueDate);
  return due.diff(today, "day");
};
