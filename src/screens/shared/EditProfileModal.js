import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile } from "../../api/profile";

export default function EditProfileModal({ visible, user, onClose, onSaved }) {
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && user) {
      setFullName(user.full_name || user.name || "");
      setError("");
    }
  }, [visible, user]);

  async function handleSave() {
    if (!fullName.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const updated = await updateProfile(user.user_id || user.id, { full_name: fullName.trim() });
      onSaved(updated.user || updated);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
          />

          <Text style={styles.hint}>
            Email and password changes aren't available yet — contact your admin if you need those updated.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  hint: { fontSize: 11, color: "#9ca3af", marginBottom: 16, lineHeight: 16 },
  error: { color: "#dc2626", fontSize: 12, marginBottom: 10 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4, marginBottom: 8 },
  cancelButton: { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  cancelText: { color: "#6b7280", fontWeight: "600", fontSize: 13 },
  saveButton: { flex: 1, paddingVertical: 13, borderRadius: 10, backgroundColor: "#2563eb", alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});