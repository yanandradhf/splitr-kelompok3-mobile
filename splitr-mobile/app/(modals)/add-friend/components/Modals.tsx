import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import UserAvatar from '../../../../components/ui/UserAvatar';
import type { Friend } from '../types';
import { styles } from '../styles';

interface ModalsProps {
  showSuccessModal: boolean;
  addedFriend: Friend | null;
  showConfirmationModal: boolean;
  selectedUser: Friend | null;
  isAddingFriend: boolean;
  onConfirmAdd: () => void;
  onCancelAdd: () => void;
  showDeleteModal: boolean;
  selectedFriend: Friend | null;
  isDeletingFriend: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  showSuccessModal,
  addedFriend,
  showConfirmationModal,
  selectedUser,
  isAddingFriend,
  onConfirmAdd,
  onCancelAdd,
  showDeleteModal,
  selectedFriend,
  isDeletingFriend,
  onConfirmDelete,
  onCancelDelete,
}) => {
  return (
    <>
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.teal} />
            </View>
            <Text style={styles.successTitle}>Yeay!</Text>
            <Text style={styles.successMessage}>Teman berhasil ditambahkan</Text>
            {addedFriend && (
              <View style={styles.friendPreview}>
                <UserAvatar 
                  photoUrl={addedFriend.profilePhoto}
                  name={addedFriend.name}
                  size={40}
                />
                <View style={styles.friendPreviewInfo}>
                  <Text style={styles.previewName}>{addedFriend.name}</Text>
                  <Text style={styles.previewUsername}>@{addedFriend.username}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationIconContainer}>
              <Ionicons name="person-add" size={60} color={COLORS.teal} />
            </View>
            <Text style={styles.confirmationTitle}>Tambah Teman?</Text>
            <Text style={styles.confirmationMessage}>Apakah Anda ingin menambahkan pengguna ini sebagai teman?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancelAdd}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmAddButton, isAddingFriend && styles.disabledButton]}
                onPress={onConfirmAdd}
                disabled={isAddingFriend}
              >
                {isAddingFriend ? (
                  <ActivityIndicator size={16} color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmAddButtonText}>Tambah</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <View style={styles.warningIconContainer}>
              <Ionicons name="warning" size={60} color={COLORS.orange} />
            </View>
            <Text style={styles.deleteTitle}>Hapus Teman?</Text>
            <Text style={styles.deleteMessage}>Anda yakin ingin menghapus teman ini ?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancelDelete}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmDeleteButton, isDeletingFriend && styles.disabledButton]}
                onPress={onConfirmDelete}
                disabled={isDeletingFriend}
              >
                {isDeletingFriend ? (
                  <ActivityIndicator size={16} color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Hapus</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};