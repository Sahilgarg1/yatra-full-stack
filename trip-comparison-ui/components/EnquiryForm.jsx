import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Linking } from "react-native";
import { submitEnquiry } from "../api/trips";
import { Colors } from "../constants/theme";

export default function EnquiryForm({ trip, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", num_travelers: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) return setError("Name and email are required.");
    setLoading(true);
    setError(null);
    try {
      const res = await submitEnquiry({
        trip_id: trip.id,
        ...form,
        num_travelers: form.num_travelers ? parseInt(form.num_travelers) : undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>{"\u2713"}</Text>
        <Text style={styles.successTitle}>Enquiry sent!</Text>
        <Text style={styles.successSubtitle}>Now reach the host directly:</Text>
        {result.whatsapp_url && (
          <Pressable onPress={() => Linking.openURL(result.whatsapp_url)} style={styles.whatsappBtn}>
            <Text style={styles.whatsappText}>Open WhatsApp {"\u2192"}</Text>
          </Pressable>
        )}
        {result.original_listing_url && (
          <Pressable onPress={() => Linking.openURL(result.original_listing_url)} style={styles.listingBtn}>
            <Text style={styles.listingText}>View original listing {"\u2192"}</Text>
          </Pressable>
        )}
        <Pressable onPress={onClose} style={{ marginTop: 14 }}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.formTitle}>Enquire about this trip</Text>
      <Text style={styles.formSubtitle}>We'll log your interest and help you reach {trip.host?.name} directly.</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {[
        ["name", "Your name *", "default"],
        ["email", "Email *", "email-address"],
        ["phone", "Phone (optional)", "phone-pad"],
        ["num_travelers", "Number of travelers", "number-pad"],
      ].map(([key, label, keyboardType]) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={form[key]}
            onChangeText={v => update(key, v)}
            keyboardType={keyboardType}
            style={styles.input}
            placeholderTextColor={Colors.textLight}
          />
        </View>
      ))}

      <View style={styles.field}>
        <Text style={styles.label}>Message (optional)</Text>
        <TextInput
          value={form.message}
          onChangeText={v => update("message", v)}
          multiline
          numberOfLines={3}
          placeholder="Any specific questions or requests?"
          placeholderTextColor={Colors.textLight}
          style={[styles.input, styles.textarea]}
        />
      </View>

      <View style={styles.btnRow}>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable onPress={handleSubmit} disabled={loading} style={[styles.submitBtn, loading && { opacity: 0.7 }]}>
          <Text style={styles.submitText}>{loading ? "Sending\u2026" : "Send enquiry \u2192"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  successIcon: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 12,
    color: Colors.green,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  successSubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  whatsappBtn: {
    backgroundColor: Colors.whatsapp,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  whatsappText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  listingBtn: {
    backgroundColor: Colors.beigeLight,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  listingText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  closeText: {
    color: Colors.textLight,
    fontSize: 13,
    textAlign: "center",
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: Colors.redBg,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.red,
    fontSize: 13,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  btnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "white",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.gold,
    alignItems: "center",
  },
  submitText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});
