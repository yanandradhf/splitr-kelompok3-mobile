import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const BG = "#000";
const BUBBLE = "rgba(0,0,0,0.45)";
const ORANGE = "#FF9A56";
const CIRCLE = 44;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation<any>();

  const [flash, setFlash] = useState<"off" | "on">("off");
  const [torch, setTorch] = useState(false);

  // Sembunyikan tab bar di layar kamera
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  // Persist gambar ke storage aplikasi
  const persistToAppStorage = useCallback(async (srcUri: string) => {
    try {
      const dir = FileSystem.documentDirectory + "scans/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      const dest = `${dir}scan_${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: srcUri, to: dest });
      return dest;
    } catch (e) {
      console.warn("Gagal menyimpan, pakai srcUri:", e);
      return srcUri;
    }
  }, []);

  const goToPreview = useCallback((uri: string) => {
    router.push({ pathname: "/create-bill/scan-bill/preview", params: { uri } });
  }, []);

  const onCapture = useCallback(async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });
      if (photo?.uri) {
        const saved = await persistToAppStorage(photo.uri);
        goToPreview(saved);
      }
    } catch (err) {
      console.warn("Failed to take picture", err);
      Alert.alert("Gagal", "Tidak dapat mengambil foto. Coba lagi.");
    }
  }, [goToPreview, persistToAppStorage]);

  const onPickFromGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Diperlukan", "Aplikasi memerlukan izin akses galeri untuk memilih foto.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      const uri = result.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        const saved = await persistToAppStorage(uri);
        goToPreview(saved);
      }
    } catch (err) {
      console.warn("Failed to pick image", err);
      Alert.alert("Gagal", "Tidak dapat memilih gambar dari galeri.");
    }
  }, [goToPreview, persistToAppStorage]);

  const toggleTorch = useCallback(() => {
    setTorch((prev) => {
      const next = !prev;
      setFlash(next ? "on" : "off");
      return next;
    });
  }, []);

  // Permission state
  if (!permission) return <View style={{ flex: 1, backgroundColor: BG }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permWrap}>
        <Ionicons name="camera" size={48} color="#888" />
        <Text style={styles.permTitle}>Izin Kamera Diperlukan</Text>
        <Text style={styles.permDesc}>Untuk memindai struk, aktifkan izin kamera.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close (X) — diameter sama dengan galeri & flash */}
      <View style={styles.closeWrap}>
        <TouchableOpacity
          style={styles.sideBtn}
          onPress={() => router.back()}
          accessibilityLabel="Tutup kamera"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Kamera fullscreen */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
        enableTorch={torch}
      />

      {/* Tips di tengah: header (ikon + "Tips") lalu deskripsi */}
      <View style={styles.tipContainer} pointerEvents="none">
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={16} color="#fff" />
            <Text style={styles.tipTitle}>Tips</Text>
          </View>
          <Text style={styles.tipBody}>
            Pastikan struk terbaca dan difoto di tempat terang untuk hasil yang optimal.
          </Text>
        </View>
      </View>

      {/* Kontrol bawah */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.sideBtn}
          onPress={onPickFromGallery}
          accessibilityLabel="Buka galeri"
        >
          <Ionicons name="images-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shutterOuter}
          onPress={onCapture}
          activeOpacity={0.7}
          accessibilityLabel="Ambil foto"
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideBtn}
          onPress={toggleTorch}
          accessibilityLabel={torch ? "Matikan flash" : "Nyalakan flash"}
        >
          <Ionicons name={torch ? "flash" : "flash-off"} size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, justifyContent: "flex-end" },

  // Posisi tombol close, ukurannya pakai sideBtn (CIRCLE)
  closeWrap: {
    position: "absolute",
    top: Platform.select({ ios: 50, android: 24 }),
    right: 16,
    zIndex: 5,
  },

  // ===== TIP CARD (tengah) =====
  tipContainer: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: Platform.select({ ios: 140, android: 120 }),
    zIndex: 3,
    alignItems: "center", // card di tengah
  },
  tipCard: {
    backgroundColor: BUBBLE,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center", // konten card rata tengah
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // ikon + judul di tengah
    gap: 8,
    marginBottom: 6,
  },
  tipTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  tipBody: {
    color: "#fff",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    alignSelf: "stretch",
  },

  // ===== BOTTOM CONTROLS =====
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 36,
    paddingBottom: 22,
  },
  sideBtn: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#fff" },

  // Layar izin
  permWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  permTitle: { fontSize: 18, color: "#111" },
  permDesc: { fontSize: 13, color: "#666", textAlign: "center" },
  permBtn: {
    marginTop: 10,
    backgroundColor: ORANGE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  permBtnText: { color: "#fff" },
});