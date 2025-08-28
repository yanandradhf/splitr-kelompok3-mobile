// app/(tabs)/bill/scan-bill/scanning.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  SafeAreaView,
  Dimensions,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FixedGroqService } from "./fixedGroqService";
import { COLORS } from "../../../constants/theme";

const { width, height } = Dimensions.get("window");
const PADDING = 18;

const TOSCA = "#73E0D1";     // warna ikon animasi (dipertahankan)
const GREEN = "#00897B";     // warna utama (progress + tombol hijau)
const BG = "#FFFFFF";
const CARD_BG = "#F7F7F7";
const DIM = "rgba(0,0,0,0.45)";

const PREVIEW_H = Math.min(Math.round(height * 0.56), 540);

type Mode = "scanning" | "unreadable";

export default function ScanningScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const navigation = useNavigation<any>();

  const [scanAnimation] = useState(new Animated.Value(0));
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<Mode>("scanning");

  // interval id disimpan di ref (aman untuk RN + TS)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  useEffect(() => {
    // animasi ikon berputar
    const loop = Animated.loop(
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();

    const startProgress = () => {
      // naik perlahan sampai 90%
      tickRef.current = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 2 : p));
      }, 120);
    };

    const clearTick = () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };

    const isUnreadable = (res: any) => {
      // Heuristik aman: tidak ada items ATAU total 0 DAN confidence sangat rendah
      const itemsLen = Array.isArray(res?.items) ? res.items.length : 0;
      const total = Number(res?.total ?? res?.grandTotal ?? 0);
      const confidence = Number(res?.confidence ?? 0);
      const providerError =
        res?.provider === "error" || res?.rawText === "OCR failed";
      return providerError || itemsLen === 0 || (total <= 0 && confidence < 0.25);
    };

    const run = async () => {
      try {
        startProgress();
        if (!uri) throw new Error("No image URI provided");

        const res = await FixedGroqService.processReceipt(uri);

        clearTick();

        if (isUnreadable(res)) {
          // tampilkan modal gagal, jangan navigate
          setProgress(100);
          setMode("unreadable");
          return;
        }

        // sukses → navigate ke hasil
        setProgress(100);
        setTimeout(() => {
          router.replace({
            pathname: "/create-bill/scan-bill/bill-results",
            params: { uri, results: JSON.stringify(res) },
          });
        }, 400);
      } catch {
        clearTick();
        // treat as unreadable (tapi tetap boleh "atur rincian")
        setProgress(100);
        setMode("unreadable");
      }
    };

    run();

    return () => {
      loop.stop();
      clearTick();
    };
  }, [uri]);

  const rotate = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleRescan = () => {
    router.replace("/create-bill/scan-bill/camera");
  };

  const handleManual = () => {
    // kirim payload kosong agar user bisa isi manual di bill-results
    router.replace({
      pathname: "/create-bill/scan-bill/bill-results",
      params: {
        uri: uri || "",
        results: JSON.stringify({
          items: [],
          subtotal: 0,
          discount: 0,
          tax: 0,
          taxPercentage: 0,
          serviceCharge: 0,
          serviceChargePercentage: 0,
          total: 0,
          confidence: 0,
          rawText: "manual",
          provider: "unreadable",
        }),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* PREVIEW di tengah */}
      <View style={styles.centerWrapper}>
        <View style={styles.previewWrap}>
          {uri ? (
            <Image
              source={{ uri }}
              style={styles.previewImg}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImg}>
              <Ionicons name="image-outline" size={48} color={COLORS.placeholder} />
              <Text style={styles.noImgText}>Tidak ada gambar</Text>
            </View>
          )}
        </View>
      </View>

      {/* Overlay gelap */}
      <View style={styles.overlay} />

      {/* POPUP */}
      {mode === "scanning" ? (
        <View style={styles.modalCenter} pointerEvents="none">
          <View style={styles.modal}>
            <Animated.View
              style={[styles.scanIcon, { transform: [{ rotate }] }]}
            >
              <Ionicons name="scan" size={48} color={TOSCA} />
            </Animated.View>

            <Text style={styles.title}>Sedang membaca struk...</Text>
            <Text style={styles.subtitle}>Mohon tunggu beberapa detik</Text>

            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.modalCenter}>
          <View style={[styles.modal, styles.modalUnreadable]}>
            {/* Ilustrasi gagal */}
            <View style={styles.failIconWrap}>
              <Ionicons name="document-text-outline" size={42} color={GREEN} />
              <Ionicons
                name="close-circle"
                size={22}
                color="#E53935"
                style={styles.failBadge}
              />
            </View>

            <Text style={styles.failTitle}>Struk kamu gak kebaca</Text>
            <Text style={styles.failDesc}>
              Silakan scan ulang struk ini. Opsi lainnya, kamu bisa atur
              rincian dengan foto ulang struk atau tambahkan pesanan secara
              manual.
            </Text>

            <View style={styles.actionsRow}>
              <Pressable style={styles.outlineBtn} onPress={handleRescan}>
                <Text style={styles.outlineText}>Scan ulang</Text>
              </Pressable>
              <Pressable style={styles.filledBtn} onPress={handleManual}>
                <Text style={styles.filledText}>Atur rincian</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ===================== styles ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Preview center
  centerWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  previewWrap: {
    height: PREVIEW_H,
    width: width - PADDING * 2,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  previewImg: {
    width: width - PADDING * 2 - 28,
    height: PREVIEW_H - 28,
    borderRadius: 8,
  },
  noImg: {
    height: PREVIEW_H - 28,
    alignItems: "center",
    justifyContent: "center",
  },
  noImgText: { marginTop: 8, color: "#777" },

  // Overlay
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: DIM },

  // Modal center
  modalCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    alignItems: "center",
  },

  // scanning
  scanIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${TOSCA}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#E6EAEA",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: GREEN,
    borderRadius: 6,
  },

  // unreadable
  failIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E8F5F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  failBadge: {
    position: "absolute",
    right: 10,
    bottom: 8,
  },
  failTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginTop: 2,
  },
  failDesc: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  actionsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  outlineBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  outlineText: { color: GREEN, fontSize: 15, fontWeight: "700" },
  filledBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  filledText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  modalUnreadable: {
    paddingBottom: 16,
  },
});