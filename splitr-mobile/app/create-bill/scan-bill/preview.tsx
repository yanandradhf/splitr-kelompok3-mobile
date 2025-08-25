import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const PADDING = 18;
const ORANGE = "#00897B";
const TOSCA = "#00897B";
const BG = "#FFFFFF";

// tinggi kartu preview (abu-abu) diperkecil biar proporsional spt gambar 1
const PREVIEW_H = Math.min(Math.round(height * 0.62), 560);

export default function PreviewScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string | string[] }>();
  const navigation = useNavigation<any>();
  const imageUri = Array.isArray(uri) ? uri[0] : uri;

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  const goBack = () => router.back();
  const retake = () => router.replace("/create-bill/scan-bill/camera");
  const useThisPhoto = () => {
    router.push({
      pathname: "/create-bill/scan-bill/scanning",
      params: { uri: imageUri ?? "" },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={goBack} accessibilityLabel="Kembali">
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>

      {/* Preview card abu-abu */}
      <View style={styles.previewWrap}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImg}
            resizeMode="contain"
            onError={(e) => console.log("Image load error:", e)}
          />
        ) : (
          <View style={styles.noImg}>
            <Ionicons name="image-outline" size={48} color="#999" />
            <Text style={styles.noImgText}>Tidak ada gambar</Text>
          </View>
        )}
      </View>

      {/* Footer putih (tanpa background hitam) */}
      <View style={styles.footerBar}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.outlinedBtn} onPress={retake} accessibilityLabel="Foto ulang">
            <Text style={styles.outlinedText}>Foto Ulang</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filledBtn, !imageUri && { opacity: 0.5 }]}
            onPress={useThisPhoto}
            accessibilityLabel="Gunakan foto ini"
            disabled={!imageUri}
          >
            <Text style={styles.filledText}>Gunakan Foto Ini</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginTop: 18,
    marginLeft: 16,
  },

  previewWrap: {
    height: PREVIEW_H,                 // ⬅️ dibatasi agar tidak terlalu panjang
    marginTop: 12,
    marginHorizontal: PADDING,
    borderRadius: 16,
    backgroundColor: "#F7F7F7",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },

  // width/height mengikuti lebar container & tinggi card agar proporsional
  previewImg: {
    width: width - PADDING * 2 - 28,
    height: PREVIEW_H - 28,
    borderRadius: 8,
  },

  noImg: { height: PREVIEW_H - 28, alignItems: "center", justifyContent: "center" },
  noImgText: { marginTop: 8, color: "#777" },

  footerBar: {
    backgroundColor: BG,               // ⬅️ hilangkan area hitam
    paddingTop: 146,
    paddingBottom: Platform.select({ ios: 20, android: 14 }),
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: PADDING,
  },

  outlinedBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  // samakan ketebalan dgn tombol hijau (sedikit thinner)
  outlinedText: { color: ORANGE, fontSize: 14, fontWeight: "600" },

  filledBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: TOSCA,
    alignItems: "center",
    justifyContent: "center",
  },
  filledText: { color: "#ffffffff", fontSize: 14, fontWeight: "600" },
});
