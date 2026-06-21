import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView, Linking } from "react-native";
import NavBar from "../components/NavBar";
import { Colors, COPILOT_FEATURES } from "../constants/theme";

const STEPS = [
  { num: "1", title: "Tell us where", desc: "Share your destination, dates, and travel style." },
  { num: "2", title: "We plan it", desc: "Get a personalised itinerary with local insights." },
  { num: "3", title: "Travel easy", desc: "WhatsApp support throughout your trip." },
];

export default function CopilotScreen() {
  const handleCTA = () => {
    Linking.openURL("https://wa.me/919876543210?text=Hi!%20I'm%20interested%20in%20the%20Guardian%20Angel%20co-pilot%20service.");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>GUARDIAN ANGEL</Text>
          <Text style={styles.heroTitle}>
            Your personal{"\n"}
            <Text style={{ color: Colors.gold }}>travel co-pilot</Text>
          </Text>
          <Text style={styles.heroSub}>
            A real human who knows India inside out — on WhatsApp, whenever you need them.
          </Text>
        </View>

        {/* Pricing card */}
        <View style={styles.pricingCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$29</Text>
            <Text style={styles.priceNote}>one-time payment</Text>
          </View>
          <View style={styles.featureList}>
            {COPILOT_FEATURES.map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.checkmark}>{"\u2713"}</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={handleCTA} style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Get started on WhatsApp</Text>
          </Pressable>
        </View>

        {/* How it works */}
        <View style={styles.howSection}>
          <Text style={styles.howTitle}>How it works</Text>
          <View style={styles.stepsContainer}>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{step.num}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <Text style={styles.bottomCtaTitle}>Ready to travel stress-free?</Text>
          <Pressable onPress={handleCTA} style={styles.ctaBtnWhatsapp}>
            <Text style={styles.ctaBtnWhatsappText}>Chat on WhatsApp</Text>
          </Pressable>
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
    paddingTop: 40,
    paddingBottom: 36,
  },
  heroLabel: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroTitle: {
    color: Colors.cream,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSub: {
    color: Colors.textLight,
    fontSize: 16,
    lineHeight: 24,
  },
  // Pricing card
  pricingCard: {
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 20,
  },
  price: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  priceNote: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkmark: {
    color: Colors.green,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 1,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaBtnText: {
    color: Colors.darkGreen,
    fontWeight: "700",
    fontSize: 16,
  },
  // How it works
  howSection: {
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  howTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 20,
  },
  stepNum: {
    backgroundColor: Colors.darkGreen,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  stepNumText: {
    color: Colors.gold,
    fontWeight: "700",
    fontSize: 14,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  // Bottom CTA
  bottomCta: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  bottomCtaTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  ctaBtnWhatsapp: {
    backgroundColor: Colors.whatsapp,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  ctaBtnWhatsappText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
