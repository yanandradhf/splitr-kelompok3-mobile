import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  groupName?: string;
}

export default function SuccessModal({ visible, onClose, groupName }: SuccessModalProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={48} color="#00897B" />
                <View style={styles.checkmarkBadge}>
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                </View>
              </View>

              {/* Success Text */}
              <Text style={styles.title}>Yeay!</Text>
              <Text style={styles.subtitle}>
                {groupName ? `Grup "${groupName}" berhasil dibuat` : 'Grup Berhasil dibuat'}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#A6D3CE',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 40,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#00897B',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#A6D3CE',
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
  },
});