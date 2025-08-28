import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getImageUrl } from "../../utils/imageHelper";
import UserAvatar from "../../components/ui/UserAvatar";
import { COLORS } from "../../constants/theme";

// Components
import { BillOverview } from "./components/BillOverview";
import { PaymentSummary } from "./components/PaymentSummary";
import { ParticipantsSection } from "./components/ParticipantsSection";
import { ItemsSection } from "./components/ItemsSection";
import { CommentsSection } from "./components/CommentsSection";
import { BreakdownSection } from "./components/BreakdownSection";

// Hooks & Utils
import { useMasterBillLogic } from "./hooks/useMasterBillLogic";

// Styles
import { masterBillStyles } from "./styles";

export default function MasterBillDetail() {
  const { identifier, billData: passedBillData } = useLocalSearchParams<{
    identifier: string;
    billData?: string;
  }>();

  const {
    // State
    billData,
    loading,
    error,
    showFullImage,
    showCommentsModal,
    commentText,
    rateLimitError,
    comments,
    isCommentsLoading,
    isSendingComment,
    user,

    // Actions
    setShowFullImage,
    setShowCommentsModal,
    setCommentText,
    setRateLimitError,
    handleSendComment,

    // Utils
    getStatusColor,
    getStatusText,
    formatDate,
    formatCommentTime,
  } = useMasterBillLogic(identifier, passedBillData);

  if (loading) {
    return (
      <View style={masterBillStyles.container}>
        <SafeAreaView style={masterBillStyles.safeArea}>
          <View style={masterBillStyles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.teal} />
            <Text style={masterBillStyles.loadingText}>Memuat tagihan...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !billData) {
    return (
      <View style={masterBillStyles.container}>
        <SafeAreaView style={masterBillStyles.safeArea}>
          <View style={masterBillStyles.header}>
            <Pressable
              onPress={() => router.back()}
              style={masterBillStyles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </Pressable>
            <Text style={masterBillStyles.headerTitle}>Bill Keseluruhan</Text>
            <View style={masterBillStyles.placeholder} />
          </View>
          <View style={masterBillStyles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={COLORS.red}
            />
            <Text style={masterBillStyles.errorText}>{error}</Text>
            <Pressable
              onPress={() => router.back()}
              style={masterBillStyles.backToHomeButton}
            >
              <Text style={masterBillStyles.backToHomeText}>Kembali</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <>
      <View style={masterBillStyles.container}>
        <SafeAreaView style={masterBillStyles.safeArea}>
          <View style={masterBillStyles.header}>
            <Pressable
              onPress={() => router.back()}
              style={masterBillStyles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </Pressable>
            <Text style={masterBillStyles.headerTitle}>Bill Keseluruhan</Text>
            <View style={masterBillStyles.placeholder} />
          </View>

          <View style={masterBillStyles.whiteContainer}>
            <ScrollView
              style={masterBillStyles.content}
              showsVerticalScrollIndicator={false}
            >
              <BillOverview
                billData={billData}
                onReceiptPress={() => setShowFullImage(true)}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />

              <PaymentSummary billData={billData} />

              <ParticipantsSection
                billData={billData}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                formatDate={formatDate}
              />

              <ItemsSection billData={billData} />

              <CommentsSection
                comments={comments}
                onPress={() => setShowCommentsModal(true)}
                formatCommentTime={formatCommentTime}
              />

              <BreakdownSection billData={billData} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>

      {/* Full Image Modal */}
      <Modal visible={showFullImage} transparent animationType="fade">
        <View style={styles.fullImageModal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFullImage(false)}
          >
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Image
            source={{ uri: getImageUrl(billData?.receiptImageUrl) }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <SafeAreaView style={styles.commentsModalContainer}>
          <View style={styles.commentsModalHeader}>
            <TouchableOpacity
              onPress={() => setShowCommentsModal(false)}
              style={masterBillStyles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.commentsModalTitle}>Diskusi</Text>
            <View style={masterBillStyles.placeholder} />
          </View>

          <ScrollView style={styles.commentsModalContent}>
            {comments.map((comment) => {
              const isCurrentUser =
                comment.isCurrentUser ||
                (user &&
                  (comment.userId === user.userId ||
                    comment.userName === user.username ||
                    comment.userName === user.name));
              return (
                <View
                  key={comment.id}
                  style={[
                    styles.commentItem,
                    isCurrentUser && styles.commentItemOwn,
                  ]}
                >
                  {isCurrentUser ? (
                    // User's own message - right aligned
                    <>
                      <View style={styles.commentHeaderOwn}>
                        <Text style={styles.commentUserNameOwn}>
                          {comment.userName}
                        </Text>
                        <UserAvatar
                          photoUrl={comment.userAvatar}
                          name={comment.userName}
                          size={24}
                          style={styles.commentAvatarOwn}
                        />
                      </View>
                      <View style={styles.commentBubbleOwn}>
                        <Text style={styles.commentTextOwn}>
                          {comment.message}
                        </Text>
                      </View>
                      <Text style={styles.commentTimeOwnBottom}>
                        {formatCommentTime(
                          comment.createdAt || comment.timestamp
                        )}
                      </Text>
                    </>
                  ) : (
                    // Other's message - left aligned
                    <>
                      <View style={styles.commentHeader}>
                        <UserAvatar
                          photoUrl={comment.userAvatar}
                          name={comment.userName}
                          size={24}
                          style={styles.commentAvatar}
                        />
                        <Text style={styles.commentUserName}>
                          {comment.userName}
                        </Text>
                      </View>
                      <View style={styles.commentBubble}>
                        <Text style={styles.commentText}>
                          {comment.message}
                        </Text>
                      </View>
                      <Text style={styles.commentTimeBottom}>
                        {formatCommentTime(
                          comment.createdAt || comment.timestamp
                        )}
                      </Text>
                    </>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            style={styles.commentInputContainer}
          >
            <View>
              {rateLimitError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="time-outline" size={16} color={COLORS.red} />
                  <Text style={styles.errorText}>{rateLimitError}</Text>
                </View>
              ) : null}

              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={styles.commentInput}
                  value={commentText}
                  onChangeText={(text) => {
                    setCommentText(text);
                    if (rateLimitError) setRateLimitError("");
                  }}
                  placeholder="Tulis komentar..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!commentText.trim() ||
                      isSendingComment ||
                      rateLimitError) &&
                      styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendComment}
                  disabled={
                    !commentText.trim() || isSendingComment || !!rateLimitError
                  }
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={
                      commentText.trim() && !isSendingComment && !rateLimitError
                        ? COLORS.white
                        : COLORS.textSecondary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// Styles for modals and comments (keeping original styles for compatibility)
const styles = {
  fullImageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute" as const,
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 10,
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
  commentsModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  commentsModalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsModalTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: COLORS.textPrimary,
    textAlign: "center" as const,
    flex: 1,
  },
  commentsModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  commentItem: {
    marginBottom: 16,
    width: "100%",
  },
  commentItemOwn: {},
  commentHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
    gap: 8,
  },
  commentAvatar: {
    marginRight: 0,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: COLORS.textPrimary,
    flex: 1,
  },
  hostBadge: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  hostBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  participantAccount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  participantAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  participantStatus: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  paidDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: 32,
    marginTop: 8,
  },
  commentBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: "80%",
    alignSelf: "flex-start" as const,
    marginLeft: 32,
  },
  commentText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  commentHeaderOwn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    marginBottom: 8,
    gap: 8,
    marginRight: 32,
  },
  commentAvatarOwn: {
    borderWidth: 2,
    borderColor: COLORS.orange,
  },
  commentUserNameOwn: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: COLORS.orange,
  },
  commentTimeOwnBottom: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "right" as const,
    marginRight: 32,
    marginTop: 8,
  },
  commentBubbleOwn: {
    backgroundColor: COLORS.teal,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: "75%",
    alignSelf: "flex-end" as const,
    marginRight: 32,
  },
  commentTextOwn: {
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 20,
  },
  commentInputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  commentInputWrapper: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    gap: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  errorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: COLORS.red,
    flex: 1,
  },
};
