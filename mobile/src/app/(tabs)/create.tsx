import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

import { AppScreen } from '@/components/app-screen';
import { PageHeader } from '@/components/page-header';
import { colors, radii, spacing, typeScale } from '@/constants/theme';
import type { DietaryTag, FoodDrop } from '@/domain/types';
import { foodDropHostService, listMyFoodDrops } from '@/features/food-drops/food-drop-service';

const DEFAULT_PIN = { latitude: 1.2966, longitude: 103.7764 };
const DIETARY_OPTIONS: { label: string; value: DietaryTag }[] = [
  { label: 'Halal', value: 'halal' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Contains pork', value: 'contains_pork' },
  { label: 'Unknown', value: 'unknown' },
];

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
};

function Field({ label, multiline, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        placeholderTextColor={colors.tabInactive}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('10');
  const [venueName, setVenueName] = useState('');
  const [buildingCode, setBuildingCode] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [deadlineMinutes, setDeadlineMinutes] = useState(60);
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);
  const [allergenNote, setAllergenNote] = useState('');
  const [pin, setPin] = useState(DEFAULT_PIN);
  const [pinConfirmed, setPinConfirmed] = useState(false);
  const [surplusConfirmed, setSurplusConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [myDrops, setMyDrops] = useState<FoodDrop[]>([]);
  const [listError, setListError] = useState<string | null>(null);

  const loadMyDrops = useCallback(async () => {
    try {
      setListError(null);
      setMyDrops(await listMyFoodDrops());
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Could not load your FoodDrops.');
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadMyDrops(); }, [loadMyDrops]));

  const manageableDrops = useMemo(
    () => myDrops.filter((drop) => drop.status === 'active' || drop.status === 'draft'),
    [myDrops],
  );

  const choosePhoto = async (camera: boolean) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', `Allow ${camera ? 'camera' : 'photo'} access to add a current food photo.`);
      return;
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const openPhotoChoice = () => {
    Alert.alert('Add current food photo', 'Show rescuers exactly what is available now.', [
      { text: 'Take photo', onPress: () => void choosePhoto(true) },
      { text: 'Choose photo', onPress: () => void choosePhoto(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const selectCurrentLocation = async () => {
    try {
      setLocating(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Location not shared', 'You can still tap the map to place the pickup pin manually.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setPin({ latitude: current.coords.latitude, longitude: current.coords.longitude });
      setPinConfirmed(true);
    } catch (error) {
      Alert.alert('Location unavailable', error instanceof Error ? error.message : 'Tap the map to place the pin manually.');
    } finally {
      setLocating(false);
    }
  };

  const onMapPress = (event: MapPressEvent) => {
    setPin(event.nativeEvent.coordinate);
    setPinConfirmed(true);
  };

  const toggleDietaryTag = (tag: DietaryTag) => {
    setDietaryTags((current) => {
      if (tag === 'unknown') return current.includes('unknown') ? [] : ['unknown'];
      const withoutUnknown = current.filter((item) => item !== 'unknown');
      return withoutUnknown.includes(tag)
        ? withoutUnknown.filter((item) => item !== tag)
        : [...withoutUnknown, tag];
    });
  };

  const publish = async () => {
    const parsedStock = Number(stock);
    const missing = [
      !photoUri && 'a current food photo',
      title.trim().length < 2 && 'a title',
      (!Number.isInteger(parsedStock) || parsedStock <= 0) && 'a positive whole-number stock',
      venueName.trim().length < 2 && 'a venue',
      !pinConfirmed && 'a confirmed pickup pin',
      !allergenNote.trim() && 'allergen information (or “Unknown”)',
      !surplusConfirmed && 'the unserved-surplus confirmation',
    ].filter(Boolean);

    if (missing.length) {
      Alert.alert('Finish this FoodDrop', `Please add ${missing.join(', ')}.`);
      return;
    }

    let createdDraft: FoodDrop | null = null;
    try {
      setSubmitting(true);
      createdDraft = await foodDropHostService.createDraft({
        title: title.trim(),
        description: description.trim() || null,
        localPhotoUri: photoUri!,
        initialStock: parsedStock,
        venueName: venueName.trim(),
        buildingCode: buildingCode.trim() || null,
        latitude: pin.latitude,
        longitude: pin.longitude,
        pickupInstructions: pickupInstructions.trim() || null,
        pickupDeadline: new Date(Date.now() + deadlineMinutes * 60_000).toISOString(),
        dietaryTags,
        allergenNote: allergenNote.trim(),
        confirmsUnservedSurplus: true,
      });
      const published = await foodDropHostService.publish(createdDraft.id);
      router.push({ pathname: '/host/food-drop/[id]', params: { id: published.id } });
    } catch (error) {
      if (createdDraft) {
        router.push({ pathname: '/host/food-drop/[id]', params: { id: createdDraft.id } });
      }
      Alert.alert('Could not publish', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppScreen>
      <PageHeader
        eyebrow="Host a rescue"
        title="Launch a FoodDrop"
        description="Post safe surplus food in about a minute, then display its QR at pickup."
      />

      {manageableDrops.length ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your FoodDrops</Text>
          {manageableDrops.map((drop) => (
            <Pressable key={drop.id} onPress={() => router.push({ pathname: '/host/food-drop/[id]', params: { id: drop.id } })} style={styles.dropRow}>
              <View style={styles.dropRowCopy}>
                <Text style={styles.dropTitle}>{drop.title}</Text>
                <Text style={styles.helper}>{drop.remainingStock} portions · {drop.venueName} · {drop.status}</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {listError ? <Text style={styles.error}>{listError}</Text> : null}

      <View style={styles.sectionCard}>
        <Text style={styles.step}>1 · SHOW THE FOOD</Text>
        <Pressable onPress={openPhotoChoice} style={styles.photoPicker}>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : (
            <View style={styles.photoEmpty}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoTitle}>Take or choose a current photo</Text>
              <Text style={styles.helper}>Required · JPG, PNG or WebP · up to 5 MB</Text>
            </View>
          )}
        </Pressable>
        {photoUri ? <Pressable onPress={openPhotoChoice}><Text style={styles.textAction}>Replace photo</Text></Pressable> : null}
        <Field label="FoodDrop title *" value={title} onChangeText={setTitle} placeholder="e.g. Vegetarian bento boxes" />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="What is included?" multiline />
        <Field label="Portions available *" value={stock} onChangeText={setStock} placeholder="10" keyboardType="number-pad" />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.step}>2 · SET PICKUP</Text>
        <Field label="Venue name *" value={venueName} onChangeText={setVenueName} placeholder="e.g. UTown Auditorium foyer" />
        <Field label="Building code" value={buildingCode} onChangeText={setBuildingCode} placeholder="e.g. ERC" />
        <Field label="Pickup instructions" value={pickupInstructions} onChangeText={setPickupInstructions} placeholder="Look for the PorsiPas QR beside reception" multiline />
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Pickup pin *</Text>
            <Pressable disabled={locating} onPress={() => void selectCurrentLocation()}>
              <Text style={styles.textAction}>{locating ? 'Finding you…' : 'Use my location'}</Text>
            </Pressable>
          </View>
          <MapView
            initialRegion={{ ...DEFAULT_PIN, latitudeDelta: 0.018, longitudeDelta: 0.018 }}
            onPress={onMapPress}
            region={{ ...pin, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
            style={styles.map}>
            <Marker coordinate={pin} title="FoodDrop pickup" />
          </MapView>
          <Text style={[styles.helper, pinConfirmed && styles.confirmed]}>
            {pinConfirmed ? '✓ Pickup pin confirmed' : 'Tap the map or use your location to confirm the pin.'}
          </Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Collection closes in *</Text>
          <View style={styles.chipRow}>
            {[30, 60, 120, 180].map((minutes) => (
              <Pressable key={minutes} onPress={() => setDeadlineMinutes(minutes)} style={[styles.chip, deadlineMinutes === minutes && styles.chipSelected]}>
                <Text style={[styles.chipText, deadlineMinutes === minutes && styles.chipTextSelected]}>
                  {minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.step}>3 · SAFETY CHECK</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Dietary information</Text>
          <View style={styles.chipRow}>
            {DIETARY_OPTIONS.map((option) => {
              const selected = dietaryTags.includes(option.value);
              return (
                <Pressable key={option.value} onPress={() => toggleDietaryTag(option.value)} style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Field label="Allergens *" value={allergenNote} onChangeText={setAllergenNote} placeholder="List known allergens, or enter Unknown" multiline />
        <Pressable onPress={() => setSurplusConfirmed((value) => !value)} style={styles.confirmRow}>
          <View style={[styles.checkbox, surplusConfirmed && styles.checkboxChecked]}>
            {surplusConfirmed ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.confirmText}>I confirm this is safe, unserved surplus food under the host’s control.</Text>
        </Pressable>
      </View>

      <Pressable disabled={submitting} onPress={() => void publish()} style={({ pressed }) => [styles.publishButton, submitting && styles.disabled, pressed && styles.pressed]}>
        {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.publishText}>Publish FoodDrop ☄️</Text>}
      </Pressable>
      <Text style={styles.publishHint}>Publishing makes the location visible to signed-in rescuers until the deadline.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionCard: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface },
  sectionTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  step: { color: colors.primary, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1.1 },
  field: { gap: spacing.sm },
  label: { color: colors.ink, fontSize: typeScale.body, fontWeight: '800' },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  input: { minHeight: 50, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.background, color: colors.ink, fontSize: typeScale.body },
  multilineInput: { minHeight: 88, textAlignVertical: 'top' },
  photoPicker: { overflow: 'hidden', borderRadius: radii.md, backgroundColor: colors.surfaceMuted },
  photo: { width: '100%', height: 210 },
  photoEmpty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg },
  photoIcon: { fontSize: 38 },
  photoTitle: { color: colors.ink, fontSize: typeScale.bodyLarge, fontWeight: '900', textAlign: 'center' },
  helper: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18 },
  confirmed: { color: colors.primaryDark, fontWeight: '800' },
  textAction: { color: colors.primary, fontSize: typeScale.body, fontWeight: '900' },
  map: { width: '100%', height: 220, borderRadius: radii.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, backgroundColor: colors.background },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.mint },
  chipText: { color: colors.muted, fontSize: typeScale.caption, fontWeight: '800' },
  chipTextSelected: { color: colors.primaryDark },
  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  checkbox: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.background },
  checkboxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkmark: { color: colors.white, fontWeight: '900' },
  confirmText: { flex: 1, color: colors.ink, fontSize: typeScale.body, lineHeight: 21 },
  publishButton: { minHeight: 58, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.primary },
  publishText: { color: colors.white, fontSize: typeScale.bodyLarge, fontWeight: '900' },
  publishHint: { color: colors.muted, fontSize: typeScale.caption, lineHeight: 18, textAlign: 'center' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
  dropRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  dropRowCopy: { flex: 1, gap: spacing.xs },
  dropTitle: { color: colors.ink, fontSize: typeScale.body, fontWeight: '900' },
  rowArrow: { color: colors.primary, fontSize: 28 },
  error: { color: '#A33A35', fontSize: typeScale.body },
});
