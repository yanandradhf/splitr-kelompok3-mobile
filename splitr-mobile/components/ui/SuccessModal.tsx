import React, { useEffect } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../constants/theme";
import {
  wp,
  hp,
  rf,
  getSpacing,
  getBorderRadius,
  getIconSize,
} from "../../utils/responsive";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  groupName: string;
}

export default function SuccessModal({
  visible,
  onClose,
  groupName,
}: SuccessModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.successModal}>
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark-circle"
              size={getIconSize(60)}
              color="#00897B"
            />
          </View>
          <Text style={styles.successTitle}>Yeayy !!!</Text>
          <Text style={styles.successSubtitle}>
            Grup "{groupName}" berhasil dibuat!
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    backgroundColor: "#A6D3CE",
    borderRadius: getBorderRadius(24),
    padding: getSpacing(40),
    alignItems: "center",
    marginHorizontal: getSpacing(40),
    minWidth: wp(70),
  },
  successIcon: {
    marginBottom: getSpacing(16),
  },
  successTitle: {
    fontSize: rf(18),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: getSpacing(8),
  },
  successSubtitle: {
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.white,
    textAlign: "center",
    opacity: 0.9,
  },
});
