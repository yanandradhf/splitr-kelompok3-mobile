import { StyleSheet } from "react-native";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../../../constants/theme";
import { wp, hp, rf, getSpacing, getBorderRadius, getIconSize } from "../../../../../utils/responsive";

const LOCAL_COLORS = {
  background: "#A6D3CE",
  cardBrown: COLORS.card,
  cardWhite: COLORS.white,
  orange: COLORS.orange,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  headerBrown: "#00897B",
  gray: COLORS.gray,
};

export const groupDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: rf(FONT_SIZES.xl),
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
});

export const groupInfoStyles = StyleSheet.create({
  groupInfoCard: {
    backgroundColor: "#A6D3CE",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  groupTitle: {
    fontSize: rf(20),
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: getSpacing(4),
  },
  groupSubtitle: {
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.black,
    opacity: 0.8,
  },
});

export const sectionStyles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: rf(FONT_SIZES.lg),
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getSpacing(12),
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
    borderRadius: getBorderRadius(16),
    borderWidth: 1,
    borderColor: "#00897B",
  },
  editButtonText: {
    fontSize: rf(12),
    fontFamily: FONTS.semiBold,
    color: "#00897B",
    marginLeft: getSpacing(4),
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    minHeight: 80,
  },
  displayContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  displayText: {
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
});