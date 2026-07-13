import client from "./client";

// Employee: get reports visible to the current user
// filters can include: status, type, start_date, end_date, search
export async function getMyReports(filters = {}) {
  const response = await client.get("/reports/my", { params: filters });
  return response.data;
}

export async function getReportById(reportId) {
  const response = await client.get(`/reports/${reportId}`);
  return response.data;
}

// Get status history / audit trail for a report
export async function getReportHistory(reportId) {
  const response = await client.get(`/reports/${reportId}/history`);
  return response.data;
}

// file: { uri, name, mimeType } from expo-document-picker
export async function submitReport({ scheduleId, notes, file }) {
  const formData = new FormData();
  formData.append("schedule_id", scheduleId);
  formData.append("content", notes || "");
  if (file) {
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    });
  }

  const response = await client.post("/reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}