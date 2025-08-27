import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
import { masterBillStyles } from "../styles";
import { CommentData } from "../types";

interface CommentsSectionProps {
  comments: CommentData[];
  onPress: () => void;
  formatCommentTime: (timestamp: string) => string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  onPress,
  formatCommentTime,
}) => {
  return (
    <TouchableOpacity
      style={styles.commentsSection}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.commentsSectionHeader}>
        <View style={styles.commentsHeaderLeft}>
          <Ionicons
            name="chatbubbles-outline"
            size={20}
            color={COLORS.teal}
          />
          <Text style={masterBillStyles.sectionTitle}>
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
  );
};

const styles = StyleSheet.create({
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
    color: COLORS.teal,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
});