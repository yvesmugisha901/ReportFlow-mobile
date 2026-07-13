import client from "./client";

// Backend infers stage (Stage 1 vs Stage 2) from the logged-in user's role —
// mobile just calls this one endpoint regardless of reviewer/approver.
export async function getPendingReviews() {
  const response = await client.get("/reviews/pending");
  return response.data.reports;
}

// action: "approve" | "changes" | "reject"
// comment required only when action === "reject" (enforced server-side too)
export async function submitReviewDecision(reportId, { action, comment }) {
  const response = await client.post(`/reviews/${reportId}`, { action, comment });
  return response.data; // { success, message, status }
}

export async function getReviewLogs(reportId) {
  const response = await client.get(`/reviews/logs${reportId ? `/${reportId}` : ""}`);
  return response.data.logs;
}

export async function getMyReviewHistory() {
  const response = await client.get("/reviews/my-history");
  return response.data.logs;
}