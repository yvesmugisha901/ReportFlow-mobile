const STATUS_LABEL = {
  pending: "Pending",
  submitted: "Pending",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
};

export function normalizeReport(r) {
  return {
    id: r.report_id ?? r.id,
    title: r.title || r.schedule?.title || "Report",
    employee: r.employee?.full_name ?? "—",
    department: r.employee?.department?.name ?? r.department?.name ?? "—",
    submittedAt: r.submitted_at || r.createdAt,
    status: STATUS_LABEL[r.status] ?? r.status ?? "Pending",
  };
}

export function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function initials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}