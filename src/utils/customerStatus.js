// Smart Automation: Calculate Status dynamically based on date and lastPaidMonth
export const getCustomerStatus = (c) => {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  if (c.lastPaidMonth === currentMonth) return "paid";

  const currentDay = today.getDate();
  const billDay = c.billDay || 1;
  const gracePeriod = 5;

  if (currentDay > billDay + gracePeriod) return "overdue";
  return "due";
};
