import { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, TextInput, Pressable, FlatList, ScrollView, StyleSheet, SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchTrips, fetchFilterOptions } from "../api/trips";
import TripCard from "../components/TripCard";
import TripDetailModal from "../components/TripDetailModal";
import CompareDrawer from "../components/CompareDrawer";
import NavBar from "../components/NavBar";
import { Skeleton } from "../components/ui";
import { Colors, SORT_OPTIONS } from "../constants/theme";

export default function CompareScreen() {
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const numColumns = width >= 1024 ? 3 : width >= 600 ? 2 : 1;

  // Filters — initialize from URL params
  const [search, setSearch] = useState(params.q || "");
  const [hostFilter, setHostFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState(params.experience_type || "");
  const [sort, setSort] = useState("value_score");

  // Data
  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // UI state
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [detailTrip, setDetailTrip] = useState(null);
  const [sortPickerOpen, setSortPickerOpen] = useState(false);

  const searchTimer = useRef(null);

  // Load filter options once
  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  // Load trips
  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const reqParams = {
        sort,
        page,
        limit: 18,
        ...(search && { q: search }),
        ...(hostFilter && { host_type: hostFilter }),
        ...(typeFilter && { trip_type: typeFilter }),
      };
      const data = await fetchTrips(reqParams);
      setTrips(data.trips || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to load trips:", err);
    } finally {
      setLoading(false);
    }
  }, [search, hostFilter, typeFilter, sort, page]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(loadTrips, search ? 400 : 0);
    return () => clearTimeout(searchTimer.current);
  }, [loadTrips, search]);

  const toggleCompare = (trip) => {
    setSelectedTrips(prev => {
      const exists = prev.find(t => t.id === trip.id);
      if (exists) return prev.filter(t => t.id !== trip.id);
      if (prev.length >= 4) return prev;
      const next = [...prev, trip];
      if (next.length >= 2) setCompareOpen(true);
      return next;
    });
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tripTypes = filterOptions?.trip_types?.slice(0, 5).map(t => t.value) || [];
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || "Sort";

  const compareBadge = selectedTrips.length > 0 ? (
    <Pressable onPress={() => setCompareOpen(true)} style={styles.compareNavBtn}>
      <Text style={styles.compareNavText}>Compare</Text>
      <View style={styles.compareBadge}>
        <Text style={styles.compareBadgeText}>{selectedTrips.length}</Text>
      </View>
    </Pressable>
  ) : null;

  const renderTripCard = ({ item }) => (
    <TripCard
      trip={item}
      selected={!!selectedTrips.find(t => t.id === item.id)}
      wishlisted={wishlist.has(item.id)}
      onToggleCompare={toggleCompare}
      onToggleWishlist={toggleWishlist}
      onOpen={setDetailTrip}
    />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonGrid}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonCover} />
          <View style={styles.skeletonBody}>
            <Skeleton h={16} w="70%" />
            <Skeleton h={12} w="50%" />
            <Skeleton h={20} w="40%" />
            <Skeleton h={12} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{"\u25CE"}</Text>
      <Text style={styles.emptyTitle}>No trips found</Text>
      <Text style={styles.emptyText}>Try adjusting your filters</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar rightContent={compareBadge} />

      {/* Compact search bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>{"\u2315"}</Text>
          <TextInput
            value={search}
            onChangeText={v => { setSearch(v); setPage(1); }}
            placeholder="Search destination, region or trip..."
            placeholderTextColor={Colors.textLight}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Filters bar */}
      <View style={styles.filtersBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {/* Host type filters */}
          {[["", "All"], ["agency", "Agencies"], ["influencer", "Influencers"], ["local", "Local"]].map(([v, l]) => (
            <Pressable
              key={v}
              onPress={() => { setHostFilter(v); setPage(1); }}
              style={[styles.filterChip, hostFilter === v && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, hostFilter === v && styles.filterChipTextActive]}>{l}</Text>
            </Pressable>
          ))}

          <View style={styles.filterDivider} />

          {/* Trip type filters */}
          {["", ...tripTypes].map(v => (
            <Pressable
              key={v}
              onPress={() => { setTypeFilter(v); setPage(1); }}
              style={[styles.filterChip, typeFilter === v && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, typeFilter === v && styles.filterChipTextActive, { textTransform: "capitalize" }]}>
                {v || "All types"}
              </Text>
            </Pressable>
          ))}

          <View style={styles.filterDivider} />

          {/* Sort picker */}
          <Pressable onPress={() => setSortPickerOpen(!sortPickerOpen)} style={styles.filterChip}>
            <Text style={styles.filterChipText}>{currentSortLabel} {"\u25BE"}</Text>
          </Pressable>
        </ScrollView>

        {/* Sort dropdown */}
        {sortPickerOpen && (
          <View style={styles.sortDropdown}>
            {SORT_OPTIONS.map(o => (
              <Pressable
                key={o.value}
                onPress={() => { setSort(o.value); setSortPickerOpen(false); setPage(1); }}
                style={[styles.sortOption, sort === o.value && styles.sortOptionActive]}
              >
                <Text style={[styles.sortOptionText, sort === o.value && { fontWeight: "700" }]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Trip count */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>{pagination?.total ?? "..."} trips</Text>
      </View>

      {/* Trip grid */}
      {loading ? renderSkeleton() : trips.length === 0 ? renderEmpty() : (
        <FlatList
          key={`grid-${numColumns}`}
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          ListFooterComponent={
            pagination && pagination.total_pages > 1 ? (
              <View style={styles.paginationRow}>
                <Pressable
                  disabled={!pagination.has_prev}
                  onPress={() => setPage(p => p - 1)}
                  style={[styles.pageBtn, !pagination.has_prev && styles.pageBtnDisabled]}
                >
                  <Text style={styles.pageBtnText}>{"\u2190"} Prev</Text>
                </Pressable>
                <Text style={styles.pageInfo}>Page {pagination.page} of {pagination.total_pages}</Text>
                <Pressable
                  disabled={!pagination.has_next}
                  onPress={() => setPage(p => p + 1)}
                  style={[styles.pageBtn, !pagination.has_next && styles.pageBtnDisabled]}
                >
                  <Text style={styles.pageBtnText}>Next {"\u2192"}</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}

      {/* Compare drawer */}
      {compareOpen && selectedTrips.length >= 2 && (
        <CompareDrawer
          trips={selectedTrips}
          onClose={() => setCompareOpen(false)}
          onRemove={trip => setSelectedTrips(prev => prev.filter(t => t.id !== trip.id))}
        />
      )}

      {/* Detail modal */}
      {detailTrip && (
        <TripDetailModal
          trip={detailTrip}
          onClose={() => setDetailTrip(null)}
          onToggleCompare={toggleCompare}
          onToggleWishlist={toggleWishlist}
          isSelected={!!selectedTrips.find(t => t.id === detailTrip.id)}
          isWishlisted={wishlist.has(detailTrip.id)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  // Compare nav button
  compareNavBtn: {
    backgroundColor: Colors.gold,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compareNavText: {
    color: Colors.darkGreen,
    fontWeight: "700",
    fontSize: 12,
  },
  compareBadge: {
    backgroundColor: Colors.darkGreen,
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  compareBadgeText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "700",
  },
  // Search bar
  searchBar: {
    backgroundColor: Colors.darkGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.midGreen,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: Colors.textLight,
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: Colors.cream,
    fontSize: 14,
  },
  // Filters
  filtersBar: {
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  filtersScroll: {
    paddingHorizontal: 12,
    gap: 6,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: "white",
  },
  filterChipActive: {
    borderColor: Colors.darkGreen,
    backgroundColor: Colors.darkGreen,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.cream,
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
  sortDropdown: {
    position: "absolute",
    top: 44,
    right: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 4,
    zIndex: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sortOptionActive: {
    backgroundColor: Colors.beige,
  },
  sortOptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Count
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  countText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  // Grid
  grid: {
    paddingHorizontal: 6,
    paddingBottom: 40,
  },
  // Skeleton
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 6,
    paddingTop: 8,
  },
  skeletonCard: {
    flex: 1,
    minWidth: "45%",
    margin: 6,
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  skeletonCover: {
    height: 130,
    backgroundColor: Colors.border,
  },
  skeletonBody: {
    padding: 14,
    gap: 8,
  },
  // Empty
  empty: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 32,
    color: Colors.textLight,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  // Pagination
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 20,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "white",
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  pageInfo: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
