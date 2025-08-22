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

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation<any>();

  const [flash, setFlash] = useState<"off" | "on">("off");
  const [torch, setTorch] = useState(false);

  // --- Hide tab bar ketika layar kamera aktif
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  // --- Helper: pastikan folder scans/ ada, lalu copy file ke sana
  const persistToAppStorage = useCallback(async (srcUri: string) => {
    try {
      const dir = FileSystem.documentDirectory + "scans/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      // Ekstensi default .jpg (ImagePicker & Kamera biasanya JPEG)
      const dest = `${dir}scan_${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: srcUri, to: dest });
      return dest; // pakai path yang sudah persisten
    } catch (e) {
      console.warn("Gagal menyimpan ke storage app, fallback pakai srcUri:", e);
      return srcUri; // fallback tetap kirim uri sumber
    }
  }, []);

  const goToPreview = useCallback((uri: string) => {
    router.push({
      pathname: "/(tabs)/bill/scan-bill/preview",
      params: { uri },
    });
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
        Alert.alert(
          "Izin Diperlukan",
          "Aplikasi memerlukan izin akses galeri untuk memilih foto."
        );
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

  // --- Loading / permission
  if (!permission) return <View style={{ flex: 1, backgroundColor: BG }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permWrap}>
        <Ionicons name="camera" size={48} color="#888" />
        <Text style={styles.permTitle}>Izin Kamera Diperlukan</Text>
        <Text style={styles.permDesc}>
          Untuk memindai struk, aktifkan izin kamera.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close (X) kanan atas */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        accessibilityLabel="Tutup kamera"
      >
        <Ionicons name="close" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Kamera fullscreen */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
        enableTorch={torch}
      />

      {/* Teks arahan */}
      <View style={styles.tipWrap} pointerEvents="none">
        <Text style={styles.tipText}>
          Pastikan struk terbaca dan difoto di tempat terang untuk hasil yang optimal.
        </Text>
      </View>

      {/* Kontrol bawah: Galeri — Shutter — Flash */}
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

  closeBtn: {
    position: "absolute",
    top: Platform.select({ ios: 50, android: 24 }),
    right: 16,
    zIndex: 5,
  },

  tipWrap: {
    alignSelf: "center",
    backgroundColor: BUBBLE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 18,
  },
  tipText: { color: "#fff", fontSize: 12, textAlign: "center" },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 36,
    paddingBottom: 22,
  },

  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
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
