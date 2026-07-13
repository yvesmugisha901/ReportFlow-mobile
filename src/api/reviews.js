import client from "./client";

// Adjust routes to match your backend's review/approval endpoints.

export async function getPendingReviews() {
  const response = await client.get("/reviews/pending");
  return response.data;
}

export async function submitReviewDecision(reportId, { action, comment }) {
  // action: "approve" | "reject" | "request_changes"
  const response = await client.post(`/reviews/${reportId}/decision`, {
    action,
    comment,
  });
  return response.data;
}
