import { useState, useEffect } from "react";
import { router } from "expo-router";
import api from "../../../services/api";
import { getBillEndpoint } from "../../../utils/billEndpoints";
import { useCommentsStore } from "../../../store";
import { useAuthStore } from "../../../features/auth/auth.store";
import { COLORS } from "../../../constants/theme";
import { MasterBillData } from "../types";

export const useMasterBillLogic = (identifier: string, passedBillData?: string) => {
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
  } = useCommentsStore();

  // Auth store
  const { user } = useAuthStore();

  const comments = allComments[identifier] || [];
  const isCommentsLoading = commentsLoading[identifier] || false;
  const isSendingComment = commentsSending[identifier] || false;

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
        return COLORS.teal;
      case "completed":
        return COLORS.success;
      case "completed_scheduled":
        return COLORS.teal;
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

  return {
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
  };
};