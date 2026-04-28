export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function budgetStatus(
  budget: number,
  spent: number
): "safe" | "warning" | "over" {
  const pct = (spent / budget) * 100;
  if (pct >= 100) return "over";
  if (pct >= 80) return "warning";
  return "safe";
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-[#f7e8cc] text-[#875217]",
    in_progress: "bg-[#d7ecef] text-[#1d5c63]",
    completed: "bg-[#d7eedf] text-[#276940]",
  };
  return map[status] ?? "bg-[#ece8dc] text-[#5e5746]";
}

export function priorityBadgeClass(priority: string): string {
  const map: Record<string, string> = {
    low: "bg-[#e9e4d7] text-[#5c5340]",
    medium: "bg-[#f3dfc8] text-[#9a5621]",
    high: "bg-[#f5d6cd] text-[#a53f34]",
  };
  return map[priority] ?? "bg-[#ece8dc] text-[#5e5746]";
}

export function categoryBadgeClass(category: string): string {
  const map: Record<string, string> = {
    materials: "bg-[#d8eaed] text-[#1f626a]",
    labor: "bg-[#dbe7dd] text-[#2b6f46]",
    equipment: "bg-[#f2e0c3] text-[#9a5621]",
    other: "bg-[#ece8dc] text-[#5e5746]",
  };
  return map[category] ?? "bg-[#ece8dc] text-[#5e5746]";
}
