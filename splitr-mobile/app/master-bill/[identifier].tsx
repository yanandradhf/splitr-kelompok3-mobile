import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { formatRp } from "@/lib/currency";
import api from "@/services/api";
import { API_CONFIG } from "@/constants/config";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from "../../constants/theme";
import { getBillEndpoint } from "../../utils/billEndpoints";
import { getImageUrl } from "../../utils/imageHelper";
import { Comment } from "../../services/commentsApi";
import { useCommentsStore } from "../../store";
import UserAvatar from "../../components/ui/UserAvatar";
import { useAuthStore } from "../../features/auth/auth.store";

interface MasterBillData {
  billId: string;
  billCode: string;
  billName: string;
  totalAmount: number;
  status: string;
  receiptImageUrl?: string;
  host: {
    name: string;
    account: string;
  };
  category: any;
  paymentDeadline?: string;
  isExpired?: boolean;
  items: Array<{
    itemId: string;
    itemName: string;
    price: number;
    quantity: number;
    totalAssigned: number;
    isSharing: boolean;
    assignments: Array<{
      participantName: string;
      participantAccount: string;
      quantity: number;
      amount: number;
      isSharedPortion: boolean;
    }>;
  }>;
  participants: Array<{
    participantId: string;
    name: string;
    account: string;
    amountShare: number;
    paymentStatus: string;
    paidAt?: string;
    scheduledDate?: string;
    paymentType?: string;
    isHost: boolean;
    breakdown: {
      subtotal: number;
      taxAmount: number;
      serviceAmount: number;
      discountAmount: number;
      totalAmount: number;
    };
  }>;
  paymentSummary: {
    totalParticipants: number;
    completedCount: number;
    pendingCount: number;
    totalPaid: number;
    totalPending: number;
    completionPercentage: number;
  };
  fees: {
    subTotal: number;
    taxAmount: number;
    serviceAmount: number;
    discountAmount: number;
  };
}

