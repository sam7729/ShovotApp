import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ListingCard from '../../components/ListingCard';
import { mockListings } from '../../data/mockData';
import { Listing } from '../../types';

const POPULAR_CATEGORIES = [
  { label: 'Electronics', icon: '📱' },
  { label: 'Cars', icon: '🚗' },
  { label: 'Home', icon: '🏠' },
  { label: 'Fashion', icon: '👕' },
  { label: 'Sports', icon: '⚽' },
  { label: 'Kids', icon: '🧸' },
];

const RECENT_SEARCHES = ['iPhone 14', 'MacBook', 'Nike shoes', 'PS5'];

export default function SearchScreen() {
  const isDark = useColorScheme() === 'dark';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Listing[]>([]);
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const inputRef = useRef<TextInput>(null);

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const inputBg = isDark ? '#2C2C2E' : '#F3F4F6';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const dividerColor = isDark ? '#2C2C2E' : '#F3F4F6';

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  function handleSearch(text: string) {
    setQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
      return;
    }
    const filtered = mockListings.filter(
      l =>
        l.title.toLowerCase().includes(text.toLowerCase()) ||
        l.category.toLowerCase().includes(text.toLowerCase()) ||
        l.description.toLowerCase().includes(text.toLowerCase())
    );
    setResults(filtered);
  }

  function handleRecentTap(term: string) {
    setQuery(term);
    handleSearch(term);
  }

  function handleCategoryTap(label: string) {
    setQuery(label);
    handleSearch(label);
  }

  function handleSubmit() {
    if (query.trim()) {
      setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 6));
      Keyboard.dismiss();
    }
  }

  const renderItem = ({ item }: { item: Listing }) => (
    <View style={styles.cardWrap}>
      <ListingCard listing={item} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: headerBg }]}>
      {/* Search header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
          <Ionicons name="search-outline" size={18} color={subColor} style={{ marginRight: 8 }} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: textColor }]}
            placeholder="Search items, brands..."
            placeholderTextColor={subColor}
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Ionicons name="close-circle" size={18} color={subColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={null}
          style={{ backgroundColor: bg }}
          ListHeaderComponent={
            <View style={{ backgroundColor: bg }}>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Recent searches</Text>
                    <TouchableOpacity onPress={() => setRecentSearches([])}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  {recentSearches.map((term, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.recentItem, { borderBottomColor: dividerColor }]}
                      onPress={() => handleRecentTap(term)}
                    >
                      <Ionicons name="time-outline" size={16} color={subColor} />
                      <Text style={[styles.recentText, { color: textColor }]}>{term}</Text>
                      <Ionicons name="arrow-up-outline" size={16} color={subColor} style={{ transform: [{ rotate: '45deg' }] }} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Popular categories */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Popular categories</Text>
                <View style={styles.catGrid}>
                  {POPULAR_CATEGORIES.map(c => (
                    <TouchableOpacity
                      key={c.label}
                      style={[styles.catCard, { backgroundColor: cardBg }]}
                      onPress={() => handleCategoryTap(c.label)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.catEmoji}>{c.icon}</Text>
                      <Text style={[styles.catLabel, { color: textColor }]}>{c.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
        />
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { backgroundColor: bg }]}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <Text style={[styles.resultsLabel, { color: subColor }]}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={subColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No results found</Text>
              <Text style={[styles.emptyText, { color: subColor }]}>
                Try different keywords or browse categories
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 15 },
  section: { padding: 16, paddingBottom: 0 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  clearText: { fontSize: 14, color: '#2563EB', fontWeight: '500' },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  recentText: { flex: 1, fontSize: 15 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  catEmoji: { fontSize: 28 },
  catLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
  list: { paddingBottom: 100 },
  row: { paddingHorizontal: 16, gap: 16, marginBottom: 16 },
  cardWrap: {},
  resultsLabel: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '600' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
