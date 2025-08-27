import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../../../../../constants/theme";
import { sectionStyles } from "../styles";
import { getIconSize } from "../../../../../utils/responsive";

interface EditableSectionProps {
  title: string;
  value: string;
  isEditing: boolean;
  isCreator: boolean;
  multiline?: boolean;
  placeholder: string;
  onValueChange: (value: string) => void;
  onToggleEdit: () => void;
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  title,
  value,
  isEditing,
  isCreator,
  multiline = false,
  placeholder,
  onValueChange,
  onToggleEdit,
}) => {
  return (
    <View style={sectionStyles.section}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>{title}</Text>
        {isCreator && (
          <TouchableOpacity
            style={sectionStyles.editButton}
            onPress={onToggleEdit}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isEditing ? "checkmark" : "pencil"}
              size={getIconSize(16)}
              color={COLORS.orange}
            />
            <Text style={sectionStyles.editButtonText}>
              {isEditing ? "Simpan" : "Edit"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isCreator && isEditing ? (
        <TextInput
          style={multiline ? sectionStyles.textArea : sectionStyles.input}
          value={value}
          onChangeText={onValueChange}
          onSubmitEditing={onToggleEdit}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? "top" : "center"}
          autoFocus={true}
          selectTextOnFocus={true}
          returnKeyType="done"
        />
      ) : (
        <View style={[sectionStyles.displayContainer, multiline && { minHeight: 80 }]}>
          <Text style={sectionStyles.displayText}>{value}</Text>
        </View>
      )}
    </View>
  );
};