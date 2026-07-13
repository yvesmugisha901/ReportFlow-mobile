export const FREQUENCY_LABELS = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  custom: "One-time",
};

export function formatFrequency(frequency) {
  return FREQUENCY_LABELS[frequency] || frequency;
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function periodLabel(schedule) {
  if (!schedule.currentPeriod) return "";
  const { start, end } = schedule.currentPeriod;
  if (!schedule.currentPeriod.isRecurring) return "One-time";
  return `${formatDate(start)} – ${formatDate(end)}`;
}

// Returns { label, color, bg } for the schedule's current status
export function getScheduleStatus(schedule) {
  if (schedule.alreadySubmitted) {
    if (schedule.existingReportStatus === "changes_requested") {
      return { label: "Changes requested", color: "#D97706", bg: "#FFF7ED" };
    }
    return { label: "Submitted", color: "#16A34A", bg: "#ECFDF5" };
  }
  if (schedule.isOverdue) {
    return { label: "Overdue", color: "#DC2626", bg: "#FEF2F2" };
  }
  return { label: "Open", color: "#2563EB", bg: "#EFF6FF" };
}