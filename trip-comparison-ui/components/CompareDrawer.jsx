import { View, Text, Pressable, ScrollView, Modal, StyleSheet } from "react-native";
import { ValueMeter, HostBadge, IncPill } from "./ui";
import { Colors, DiffColors, ALL_INCLUSIONS, formatINR } from "../constants/theme";

const COMPARE_ROWS = [
  {
    label: "Price",
    render: (t) => (
      <View>
        <Text style={styles.priceVal}>{formatINR(t.price?.amount)}</Text>
        {t.price?.amount && (
          <Text style={styles.ppdVal}>{formatINR(Math.round(t.price.amount / t.duration_days))}/day</Text>
        )}
      </View>
    ),
  },
  {
    label: "Value",
    render: (t) => <ValueMeter score={t.scores?.value} size={38} />,
  },
  {
    label: "Duration",
    render: (t) => <Text style={styles.cellText}>{t.duration_days} days</Text>,
  },
  {
    label: "Difficulty",
    render: (t) => (
      <Text style={[styles.cellText, { color: DiffColors[t.difficulty_level] || Colors.textLight, fontWeight: "600" }]}>
        {t.difficulty_level || "\u2014"}
      </Text>
    ),
  },
  {
    label: "Group",
    render: (t) => <Text style={styles.cellText}>max {t.group_size_max || "?"}</Text>,
  },
  {
    label: "Host",
    render: (t) => (
      <View style={{ gap: 3 }}>
        <Text style={[styles.cellText, { fontSize: 12, marginBottom: 3 }]}>{t.host?.name}</Text>
        <HostBadge host={t.host} />
      </View>
    ),
  },
  {
    label: "Includes",
    render: (t) => (
      <View style={{ gap: 3 }}>
        {ALL_INCLUSIONS.map(i => (
          <IncPill key={i} label={i} included={t.price?.includes?.some(x => x.toLowerCase().includes(i))} />
        ))}
      </View>
    ),
  },
];

export default function CompareDrawer({ trips, onClose, onRemove }) {
  if (trips.length < 2) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Comparing {trips.length} trips</Text>
            <Pressable onPress={onClose} style={styles.headerClose}>
              <Text style={styles.headerCloseText}>Close</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Trip names row */}
              <View style={styles.row}>
                <View style={styles.labelCell} />
                {trips.map(t => (
                  <View key={t.id} style={styles.valueCell}>
                    <Text style={styles.tripName} numberOfLines={2}>{t.title}</Text>
                    <Pressable onPress={() => onRemove(t)}>
                      <Text style={styles.removeText}>Remove {"\u00D7"}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* Data rows */}
              <ScrollView>
                {COMPARE_ROWS.map(row => (
                  <View key={row.label} style={[styles.row, styles.rowBorder]}>
                    <View style={styles.labelCell}>
                      <Text style={styles.rowLabel}>{row.label}</Text>
                    </View>
                    {trips.map(t => (
                      <View key={t.id} style={styles.valueCell}>
                        {row.render(t)}
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  drawer: {
    backgroundColor: Colors.darkGreen,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.midGreen,
  },
  headerTitle: {
    color: Colors.gold,
    fontWeight: "700",
    fontSize: 15,
  },
  headerClose: {
    borderWidth: 1,
    borderColor: Colors.midGreen,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerCloseText: {
    color: Colors.textLight,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.midGreen,
  },
  labelCell: {
    width: 90,
    padding: 10,
    justifyContent: "flex-start",
  },
  valueCell: {
    width: 180,
    padding: 10,
  },
  rowLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tripName: {
    color: Colors.cream,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 4,
  },
  removeText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  cellText: {
    color: Colors.cream,
    fontSize: 13,
  },
  priceVal: {
    color: Colors.gold,
    fontWeight: "700",
    fontSize: 18,
  },
  ppdVal: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
