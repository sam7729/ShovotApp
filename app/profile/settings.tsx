import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
];

export default function SettingsScreen() {
  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';

  const [darkMode, setDarkMode] = useState(isDark);
  const [language, setLanguage] = useState('en');
  const [showLanguages, setShowLanguages] = useState(false);

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#F3F4F6';

  useEffect(() => {
    AsyncStorage.getItem('@shovot_language').then(val => {
      if (val) setLanguage(val);
    });
    AsyncStorage.getItem('@shovot_dark_mode').then(val => {
      if (val !== null) setDarkMode(val === 'true');
    });
  }, []);

  async function toggleDarkMode(value: boolean) {
    setDarkMode(value);
    await AsyncStorage.setItem('@shovot_dark_mode', String(value));
    Alert.alert(
      'Theme Changed',
      `${value ? 'Dark' : 'Light'} mode will take full effect the next time you restart the app.`
    );
  }

  async function selectLanguage(code: string) {
    setLanguage(code);
    await AsyncStorage.setItem('@shovot_language', code);
    setShowLanguages(false);
    Alert.alert(
      'Language Changed',
      'Language preference saved. Full translation support coming soon!'
    );
  }

  const currentLang = LANGUAGES.find(l => l.code === language)?.label || 'English';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: subColor }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={[styles.row, { borderBottomColor: borderColor }]}>
            <View style={[styles.iconWrap, { backgroundColor: '#1C1C1E' }]}>
              <Ionicons name="moon" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.rowLabel, { color: textColor }]}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Language Section */}
        <Text style={[styles.sectionTitle, { color: subColor }]}>LANGUAGE</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowLanguages(!showLanguages)}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="language" size={18} color="#2563EB" />
            </View>
            <Text style={[styles.rowLabel, { color: textColor }]}>Language</Text>
            <Text style={[styles.rowValue, { color: subColor }]}>{currentLang}</Text>
            <Ionicons
              name={showLanguages ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={subColor}
            />
          </TouchableOpacity>

          {showLanguages && (
            <View style={{ paddingLeft: 52 }}>
              {LANGUAGES.map((lang, i) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langItem,
                    i < LANGUAGES.length - 1 && { borderBottomColor: borderColor, borderBottomWidth: 1 },
                  ]}
                  onPress={() => selectLanguage(lang.code)}
                >
                  <Text style={[styles.langText, { color: textColor }]}>{lang.label}</Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: subColor }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="information-circle" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.rowLabel, { color: textColor }]}>Version</Text>
            <Text style={[styles.rowValue, { color: subColor }]}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
  },
  langText: { fontSize: 15 },
});
