import { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal, ImageBackground, StyleSheet } from "react-native";
import { ValueMeter, HostBadge, IncPill } from "./ui";
import EnquiryForm from "./EnquiryForm";
import { Colors, DiffColors, ALL_INCLUSIONS, formatINR } from "../constants/theme";

export default function TripDetailModal({ trip, onClose, onToggleCompare, onToggleWishlist, isSelected, isWishlisted }) {
  const [view, setView] = useState("detail");
  if (!trip) return null;

  const ppd = trip.price?.amount ? Math.round(trip.price.amount / trip.duration_days) : null;

  const heroContent = (
    <View style={styles.heroInner}>
      <Pressable onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeBtnText}>{"\u00D7"}</Text>
      </Pressable>
      <View>
        <Text style={styles.heroRegion}>{trip.region}</Text>
        <Text style={styles.heroTitle}>{trip.title}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView bounces={false}>
            {/* Hero */}
            {trip.cover_image_url ? (
              <ImageBackground source={{ uri: trip.cover_image_url }} style={styles.hero} imageStyle={styles.heroImage}>
                <View style={styles.heroOverlay}>{heroContent}</View>
              </ImageBackground>
            ) : (
              <View style={[styles.hero, styles.heroFallback]}>{heroContent}</View>
            )}

            {view === "enquiry" ? (
              <EnquiryForm trip={trip} onClose={() => setView("detail")} />
            ) : (
              <View style={styles.body}>
                {/* Host */}
                <View style={styles.hostRow}>
                  <Text style={styles.hostName}>{trip.host?.name}</Text>
                  <HostBadge host={trip.host} />
                  {trip.host?.follower_count > 0 && (
                    <Text style={styles.followers}>{Math.round(trip.host.follower_count / 1000)}K followers</Text>
                  )}
                </View>

                <Text style={styles.description}>{trip.description}</Text>

                {/* Price card */}
                <View style={styles.priceCard}>
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.priceAmount}>{formatINR(trip.price?.amount)}</Text>
                      {ppd && <Text style={styles.pricePpd}>per person \u00B7 {formatINR(ppd)}/day</Text>}
                    </View>
                    <View style={{ alignItems: "center", gap: 2 }}>
                      <ValueMeter score={trip.scores?.value} size={52} />
                      <Text style={styles.valueLabel}>VALUE SCORE</Text>
                    </View>
                  </View>
                  <View style={styles.incRow}>
                    {ALL_INCLUSIONS.map(i => (
                      <IncPill key={i} label={i} included={trip.price?.includes?.some(x => x.toLowerCase().includes(i))} />
                    ))}
                  </View>
                  {trip.price?.excludes?.length > 0 && (
                    <Text style={styles.excludes}>Not included: {trip.price.excludes.join(", ")}</Text>
                  )}
                </View>

                {/* Highlights */}
                {trip.highlights?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>HIGHLIGHTS</Text>
                    <View style={styles.chipRow}>
                      {trip.highlights.map((h, i) => (
                        <View key={i} style={styles.highlightChip}>
                          <Text style={styles.highlightText}>{h}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Stats grid */}
                <View style={styles.statsGrid}>
                  {[
                    ["Duration", `${trip.duration_days} days`],
                    ["Group size", `Max ${trip.group_size_max || "?"}`],
                    ["Difficulty", trip.difficulty_level],
                    ["Type", trip.trip_type?.join(", ")],
                  ].map(([label, val]) => (
                    <View key={label} style={styles.statBox}>
                      <Text style={styles.statLabel}>{label}</Text>
                      <Text style={[styles.statValue, label === "Difficulty" && { color: DiffColors[trip.difficulty_level] || "#888" }]}>
                        {val || "\u2014"}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Departure dates */}
                {trip.departure_dates?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DEPARTURES</Text>
                    <View style={styles.chipRow}>
                      {trip.departure_dates.map((d, i) => (
                        <View key={i} style={styles.dateChip}>
                          <Text style={styles.dateText}>
                            {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Action buttons */}
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => onToggleWishlist(trip.id)}
                    style={[styles.actionBtn, isWishlisted && styles.actionBtnWishlisted]}
                  >
                    <Text style={[styles.actionText, isWishlisted && { color: Colors.red }]}>
                      {isWishlisted ? "\u2665 Saved" : "\u2661 Save"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onToggleCompare(trip)}
                    style={[styles.actionBtn, isSelected && styles.actionBtnCompare]}
                  >
                    <Text style={[styles.actionText, isSelected && { color: "#C47E0E" }]}>
                      {isSelected ? "\u2713 Comparing" : "+ Compare"}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setView("enquiry")} style={styles.enquireBtn}>
                    <Text style={styles.enquireText}>Enquire {"\u2192"}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "92%",
  },
  hero: {
    height: 160,
  },
  heroImage: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(26,43,31,0.55)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  heroFallback: {
    backgroundColor: Colors.darkGreen,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  heroInner: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  heroRegion: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: Colors.cream,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  body: {
    padding: 20,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  hostName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  followers: {
    fontSize: 11,
    color: Colors.textLight,
  },
  description: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 16,
  },
  priceCard: {
    backgroundColor: Colors.beigeLight,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  priceAmount: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  pricePpd: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  valueLabel: {
    fontSize: 9,
    color: Colors.textLight,
    letterSpacing: 0.4,
  },
  incRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  excludes: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textLight,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  highlightChip: {
    backgroundColor: "#4A7C5914",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  highlightText: {
    color: Colors.midGreen,
    fontSize: 12,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dateChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "white",
    alignItems: "center",
  },
  actionBtnWishlisted: {
    borderColor: Colors.redLight,
    backgroundColor: Colors.redBg,
  },
  actionBtnCompare: {
    borderColor: Colors.gold,
    backgroundColor: "#FAEEDA",
  },
  actionText: {
    fontWeight: "600",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  enquireBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.gold,
    alignItems: "center",
  },
  enquireText: {
    fontWeight: "700",
    fontSize: 14,
    color: Colors.textPrimary,
  },
});
