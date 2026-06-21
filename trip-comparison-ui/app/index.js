import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { fetchFilterOptions } from "../api/trips";
import NavBar from "../components/NavBar";
import HeroSearch from "../components/HeroSearch";
import ArticleCards from "../components/ArticleCard";
import { Colors } from "../constants/theme";

const QUICK_REGIONS = [
  "Himachal Pradesh", "Uttarakhand", "Rajasthan", "Kerala", "Ladakh", "Meghalaya",
];

export default function HomeScreen() {
  const router = useRouter();
  const [regions, setRegions] = useState(QUICK_REGIONS);

  useEffect(() => {
    fetchFilterOptions()
      .then(opts => {
        if (opts?.regions?.length > 0) {
          setRegions(opts.regions.slice(0, 8).map(r => r.value));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Find your next{" "}
            <Text style={{ color: Colors.gold }}>group trip</Text>
            {"\n"}across India.
          </Text>
          <Text style={styles.heroSub}>
            Agencies, influencers & local guides — compared in one place.
          </Text>

          <HeroSearch />

          {/* Quick region chips */}
          <View style={styles.quickSection}>
            <Text style={styles.quickLabel}>Popular destinations</Text>
            <View style={styles.quickChips}>
              {regions.map(region => (
                <Pressable
                  key={region}
                  onPress={() => router.push({ pathname: "/compare", params: { q: region } })}
                  style={styles.quickChip}
                >
                  <Text style={styles.quickChipText}>{region}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Articles section */}
        <View style={styles.articles}>
          <Text style={styles.articlesTitle}>Discover India</Text>
          <Text style={styles.articlesSub}>Curated stories and travel guides</Text>
          <ArticleCards />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Hero
  hero: {
    backgroundColor: Colors.darkGreen,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
  },
  heroTitle: {
    color: Colors.cream,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSub: {
    color: Colors.textLight,
    fontSize: 15,
    lineHeight: 22,
  },
  // Quick picks
  quickSection: {
    marginTop: 24,
  },
  quickLabel: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 10,
  },
  quickChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  quickChipText: {
    color: Colors.cream,
    fontSize: 13,
    fontWeight: "500",
  },
  // Articles
  articles: {
    paddingTop: 28,
    paddingBottom: 20,
  },
  articlesTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  articlesSub: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
