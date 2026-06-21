import { View, Text, Pressable, ImageBackground, StyleSheet } from "react-native";
import { ValueMeter, HostBadge, IncPill } from "./ui";
import { Colors, DiffColors, formatINR } from "../constants/theme";

export default function TripCard({ trip, selected, wishlisted, onToggleCompare, onToggleWishlist, onOpen }) {
  if (!trip) return null;

  const ppd = trip.price?.amount ? Math.round(trip.price.amount / trip.duration_days) : null;
  const nd = trip.departure_dates?.[0];
  const daysUntil = nd ? Math.ceil((new Date(nd) - new Date()) / 86400000) : null;

  const coverContent = (
    <View style={styles.coverInner}>
      <View>
        <Text style={styles.coverRegion}>{trip.region}</Text>
        <Text style={styles.coverDest}>{trip.destination}</Text>
      </View>
      {/* Duration badge */}
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{trip.duration_days}D</Text>
      </View>
      {/* Wishlist */}
      <Pressable onPress={() => onToggleWishlist(trip.id)} style={styles.wishlistBtn} hitSlop={8}>
        <Text style={{ color: wishlisted ? Colors.redLight : "rgba(255,255,255,0.7)", fontSize: 18 }}>
          {wishlisted ? "\u2665" : "\u2661"}
        </Text>
      </Pressable>
      {/* Compare toggle */}
      <Pressable onPress={() => onToggleCompare(trip)} style={[styles.compareBtn, selected && styles.compareBtnSelected]} hitSlop={8}>
        <Text style={{ color: selected ? Colors.darkGreen : "white", fontWeight: "700", fontSize: 13 }}>
          {selected ? "\u2713" : "+"}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <Pressable onPress={() => onOpen(trip)} style={[styles.card, selected && styles.cardSelected]}>
      {trip.cover_image_url ? (
        <ImageBackground source={{ uri: trip.cover_image_url }} style={styles.cover} imageStyle={styles.coverImage}>
          <View style={styles.coverOverlay}>{coverContent}</View>
        </ImageBackground>
      ) : (
        <View style={[styles.cover, styles.coverFallback]}>{coverContent}</View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{trip.title}</Text>
        <View style={styles.hostRow}>
          <Text style={styles.hostName}>{trip.host?.name}</Text>
          <HostBadge host={trip.host} />
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>{formatINR(trip.price?.amount)}</Text>
            {ppd && <Text style={styles.ppd}>{formatINR(ppd)}/day</Text>}
          </View>
          <View style={{ alignItems: "center", gap: 1 }}>
            <ValueMeter score={trip.scores?.value} size={44} />
            <Text style={styles.valueLabel}>VALUE</Text>
          </View>
        </View>

        <View style={styles.inclusions}>
          {["stay", "meals", "transport", "guide"].map(item => (
            <IncPill key={item} label={item} included={trip.price?.includes?.some(i => i.toLowerCase().includes(item))} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {daysUntil && daysUntil > 0
              ? `${daysUntil}d away`
              : `${trip.departure_dates?.length || 0} date${trip.departure_dates?.length !== 1 ? "s" : ""}`}
          </Text>
          <Text style={[styles.difficulty, { color: DiffColors[trip.difficulty_level] || "#888" }]}>
            {trip.difficulty_level}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: "hidden",
    flex: 1,
    margin: 6,
  },
  cardSelected: {
    borderColor: Colors.gold,
    borderWidth: 2,
  },
  cover: {
    height: 130,
  },
  coverImage: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  coverOverlay: {
    flex: 1,
    backgroundColor: "rgba(26,43,31,0.55)",
  },
  coverFallback: {
    backgroundColor: Colors.darkGreen,
  },
  coverInner: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  coverRegion: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  coverDest: {
    color: Colors.cream,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  durationBadge: {
    position: "absolute",
    top: 10,
    left: 12,
    backgroundColor: "rgba(26,43,31,0.65)",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  durationText: {
    color: Colors.cream,
    fontSize: 10,
    fontWeight: "600",
  },
  wishlistBtn: {
    position: "absolute",
    top: 8,
    right: 40,
  },
  compareBtn: {
    position: "absolute",
    top: 8,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  compareBtnSelected: {
    backgroundColor: Colors.gold,
  },
  body: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  hostName: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  ppd: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  valueLabel: {
    fontSize: 9,
    color: Colors.textLight,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  inclusions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: Colors.beigeLight,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textLight,
  },
  difficulty: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
