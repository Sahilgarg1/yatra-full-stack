import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/theme";

const ARTICLES = [
  { title: "Top 10 Winter Treks in India", tag: "Trekking", color: Colors.green },
  { title: "Rajasthan on a Budget", tag: "Budget", color: Colors.orange },
  { title: "Monsoon Escapes: Meghalaya", tag: "Monsoon", color: Colors.purple },
  { title: "Solo Travel: Northeast India", tag: "Solo", color: Colors.gold },
];

export default function ArticleCards() {
  return (
    <View style={styles.grid}>
      {ARTICLES.map((article, i) => (
        <View key={i} style={styles.card}>
          <View style={[styles.cardImage, { backgroundColor: article.color + "22" }]}>
            <Text style={[styles.cardEmoji, { color: article.color }]}>{"\u25A0"}</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={[styles.tag, { backgroundColor: article.color + "18" }]}>
              <Text style={[styles.tagText, { color: article.color }]}>{article.tag}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{article.title}</Text>
            <Text style={styles.comingSoon}>Coming soon</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: "hidden",
    flex: 1,
    minWidth: 150,
  },
  cardImage: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardBody: {
    padding: 12,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  comingSoon: {
    fontSize: 11,
    color: Colors.textLight,
    fontStyle: "italic",
  },
});
