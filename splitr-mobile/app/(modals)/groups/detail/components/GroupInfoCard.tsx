import React from "react";
import { View, Text } from "react-native";
import { groupInfoStyles } from "../styles";
import { GroupData } from "../types";

interface GroupInfoCardProps {
  groupName: string;
  displayGroup: GroupData | null;
}

export const GroupInfoCard: React.FC<GroupInfoCardProps> = ({
  groupName,
  displayGroup,
}) => {
  return (
    <View style={groupInfoStyles.groupInfoCard}>
      <Text style={groupInfoStyles.groupTitle}>{groupName || "Makan Bersama"}</Text>
      <Text style={groupInfoStyles.groupSubtitle}>
        Dibuat oleh{" "}
        {displayGroup?.isCreator
          ? "You"
          : displayGroup?.creatorName || "Hanis"}
      </Text>
    </View>
  );
};