import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors, TRAVELER_TYPES, EXPERIENCE_TYPES } from "../constants/theme";

export default function HeroSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelerType, setTravelerType] = useState("");
  const [experienceType, setExperienceType] = useState("");

  const handleSearch = () => {
    const params = {};
    if (destination) params.q = destination;
    if (date) params.date = date;
    if (travelerType) params.traveler_type = travelerType;
    if (experienceType) params.experience_type = experienceType;
    router.push({ pathname: "/compare", params });
  };

  return (
    <View style={styles.container}>
      {/* Destination */}
      <View style={styles.inputBox}>
        <Text style={styles.inputIcon}>{"\u2315"}</Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="Where do you want to go?"
          placeholderTextColor={Colors.textLight}
          style={styles.textInput}
        />
      </View>

      {/* Date */}
      <View style={styles.inputBox}>
        <Text style={styles.inputIcon}>{"\u25CB"}</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="When? (e.g. July 2026)"
          placeholderTextColor={Colors.textLight}
          style={styles.textInput}
        />
      </View>

      {/* Traveler type */}
      <Text style={styles.chipLabel}>Traveler type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {TRAVELER_TYPES.map(type => (
          <Pressable
            key={type}
            onPress={() => setTravelerType(travelerType === type ? "" : type)}
            style={[styles.chip, travelerType === type && styles.chipActive]}
          >
            <Text style={[styles.chipText, travelerType === type && styles.chipTextActive]}>{type}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Experience type */}
      <Text style={styles.chipLabel}>Experience</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {EXPERIENCE_TYPES.map(type => (
          <Pressable
            key={type}
            onPress={() => setExperienceType(experienceType === type ? "" : type)}
            style={[styles.chip, experienceType === type && styles.chipActive]}
          >
            <Text style={[styles.chipText, experienceType === type && styles.chipTextActive]}>{type}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Search button */}
      <Pressable onPress={handleSearch} style={styles.searchBtn}>
        <Text style={styles.searchBtnText}>Search trips {"\u2192"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.midGreen,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  inputIcon: {
    color: Colors.textLight,
    fontSize: 16,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    color: Colors.cream,
    fontSize: 14,
  },
  chipLabel: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 6,
  },
  chipRow: {
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  chipText: {
    color: Colors.cream,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: Colors.darkGreen,
    fontWeight: "700",
  },
  searchBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  searchBtnText: {
    color: Colors.darkGreen,
    fontWeight: "700",
    fontSize: 16,
  },
});
