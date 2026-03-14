import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = ['Electronics', 'Cars', 'Home', 'Fashion', 'Sports', 'Kids', 'Jobs', 'Other'];
const CONDITIONS = [
  { key: 'new', label: 'New' },
  { key: 'like_new', label: 'Like new' },
  { key: 'good', label: 'Good' },
  { key: 'fair', label: 'Fair' },
];
const DELIVERY = [
  { key: 'meetup', label: 'Meet up' },
  { key: 'shipping', label: 'Shipping' },
];

export default function SellScreen() {
  const isDark = useColorScheme() === 'dark';
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [delivery, setDelivery] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const bg = isDark ? '#000000' : '#F9FAFB';
  const headerBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? '#8E8E93' : '#6B7280';
  const inputBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#3A3A3C' : '#E5E7EB';
  const sectionBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const photoBg = isDark ? '#2C2C2E' : '#F3F4F6';

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map(a => a.uri);
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 8));
    }
  }

  function toggleDelivery(key: string) {
    setDelivery(prev =>
      prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]
    );
  }

  function handlePost() {
    if (!title || !price || !category) {
      Alert.alert('Missing info', 'Please fill in title, price, and category.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Posted!', 'Your listing has been published.', [
      { text: 'OK', onPress: () => router.push('/(tabs)/home') },
    ]);
  }

  const canPost = title.length > 0 && price.length > 0 && category.length > 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Create listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photos */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionLabel, { color: textColor }]}>Photos</Text>
          <Text style={[styles.sectionSub, { color: subColor }]}>
            Add up to 8 photos. First photo is the cover.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosRow}
          >
            {photos.map((uri, i) => (
              <View key={i} style={[styles.photoSlot, { backgroundColor: '#2563EB' }]}>
                <Ionicons name="image" size={24} color="rgba(255,255,255,0.8)" />
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 8 && (
              <TouchableOpacity
                style={[styles.photoSlot, styles.addPhotoBtn, { backgroundColor: photoBg, borderColor }]}
                onPress={pickImage}
              >
                <Ionicons name="camera-outline" size={28} color="#2563EB" />
                <Text style={styles.addPhotoText}>Add photo</Text>
              </TouchableOpacity>
            )}
            {Array.from({ length: Math.max(0, 3 - photos.length - 1) }).map((_, i) => (
              <TouchableOpacity
                key={`empty-${i}`}
                style={[styles.photoSlot, { backgroundColor: photoBg, borderColor, borderStyle: 'dashed' }]}
                onPress={pickImage}
              >
                <Ionicons name="add" size={24} color={subColor} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.label, { color: textColor }]}>Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
            placeholder="e.g. iPhone 14 Pro 256GB"
            placeholderTextColor={subColor}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
        </View>

        {/* Category */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.label, { color: textColor }]}>Category *</Text>
          <TouchableOpacity
            style={[styles.input, styles.picker, { backgroundColor: inputBg, borderColor }]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={{ color: category ? textColor : subColor, fontSize: 15 }}>
              {category || 'Select category'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={subColor} />
          </TouchableOpacity>
        </View>

        {/* Price */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.label, { color: textColor }]}>Price *</Text>
          <View style={[styles.priceRow, { backgroundColor: inputBg, borderColor }]}>
            <TextInput
              style={[styles.priceInput, { color: textColor }]}
              placeholder="0"
              placeholderTextColor={subColor}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <Text style={[styles.currency, { color: subColor }]}>so'm</Text>
          </View>
        </View>

        {/* Condition */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.label, { color: textColor }]}>Condition</Text>
          <View style={styles.chips}>
            {CONDITIONS.map(c => (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: condition === c.key ? '#2563EB' : inputBg,
                    borderColor: condition === c.key ? '#2563EB' : borderColor,
                  },
                ]}
                onPress={() => setCondition(c.key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: condition === c.key ? '#FFFFFF' : textColor },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.label, { color: textColor }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              { backgroundColor: inputBg, borderColor, color: textColor },
            ]}
            placeholder="Describe your item — condition, history, what's included..."
            placeholderTextColor={subColor}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Delivery */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.label, { color: textColor }]}>Delivery options</Text>
          <View style={styles.chips}>
            {DELIVERY.map(d => (
              <TouchableOpacity
                key={d.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: delivery.includes(d.key) ? '#2563EB' : inputBg,
                    borderColor: delivery.includes(d.key) ? '#2563EB' : borderColor,
                  },
                ]}
                onPress={() => toggleDelivery(d.key)}
              >
                <Ionicons
                  name={d.key === 'meetup' ? 'people-outline' : 'cube-outline'}
                  size={14}
                  color={delivery.includes(d.key) ? '#FFFFFF' : '#2563EB'}
                />
                <Text
                  style={[
                    styles.chipText,
                    { color: delivery.includes(d.key) ? '#FFFFFF' : textColor },
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.label, { color: textColor }]}>Location</Text>
          <TouchableOpacity
            style={[styles.input, styles.picker, { backgroundColor: inputBg, borderColor }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="location-outline" size={16} color="#2563EB" />
              <Text style={{ color: textColor, fontSize: 15 }}>Tashkent</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={subColor} />
          </TouchableOpacity>
        </View>

        {/* Post button */}
        <View style={styles.postWrap}>
          <TouchableOpacity
            style={[styles.postBtn, { opacity: canPost ? 1 : 0.5 }]}
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.postGrad}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.postText}>Post listing</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: borderColor }]}
                  onPress={() => { setCategory(item); setShowCategoryModal(false); }}
                >
                  <Text style={[styles.modalItemText, { color: textColor }]}>{item}</Text>
                  {category === item && (
                    <Ionicons name="checkmark" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scroll: { paddingBottom: 40 },
  section: { marginTop: 8, padding: 16, gap: 10 },
  sectionLabel: { fontSize: 16, fontWeight: '700' },
  sectionSub: { fontSize: 13 },
  label: { fontSize: 14, fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textarea: { minHeight: 110 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  priceInput: { flex: 1, fontSize: 20, fontWeight: '600', paddingVertical: 12 },
  currency: { fontSize: 15, fontWeight: '500', marginLeft: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 14, fontWeight: '500' },
  photosRow: { gap: 10, paddingVertical: 4 },
  photoSlot: {
    width: 90,
    height: 90,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  addPhotoBtn: { gap: 4 },
  addPhotoText: { fontSize: 10, color: '#2563EB', fontWeight: '500' },
  removePhoto: { position: 'absolute', top: 2, right: 2 },
  postWrap: { paddingHorizontal: 16, marginTop: 8 },
  postBtn: { borderRadius: 14, overflow: 'hidden' },
  postGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  postText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalItemText: { fontSize: 16 },
});
