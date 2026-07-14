import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../../api/schedules";
import { getAllDepartments, getTeams } from "../../api/admin";
import SelectField from "../../components/SelectField";

const FREQUENCY_OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-weekly", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Custom", value: "custom" },
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function ScheduleFormScreen({ route, navigation }) {
  const scheduleId = route.params?.scheduleId ?? null;
  const isEdit = !!scheduleId;

  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [deptId, setDeptId] = useState(null);
  const [teamId, setTeamId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAllDepartments()
        .then(setDepartments)
        .catch((err) => console.warn("Failed to load departments", err));
    }, [])
  );

  useEffect(() => {
    if (!isEdit) return;
    getScheduleById(scheduleId)
      .then((s) => {
        setTitle(s.title || "");
        setReportType(s.report_type || "");
        setFrequency(s.frequency || "monthly");
        setStartDate(s.start_date || "");
        setDeadline(s.deadline || "");
        setDeptId(s.dept_id ?? null);
        setTeamId(s.team_id ?? null);
      })
      .catch((err) => console.warn("Failed to load schedule", err))
      .finally(() => setLoading(false));
  }, [scheduleId, isEdit]);

  useEffect(() => {
    if (!deptId) {
      setTeams([]);
      setTeamId(null);
      return;
    }
    setLoadingTeams(true);
    getTeams(deptId)
      .then((data) => {
        setTeams(data || []);
        setTeamId((prev) => (data.some((t) => t.team_id === prev) ? prev : null));
      })
      .catch((err) => console.warn("Failed to load teams", err))
      .finally(() => setLoadingTeams(false));
  }, [deptId]);

  const departmentOptions = [
    { label: "Company-wide (all departments)", value: null },
    ...departments.map((d) => ({ label: d.name, value: d.dept_id })),
  ];
  const teamOptions = [
    { label: "Entire department", value: null },
    ...teams.map((t) => ({ label: t.name, value: t.team_id })),
  ];

  function validate() {
    if (!title.trim()) return "Title is required.";
    if (!reportType.trim()) return "Report type is required.";
    if (!DATE_RE.test(startDate)) return "Start date must be in YYYY-MM-DD format.";
    if (!DATE_RE.test(deadline)) return "Deadline must be in YYYY-MM-DD format.";
    if (deadline < startDate) return "Deadline must be on or after the start date.";
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      Alert.alert("Check your input", validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        report_type: reportType.trim(),
        frequency,
        start_date: startDate,
        deadline,
        dept_id: deptId,
        team_id: teamId,
      };

      if (isEdit) {
        await updateSchedule(scheduleId, payload);
        Alert.alert("Saved", "Schedule updated.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        await createSchedule(payload);
        Alert.alert("Schedule created", `"${title.trim()}" has been added.`, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      const message = err?.response?.data?.error || "Could not save this schedule. Please try again.";
      Alert.alert("Save failed", message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      "Delete schedule?",
      "This cannot be undone. Employees will no longer see this reporting requirement.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteSchedule(scheduleId);
              navigation.goBack();
            } catch (err) {
              Alert.alert("Delete failed", "Could not delete this schedule. Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.heading}>{isEdit ? "Edit Schedule" : "New Schedule"}</Text>

      <Text style={styles.fieldLabel}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Monthly Sales Report"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.fieldLabel}>Report Type</Text>
      <TextInput
        style={styles.input}
        value={reportType}
        onChangeText={setReportType}
        placeholder="e.g. Sales Summary"
        placeholderTextColor="#9CA3AF"
      />

      <SelectField label="Frequency" value={frequency} options={FREQUENCY_OPTIONS} onChange={setFrequency} />

      <Text style={styles.fieldLabel}>Start Date</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9CA3AF"
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.fieldLabel}>Deadline</Text>
      <TextInput
        style={styles.input}
        value={deadline}
        onChangeText={setDeadline}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9CA3AF"
        keyboardType="numbers-and-punctuation"
      />

      <SelectField
        label="Department"
        value={deptId}
        options={departmentOptions}
        onChange={setDeptId}
      />

      <SelectField
        label="Team"
        placeholder={!deptId ? "Applies to entire department" : loadingTeams ? "Loading…" : "Entire department"}
        value={teamId}
        options={teamOptions}
        onChange={setTeamId}
        disabled={!deptId || loadingTeams}
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="calendar-outline" size={17} color="#fff" />
            <Text style={styles.submitText}>{isEdit ? "Save Changes" : "Create Schedule"}</Text>
          </>
        )}
      </TouchableOpacity>

      {isEdit && (
        <TouchableOpacity
          style={[styles.deleteButton, deleting && { opacity: 0.6 }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#DC2626" size="small" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
              <Text style={styles.deleteText}>Delete Schedule</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  heading: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 20 },
  fieldLabel: { fontSize: 12.5, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 14.5 },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 13,
    gap: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  deleteText: { color: "#DC2626", fontWeight: "700", fontSize: 13.5 },
});