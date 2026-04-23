export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

export function priorityBadgeClass(priority: string): string {
  const map: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
  };
  return map[priority] ?? "bg-gray-100 text-gray-600";
}

export function categoryBadgeClass(category: string): string {
  const map: Record<string, string> = {
    materials: "bg-blue-100 text-blue-700",
    labor: "bg-purple-100 text-purple-700",
    equipment: "bg-yellow-100 text-yellow-700",
    other: "bg-gray-100 text-gray-600",
  };
  return map[category] ?? "bg-gray-100 text-gray-600";
}