export default function MasterBillDetail() {
  const { identifier, billData: passedBillData } = useLocalSearchParams<{
    identifier: string;
    billData?: string;
  }>();
  const [billData, setBillData] = useState<MasterBillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [lastCommentTime, setLastCommentTime] = useState(0);
  const [rateLimitError, setRateLimitError] = useState("");

  // Comments store
  const {
    comments: allComments,
    loading: commentsLoading,
    sending: commentsSending,
    fetchComments,
    postComment,
    clearError,
  } = useCommentsStore();

  // Auth store
  const { user } = useAuthStore();

  const comments = allComments[identifier] || [];
  const isCommentsLoading = commentsLoading[identifier] || false;
  const isSendingComment = commentsSending[identifier] || false;
  const [dummyComments] = useState([
    {
      id: "1",
      userId: "user1",
      userName: "Ahmad Rizki",
      userAvatar: null,
      message: "Udah transfer ya, cek rekening",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isCurrentUser: false,
    },
    {
      id: "2",
      userId: "user2",
      userName: "You",
      userAvatar: null,
      message: "Oke thanks! Udah masuk kok",
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      isCurrentUser: true,
    },
    {
      id: "3",
      userId: "user3",
      userName: "Sari Dewi",
      userAvatar: null,
      message: "Gue belum bayar nih, tunggu gajian dulu ya 😅",
      timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      isCurrentUser: false,
    },
  ]);

  useEffect(() => {
    if (identifier) {
      fetchBillData();
      fetchComments(identifier);
    }
  }, [identifier, fetchComments]);

  const fetchBillData = async () => {
    try {
      setLoading(true);

      if (passedBillData) {
        try {
          const parsedData = JSON.parse(passedBillData);
          setBillData(parsedData);
          setLoading(false);
          return;
        } catch (e) {
          console.log("Failed to parse passed data, fetching from API");
        }
      }

      const endpoint = getBillEndpoint(identifier, true);
      console.log("🔍 [MASTER] Fetching master bill data:", endpoint);

      const response = await api.get(endpoint);

      if (response.data.success) {
        setBillData(response.data.bill);
      } else {
        setError("Tagihan tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching master bill data:", error);
      setError("Gagal memuat data tagihan");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return COLORS.orange;
      case "completed":
        return COLORS.success;
      case "completed_scheduled":
        return COLORS.orange;
      case "completed_late":
        return "#D97706";
      case "cancelled":
        return COLORS.red;
      case "pending":
        return COLORS.warning;
      case "expired":
        return COLORS.red;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "completed":
        return "Selesai";
      case "completed_scheduled":
        return "Terjadwal Selesai";
      case "completed_late":
        return "Terlambat";
      case "cancelled":
        return "Dibatalkan";
      case "pending":
        return "Belum Bayar";
      case "expired":
        return "Kadaluarsa";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCommentTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;

    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !identifier || isSendingComment) return;

    // Rate limiting check (2 minutes = 120000ms)
    const now = Date.now();
    const timeSinceLastComment = now - lastCommentTime;
    const RATE_LIMIT_MS = 120000; // 2 minutes

    if (timeSinceLastComment < RATE_LIMIT_MS && lastCommentTime > 0) {
      const remainingTime = Math.ceil(
        (RATE_LIMIT_MS - timeSinceLastComment) / 1000
      );
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;

      setRateLimitError(
        `Tunggu ${
          minutes > 0 ? `${minutes}m ` : ""
        }${seconds}s sebelum mengirim komentar lagi`
      );

      // Clear error after 3 seconds
      setTimeout(() => setRateLimitError(""), 3000);
      return;
    }

    try {
      await postComment(identifier, commentText.trim());
      setCommentText("");
      setLastCommentTime(now);
      setRateLimitError("");
    } catch (error: any) {
      console.error("Failed to send comment:", error);

      // Handle 429 rate limit error from backend
      if (error.response?.status === 429) {
        setRateLimitError(
          "Terlalu banyak komentar. Tunggu 2 menit sebelum mengirim lagi."
        );
        setTimeout(() => setRateLimitError(""), 5000);
      } else {
        setRateLimitError("Gagal mengirim komentar. Coba lagi.");
        setTimeout(() => setRateLimitError(""), 3000);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.orange} />
            <Text style={styles.loadingText}>Memuat tagihan...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !billData) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Bill Keseluruhan</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={COLORS.red}
            />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              onPress={() => router.back()}
              style={styles.backToHomeButton}
            >
              <Text style={styles.backToHomeText}>Kembali</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Bill Keseluruhan</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.whiteContainer}>
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {billData.receiptImageUrl && (
                <TouchableOpacity
                  style={styles.receiptInfoCard}
                  onPress={() => setShowFullImage(true)}
                >
                  <View style={styles.receiptInfoContent}>
                    <Ionicons
                      name="receipt-outline"
                      size={24}
                      color={COLORS.orange}
                    />
                    <View style={styles.receiptInfoText}>
                      <Text style={styles.receiptInfoTitle}>
                        Struk Tersedia
                      </Text>
                      <Text style={styles.receiptInfoSubtitle}>
                        Tap untuk melihat struk pembayaran
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.overviewCard}>
                <View style={styles.billHeader}>
                  <View style={styles.billInfo}>
                    <Text style={styles.billCode}>{billData.billCode}</Text>
                    <Text style={styles.billName}>{billData.billName}</Text>
                    <Text style={styles.hostName}>
                      Host: {billData.host.name}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(billData.status) === COLORS.orange
                              ? "#E6FFFA"
                              : getStatusColor(billData.status) ===
                                COLORS.success
                              ? "#F0FDF4"
                              : getStatusColor(billData.status) === COLORS.red
                              ? "#FEF2F2"
                              : getStatusColor(billData.status) ===
                                COLORS.warning
                              ? "#FFFBEB"
                              : getStatusColor(billData.status) === "#D97706"
                              ? "#FEF3C7"
                              : "#F8F9FA",
                          borderColor:
                            getStatusColor(billData.status) === COLORS.orange
                              ? "#B2F5EA"
                              : getStatusColor(billData.status) ===
                                COLORS.success
                              ? "#BBF7D0"
                              : getStatusColor(billData.status) === COLORS.red
                              ? "#FECACA"
                              : getStatusColor(billData.status) ===
                                COLORS.warning
                              ? "#FDE68A"
                              : getStatusColor(billData.status) === "#D97706"
                              ? "#FDE68A"
                              : "#E5E7EB",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(billData.status) },
                        ]}
                      >
                        {getStatusText(billData.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.totalAmountLabel}>Total Tagihan</Text>
                  <Text style={styles.totalAmountValue}>
                    {formatRp(billData.totalAmount)}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {billData.paymentSummary.completedCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Selesai</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {billData.paymentSummary.pendingCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Belum Bayar</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValueGreen}>
                      {formatRp(billData.paymentSummary.totalPaid)}
                    </Text>
                    <Text style={styles.summaryLabel}>Terkumpul</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValueOrange}>
                      {formatRp(billData.paymentSummary.totalPending)}
                    </Text>
                    <Text style={styles.summaryLabel}>Tertunggak</Text>
                  </View>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${billData.paymentSummary.completionPercentage}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {billData.paymentSummary.completionPercentage}% selesai
                  </Text>
                </View>
              </View>

              <View style={styles.participantsSection}>
                <Text style={styles.sectionTitle}>Status Peserta</Text>
                {billData.participants.map((participant) => (
                  <View
                    key={participant.participantId}
                    style={styles.participantCard}
                  >
                    <View style={styles.participantInfo}>
                      <View style={styles.participantHeader}>
                        <Text style={styles.participantName}>
                          {participant.name}
                        </Text>
                        {participant.isHost && (
                          <View style={styles.hostBadge}>
                            <Text style={styles.hostBadgeText}>Host</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.participantAccount}>
                        {participant.account}
                      </Text>
                      <Text style={styles.participantAmount}>
                        {formatRp(participant.amountShare)}
                      </Text>
                    </View>
                    <View style={styles.participantStatus}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: getStatusColor(
                              participant.paymentStatus
                            ),
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusLabel,
                          { color: getStatusColor(participant.paymentStatus) },
                        ]}
                      >
                        {getStatusText(participant.paymentStatus)}
                      </Text>
                      {participant.paidAt && (
                        <Text style={styles.paidDate}>
                          Dibayar: {formatDate(participant.paidAt)}
                        </Text>
                      )}
                      {participant.paymentStatus === "completed_scheduled" &&
                        participant.scheduledDate && (
                          <Text style={styles.scheduledDate}>
                            Dijadwalkan: {formatDate(participant.scheduledDate)}
                          </Text>
                        )}
                      {participant.paymentStatus === "completed_late" &&
                        participant.paidAt && (
                          <Text style={styles.lateDate}>
                            Terlambat: {formatDate(participant.paidAt)}
                          </Text>
                        )}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Detail Item</Text>
                {billData.items.map((item) => (
                  <View key={item.itemId} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.itemName}</Text>
                      <View style={styles.itemPriceContainer}>
                        <Text style={styles.itemPrice}>
                          {formatRp(item.totalAssigned)}
                        </Text>
                        {item.isSharing && (
                          <View style={styles.sharingBadge}>
                            <Ionicons
                              name="people"
                              size={12}
                              color={COLORS.white}
                            />
                            <Text style={styles.sharingText}>Sharing</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.assignmentsContainer}>
                      {item.assignments.map((assignment, index) => (
                        <View key={index} style={styles.assignmentRow}>
                          <Text style={styles.assignmentName}>
                            {assignment.participantName}
                          </Text>
                          <Text style={styles.assignmentQty}>
                            {assignment.isSharedPortion
                              ? "Sharing"
                              : `${assignment.quantity}x`}
                          </Text>
                          <Text style={styles.assignmentAmount}>
                            {formatRp(assignment.amount)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.commentsSection}
                onPress={() => setShowCommentsModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.commentsSectionHeader}>
                  <View style={styles.commentsHeaderLeft}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={20}
                      color={COLORS.orange}
                    />
                    <Text style={styles.sectionTitle}>
                      Diskusi ({comments.length})
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.commentsPreview}>
                  {comments.slice(-2).map((comment) => (
                    <View key={comment.id} style={styles.commentPreviewItem}>
                      <View style={styles.commentPreviewHeader}>
                        <Text style={styles.commentPreviewName}>
                          {comment.userName}
                        </Text>
                        <Text style={styles.commentPreviewTime}>
                          {formatCommentTime(
                            comment.createdAt || comment.timestamp
                          )}
                        </Text>
                      </View>
                      <Text style={styles.commentPreviewText} numberOfLines={1}>
                        {comment.message}
                      </Text>
                    </View>
                  ))}
                  {comments.length > 2 && (
                    <Text style={styles.moreCommentsText}>
                      +{comments.length - 2} komentar lainnya
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.breakdownSection}>
                <Text style={styles.sectionTitle}>Rincian Total</Text>
                <View style={styles.breakdownCard}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Subtotal</Text>
                    <Text style={styles.breakdownValue}>
                      {formatRp(billData.fees.subTotal)}
                    </Text>
                  </View>
                  {billData.fees.taxAmount > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Pajak</Text>
                      <Text style={styles.breakdownValue}>
                        {formatRp(billData.fees.taxAmount)}
                      </Text>
                    </View>
                  )}
                  {billData.fees.serviceAmount > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Service</Text>
                      <Text style={styles.breakdownValue}>
                        {formatRp(billData.fees.serviceAmount)}
                      </Text>
                    </View>
                  )}
                  {billData.fees.discountAmount > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Diskon</Text>
                      <Text
                        style={[
                          styles.breakdownValue,
                          { color: COLORS.success },
                        ]}
                      >
                        -{formatRp(billData.fees.discountAmount)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      {formatRp(billData.totalAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>

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
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.commentsModalTitle}>Diskusi</Text>
            <View style={styles.placeholder} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  whiteContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  backToHomeButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
  },
  backToHomeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
  },
  overviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  billInfo: {
    flex: 1,
  },
  billCode: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  billName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  hostName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 1,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  amountContainer: {
    backgroundColor: "#F8FFFE",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0F2F1",
  },
  totalAmountLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  totalAmountValue: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.orange,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  summaryValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  summaryValueGreen: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  summaryValueOrange: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  progressContainer: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.orange,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.orange,
  },
  participantsSection: {
    marginBottom: SPACING.lg,
  },
  participantCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  participantInfo: {
    flex: 1,
  },
  participantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  participantName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  hostBadge: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
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
    color: COLORS.orange,
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
  },
  scheduledDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.orange,
  },
  lateDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: "#D97706",
  },
  itemsSection: {
    marginBottom: SPACING.lg,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  itemPriceContainer: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.orange,
  },
  sharingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orange,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  sharingText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  assignmentsContainer: {
    gap: SPACING.xs,
  },
  assignmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  assignmentName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  assignmentQty: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
    minWidth: 60,
    textAlign: "center",
  },
  assignmentAmount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.orange,
    minWidth: 80,
    textAlign: "right",
  },
  breakdownSection: {
    marginBottom: SPACING.xl,
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  breakdownLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.orange,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.orange,
  },
  receiptInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E6FFFA",
  },
  receiptInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  receiptInfoText: {
    flex: 1,
  },
  receiptInfoTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  receiptInfoSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  fullImageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
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
  commentsSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  commentsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  commentsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  commentsPreview: {
    gap: SPACING.sm,
  },
  commentPreviewItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  commentPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  commentPreviewName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  commentPreviewTime: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  commentPreviewText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  moreCommentsText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.orange,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  commentsModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  commentsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    flex: 1,
  },
  commentsModalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  commentItem: {
    marginBottom: SPACING.md,
    width: "100%",
  },
  commentItemOwn: {
    // Remove alignItems to allow proper bubble positioning
  },
  // Left aligned (others)
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  commentAvatar: {
    marginRight: 0,
  },
  commentUserName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  commentTimeBottom: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: 32,
    marginTop: SPACING.xs,
  },
  commentBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xs,
    padding: SPACING.md,
    maxWidth: "80%",
    alignSelf: "flex-start",
    marginLeft: 32,
  },
  commentText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  // Right aligned (own)
  commentHeaderOwn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
    marginRight: 32,
  },
  commentAvatarOwn: {
    borderWidth: 2,
    borderColor: COLORS.orange,
  },
  commentUserNameOwn: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.orange,
  },
  commentTimeOwnBottom: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "right",
    marginRight: 32,
    marginTop: SPACING.xs,
  },
  commentBubbleOwn: {
    backgroundColor: COLORS.orange,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.xs,
    padding: SPACING.md,
    maxWidth: "75%",
    alignSelf: "flex-end",
    marginRight: 32,
  },
  commentTextOwn: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    lineHeight: 20,
  },
  commentInputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: Platform.OS === "ios" ? SPACING.lg : SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  commentInputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.sm,
    backgroundColor: "#F8F9FA",
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  commentInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: SPACING.sm,
  },
  sendButton: {
    backgroundColor: COLORS.orange,
    borderRadius: BORDER_RADIUS.full,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.red,
    flex: 1,
  },
});
