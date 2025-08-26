// app/create-bill/index.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { COLORS, FONTS } from "../../constants/theme";

type Method = "scan" | "manual";

/**
 * ChooseMethodScreen
 * - UI "Buat Tagihan" tanpa scroll
 * - Menyembunyikan Tab Bar saat aktif
 */
export default function ChooseMethodScreen() {
  const [method, setMethod] = useState<Method>("scan");

  const navigation = useNavigation<any>();

  // Hide tab bar saat screen fokus
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });

      return () => {
        parent?.setOptions({ tabBarStyle: undefined });
      };
    }, [navigation])
  );

  const onNext = () => {
    if (method === "scan") router.push("/create-bill/scan-bill/camera");
    else router.push("/create-bill/manual-bill/manual");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header ungu + tombol back + ikon dokumen */}
      <View style={styles.headerArea}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Kembali"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.heroWrap}>
          <View style={styles.billIconContainer}>
            <Ionicons name="document-text" size={136} color="#fd8838" />
          </View>
        </View>
      </View>

      {/* Lengkung putih (diperkecil) */}
      <View style={styles.bigCurve} />

      {/* Konten putih */}
      <View style={styles.whiteBody}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Buat Tagihan</Text>
          <Text style={styles.subtitle}>Pilih metode untuk membuat tagihan</Text>
        </View>

        <View style={styles.content}>
          {/* Metode: Scan */}
          <MethodCard
            active={method === "scan"}
            onPress={() => setMethod("scan")}
            title="Scan Struk"
            description="Gunakan kamera untuk otomatis membuat tagihan dari struk"
            leftBg="#EFEFF3"
            leftIcon={<Ionicons name="scan" size={22} color={stylesVars.tosca} />}
          />

          {/* Metode: Manual */}
          <MethodCard
            active={method === "manual"}
            onPress={() => setMethod("manual")}
            title="Manual"
            description="Masukkan detail tagihan secara manual sesuai kebutuhan"
            leftBg="#EFEFF3"
            leftIcon={<Ionicons name="create" size={22} color={stylesVars.tosca} />}
          />

          {/* CTA */}
          <TouchableOpacity style={styles.cta} onPress={onNext} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Lanjut</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function MethodCard({
  active,
  onPress,
  title,
  description,
  leftIcon,
  leftBg,
}: {
  active: boolean;
  onPress: () => void;
  title: string;
  description: string;
  leftIcon: React.ReactNode;
  leftBg: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.card,
        active && {
          borderColor: stylesVars.orange,
          shadowColor: stylesVars.orange,
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 10,
          elevation: 6,
        },
      ]}
    >
      <View style={[styles.cardIconWrap, { backgroundColor: leftBg }]}>
        {leftIcon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

/** ====== Local design tokens untuk halaman ini ====== */
const stylesVars = {
  purpleTop: "#B2DBD7", // latar ungu muda
  tosca: "#3FD8D3",     // ikon & tombol
  orange: "#FD8838", 
  yellow: "#fde9a2"   // highlight card aktif
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stylesVars.yellow,
  },

  /** Header/hero */
  headerArea: {
    backgroundColor: stylesVars.yellow,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginTop: 18,
    marginLeft: 16,
  },
  heroWrap: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 40,
  },
  billIconContainer: {
    position: "relative",
    zIndex: 10,
    marginBottom: -70,
  },

  /** Lengkung putih di bawah header (diperkecil) */
  bigCurve: {
    backgroundColor: COLORS.white,
    height: 50, // kecil agar tidak terlalu 'menumpuk'
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    marginTop: -24,
  },

  /** Body putih */
  whiteBody: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  titleWrap: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },

  /** Content area untuk kartu & CTA */
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    justifyContent: 'center',
  },

  /** Kartu opsi */
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },

  /** Tombol CTA */
  cta: {
    backgroundColor: stylesVars.orange,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 186,
    shadowColor: stylesVars.orange,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: "#ffffffff",
  },
});