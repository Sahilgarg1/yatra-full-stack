import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/theme";

export default function NavBar({ rightContent }) {
  const router = useRouter();

  return (
    <View style={styles.nav}>
      <Pressable onPress={() => router.push("/")} style={styles.navLeft}>
        <Text style={styles.navIcon}>{"\u25C8"}</Text>
        <Text style={styles.navTitle}>yatra</Text>
        <Text style={styles.navSub}>discover india</Text>
      </Pressable>
      <View style={styles.navRight}>
        {rightContent}
        <Pressable onPress={() => router.push("/copilot")} style={styles.copilotLink}>
          <Text style={styles.copilotText}>Get a co-pilot</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: Colors.darkGreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 48,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navIcon: {
    color: Colors.gold,
    fontSize: 18,
  },
  navTitle: {
    color: Colors.cream,
    fontWeight: "700",
    fontSize: 17,
  },
  navSub: {
    color: Colors.green,
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 2,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copilotLink: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  copilotText: {
    color: Colors.gold,
    fontWeight: "600",
    fontSize: 12,
  },
});
