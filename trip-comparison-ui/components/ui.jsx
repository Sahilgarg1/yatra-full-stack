import { View, Text, Animated, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import Svg, { Circle } from "react-native-svg";
import { Colors, HostColors, HostLabels } from "../constants/theme";

export function ValueMeter({ score, size = 44 }) {
  if (!score) return null;
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color = score >= 80 ? Colors.green : score >= 60 ? Colors.orange : Colors.red;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={Colors.border} strokeWidth={3.5} />
        <Circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3.5}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.meterLabel]}>
        <Text style={[styles.meterText, { fontSize: Math.round(size * 0.28) }]}>{score}</Text>
      </View>
    </View>
  );
}

export function HostBadge({ host }) {
  const col = HostColors[host?.type] || "#888";
  return (
    <View style={[styles.badge, { backgroundColor: col + "18" }]}>
      <Text style={[styles.badgeText, { color: col }]}>
        {host?.verified ? "\u2713 " : ""}{HostLabels[host?.type] || "Unknown"}
      </Text>
    </View>
  );
}

export function IncPill({ label, included }) {
  return (
    <View style={[styles.pill, { backgroundColor: included ? "#4A7C5914" : "#B9404014" }]}>
      <Text style={[styles.pillText, { color: included ? Colors.green : Colors.red }]}>
        {included ? "\u2713" : "\u2717"} {label}
      </Text>
    </View>
  );
}

export function Skeleton({ h = 20, w = "100%", r = 6 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.beigeLight],
  });

  return <Animated.View style={{ height: h, width: w, borderRadius: r, backgroundColor: bg }} />;
}

const styles = StyleSheet.create({
  meterLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  meterText: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
