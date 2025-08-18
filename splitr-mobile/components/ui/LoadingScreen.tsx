import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/theme";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Memuat...",
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.orange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 9999,
  },
});
