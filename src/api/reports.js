import client from "./client";

export async function getMyReports(filters = {}) {
  const response = await client.get("/reports", { params: filters });
  return response.data.reports;
}

export async function getReportById(reportId) {
  const response = await client.get(`/reports/${reportId}`);
  return response.data.report;
}

export async function submitReport({ scheduleId, title, notes, file }) {
  const formData = new FormData();
  if (scheduleId) formData.append("schedule_id", scheduleId);
  formData.append("title", title);
  formData.append("content", notes || "");
  if (file) {
    formData.append("files[]", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    });
  }

  const response = await client.post("/reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.report;
}