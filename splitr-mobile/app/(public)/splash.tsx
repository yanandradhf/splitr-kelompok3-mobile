import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS as THEME_COLORS } from "../../constants/theme";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[THEME_COLORS.backgroundMain, '#9BCCC7', '#84BDB8']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/splitr.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          PT Bank Negara Indonesia (Persero) Tbk berizin dan diawasi oleh
          Otoritas Jasa Keuangan (OJK) & Bank Indonesia (BI) serta merupakan
          peserta penjaminan Lembaga Penjamin Simpanan (LPS).
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffffffff",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },

  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    paddingHorizontal: 30,
  },
  footerText: {
    fontSize: 12,
    color: "#000000ff",
    textAlign: "center",
    lineHeight: 16,
  },
});
