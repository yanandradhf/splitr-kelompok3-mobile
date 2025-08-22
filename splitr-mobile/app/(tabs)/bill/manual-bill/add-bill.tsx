import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "../../../../constants/theme";

export default function AddBillScreen() {
  const navigation = useNavigation<any>();

  // Hide tab bar
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  const handleCreateBill = () => {
    Alert.alert(
      "Fitur Manual Bill",
      "Fitur pembuatan tagihan manual akan segera tersedia",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat Tagihan Manual</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.comingSoonContainer}>
          <Ionicons name="construct-outline" size={64} color="#73E0D1" />
          <Text style={styles.comingSoonText}>Segera Hadir</Text>
          <Text style={styles.comingSoonSubtext}>
            Fitur pembuatan tagihan manual sedang dalam pengembangan
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backToScanButton}
          onPress={() => router.replace("/(tabs)/bill/scan-bill/camera")}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-outline" size={20} color="#111827" />
          <Text style={styles.backToScanText}>Gunakan Scan Struk</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  comingSoonContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  comingSoonText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  backToScanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#73E0D1",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  backToScanText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: "#111827",
  },
});