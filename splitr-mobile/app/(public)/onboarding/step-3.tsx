import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 350;
const isMediumDevice = width >= 350 && width < 400;
const isLargeDevice = width >= 400;

interface Onboarding3Props {
  currentIndex: number;
  onGetStarted?: () => void;
  onPrevious?: () => void;
}

export default function Onboarding3({
  currentIndex,
  onGetStarted,
  onPrevious,
}: Onboarding3Props) {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const handleBelumPunyaPress = () => {
    router.push("/(auth)/login");
  };

  const handleSudahPunyaPress = () => {
    const wondrUrl = "https://apps.apple.com/id/app/wondr-by-bni/id6499518320";
    const wondrUrlAndroid =
      "https://play.google.com/store/apps/details?id=com.bni.wondr";

    Linking.openURL(wondrUrl).catch(() => {
      Linking.openURL(wondrUrlAndroid);
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* <Image 
        source={require('../../../assets/images/splitr.png')} 
        style={styles.logoTop}
        resizeMode="contain"
      /> */}
      <Image
        source={require("../../../assets/images/onboarding3.png")}
        style={styles.onboardingImage}
        resizeMode="contain"
      />
      <Text style={styles.titleText}>
        <Text style={styles.titleBlack}>Pantau Tagihan dalam </Text>
        <Text style={styles.titleOrange}>Satu Layar</Text>
      </Text>
      <Text style={styles.descriptionText}>
        Selesaikan pembayaran dengan cepat dan dapatkan notifikasi otomatis
        untuk semua transaksi.
      </Text>

      <View style={styles.dotsContainer}>
        <View style={[styles.dot, currentIndex === 0 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 1 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 2 && styles.activeDot]} />
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.belumPunyaButton}
          onPress={handleBelumPunyaPress}
        >
          <Text style={styles.belumPunyaText}>Sudah Punya Rekening BNI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sudahPunyaButton}
          onPress={handleSudahPunyaPress}
        >
          <Text style={styles.sudahPunyaText}>Sudah Punya Rekening Wondr</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffffff",
    padding: 20,
  },
  logoTop: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 80,
    height: 40,
  },
  onboardingImage: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 29,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 29,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  titleBlack: {
    color: "#000000",
  },
  titleOrange: {
    color: "#FF8736",
  },
  descriptionText: {
    fontSize: 13,
    color: "#000000ff",
    textAlign: "justify",
    lineHeight: 20,
    marginBottom: 30,
    fontFamily: "PlusJakartaSans_400Regular",
    paddingHorizontal: 20,
    width: "100%",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D3D3D3",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FF8736",
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
  },
  belumPunyaButton: {
    backgroundColor: "#71DBD1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: "100%",
  },
  belumPunyaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "PlusJakartaSans_600SemiBold",
    textAlign: "center",
  },
  sudahPunyaButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#71DBD1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
  },
  sudahPunyaText: {
    color: "#71DBD1",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "PlusJakartaSans_600SemiBold",
    textAlign: "center",
  },
});
