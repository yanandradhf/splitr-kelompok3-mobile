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

const { width } = Dimensions.get("window");
const PADDING = 18;
const ORANGE = "#FF9A56";
const TOSCA = "#73E0D1";
const BG = "#FFFFFF";

export default function PreviewScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string | string[] }>();
  const navigation = useNavigation<any>();

  // Pastikan string tunggal
  const imageUri = Array.isArray(uri) ? uri[0] : uri;

  // Hide tab bar ketika preview aktif
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  const goBack = () => router.back();
  const retake = () => router.replace("/(tabs)/bill/scan-bill/camera");

  const useThisPhoto = () => {
    // Teruskan ke halaman berikut dengan uri yang sama
    router.push({
      pathname: "/(tabs)/bill/scan-bill/scanning",
      params: { uri: imageUri ?? "" },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={goBack}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>

      <View style={styles.previewWrap}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImg}
            resizeMode="contain"
            onError={(error) => console.log("Image load error:", error)}
            onLoad={() => console.log("Image loaded successfully")}
          />
        ) : (
          <View style={styles.noImg}>
            <Ionicons name="image-outline" size={48} color="#999" />
            <Text style={styles.noImgText}>Tidak ada gambar</Text>
          </View>
        )}
      </View>

      <View style={styles.footerBar}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.outlinedBtn}
            onPress={retake}
            accessibilityLabel="Retake photo"
          >
            <Text style={styles.outlinedText}>Foto Ulang</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filledBtn}
            onPress={useThisPhoto}
            accessibilityLabel="Use this photo"
            disabled={!imageUri}
          >
            <Text style={styles.filledText}>Gunakan Foto Ini</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const IMG_HEIGHT = Math.min(560, width * 1.2);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginLeft: 10,
    marginTop: Platform.select({ ios: 0, android: 6 }),
  },
  previewWrap: {
    flex: 1,
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
  previewImg: {
    width: width - PADDING * 2 - 28,
    height: IMG_HEIGHT,
    borderRadius: 8,
  },
  noImg: { height: IMG_HEIGHT, alignItems: "center", justifyContent: "center" },
  noImgText: { marginTop: 8, color: "#777" },
  footerBar: {
    backgroundColor: "#111",
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 34, android: 14 }),
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
  outlinedText: { color: ORANGE, fontSize: 14 },
  filledBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: TOSCA,
    alignItems: "center",
    justifyContent: "center",
  },
  filledText: { color: "#111827", fontSize: 14, fontWeight: "700" },
});