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
export async function resubmitReport(reportId, { title, notes, file }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", notes || "");
  if (file) {
    formData.append("files[]", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    });
  }

  const response = await client.put(`/reports/${reportId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.report;
}
export async function getMyReportsPaged({ page = 1, limit = 10 } = {}) {
  const response = await client.get("/reports", { params: { page, limit } });
  const data = response.data;
  const reports = data.reports ?? [];
  const total = data.total ?? data.count ?? reports.length;
  const totalPages = data.totalPages ?? Math.max(1, Math.ceil(total / limit));
  return { reports, total, totalPages, page: data.page ?? page };
}