import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';

import { COLORS } from '../../../constants/theme';

const LOCAL_COLORS = {
  background: COLORS.purple,
  cardBrown: COLORS.card,
  cardWhite: COLORS.white,
  orange: COLORS.orange,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  headerBrown: COLORS.card,
  gray: COLORS.gray,
};

const friends = [
  { name: "Hansip", image: require("../../../assets/images/person1.png") },
  { name: "Dull", image: require("../../../assets/images/person2.png") },
  { name: "Sugi", image: require("../../../assets/images/person3.png") },
  { name: "lulu", image: require("../../../assets/images/person4.png") },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* PURPLE BACKGROUND SECTION */}
        <View style={styles.purpleSection}>
          {/* HEADER SECTION */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.userProfile} activeOpacity={0.7} onPress={() => router.push('/(modals)/profile')}>
              <Image
                source={require("../../../assets/images/person1.png")}
                style={styles.profileImage}
              />
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeSubtext}>Hi, Welcome Back!</Text>
                <Text style={styles.welcomeName}>Ivana</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.notificationContainer}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={COLORS.textPrimary}
              />
              <View style={styles.notificationDot} />
            </View>
          </View>

          {/* RECENT ACTIVITY SECTION */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityLeft}>
                <Image
                  source={require("../../../assets/images/person2.png")}
                  style={styles.activityImage}
                />
                <View>
                  <Text style={styles.activityName}>Hans Sye</Text>
                  <Text style={styles.activityPhone}>1765324215</Text>
                </View>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.paymentText}>Membayar Birthday</Text>
                <Text style={styles.paymentSubtext}>House Party sebesar</Text>
                <Text style={styles.paymentAmount}>Rp 200.000</Text>
              </View>
            </View>
          </View>
        </View>

        {/* WHITE MODAL CONTAINER */}
        <View style={styles.whiteModalContainer}>
          {/* GROUPS SECTION */}
          <View style={styles.modalSection}>
          <Text style={styles.sectionTitle}>Lihat grup</Text>

          {/* Group Card 1 */}
          <View style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupId}>ID A1001</Text>
              <Text style={styles.groupHost}>Host : You</Text>
            </View>
            <View style={styles.groupContent}>
              <View style={styles.groupAvatars}>
                <Image
                  source={require("../../../assets/images/person1.png")}
                  style={styles.avatar}
                />
                <Image
                  source={require("../../../assets/images/person2.png")}
                  style={[styles.avatar, styles.avatarOverlap]}
                />
                <Image
                  source={require("../../../assets/images/person3.png")}
                  style={[styles.avatar, styles.avatarOverlap]}
                />
                <Image
                  source={require("../../../assets/images/person4.png")}
                  style={[styles.avatar, styles.avatarOverlap]}
                />
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>Holiday</Text>
                <Text style={styles.groupMembers}>4 orang dalam grup ini</Text>
                <TouchableOpacity
                  style={styles.addFriendButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-add-outline" size={14} color={LOCAL_COLORS.headerBrown} />
                  <Text style={styles.addFriendText}>Tambahkan Teman</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Group Card 2 */}
          <View style={[styles.groupCard, { marginTop: 16 }]}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupId}>ID A1002</Text>
              <Text style={styles.groupHost}>Host : Hans</Text>
            </View>
            <View style={styles.groupContent}>
              <View style={styles.groupAvatars}>
                <Image
                  source={require("../../../assets/images/person1.png")}
                  style={styles.avatar}
                />
                <Image
                  source={require("../../../assets/images/person3.png")}
                  style={[styles.avatar, styles.avatarOverlap]}
                />
                <Image
                  source={require("../../../assets/images/person4.png")}
                  style={[styles.avatar, styles.avatarOverlap]}
                />
                <View style={[styles.avatar, styles.avatarOverlap, { opacity: 0 }]} />
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>Travelling</Text>
                <Text style={styles.groupMembers}>3 orang dalam grup ini</Text>
                <TouchableOpacity
                  style={styles.addFriendButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-add-outline" size={14} color={LOCAL_COLORS.headerBrown} />
                  <Text style={styles.addFriendText}>Tambahkan Teman</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

          {/* FRIENDS SECTION */}
          <View style={styles.modalSection}>
          <Text style={styles.sectionTitle}>Lihat Teman</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.friendsScroll}
          >
            {friends.map((friend, index) => (
              <TouchableOpacity
                key={index}
                style={styles.friendItem}
                activeOpacity={0.7}
              >
                <Image
                  source={friend.image}
                  style={styles.friendImage}
                />
                <Text style={styles.friendName}>{friend.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.friendItem} activeOpacity={0.7}>
              <View style={styles.addFriendCircle}>
                <Ionicons name="add" size={28} color={COLORS.white} />
              </View>
              <Text style={styles.friendName}>Tambah teman</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.background,
  },
  purpleSection: {
    backgroundColor: LOCAL_COLORS.background,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  whiteModalContainer: {
    backgroundColor: LOCAL_COLORS.cardWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  welcomeText: {
    justifyContent: "center",
  },
  welcomeSubtext: {
    fontSize: 16,
    color: LOCAL_COLORS.textSecondary,
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: LOCAL_COLORS.textPrimary,
  },
  notificationContainer: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },

  // SECTIONS
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 16,
  },

  // ACTIVITY CARD
  activityCard: {
    backgroundColor: LOCAL_COLORS.cardBrown,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  activityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: LOCAL_COLORS.textPrimary,
  },
  activityPhone: {
    fontSize: 14,
    color: LOCAL_COLORS.textSecondary,
  },
  activityRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  paymentText: {
    fontSize: 16,
    color: LOCAL_COLORS.textPrimary,
  },
  paymentSubtext: {
    fontSize: 14,
    color: LOCAL_COLORS.textSecondary,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: LOCAL_COLORS.textPrimary,
  },

  // GROUP CARDS
  groupCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  groupHeader: {
    backgroundColor: LOCAL_COLORS.headerBrown,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  groupId: {
    color: LOCAL_COLORS.textPrimary,
    fontWeight: "bold",
  },
  groupHost: {
    color: LOCAL_COLORS.textPrimary,
    fontWeight: "bold",
  },
  groupContent: {
    backgroundColor: LOCAL_COLORS.cardWhite,
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  groupAvatars: {
    flexDirection: "row",
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: LOCAL_COLORS.cardWhite,
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: LOCAL_COLORS.textSecondary,
    marginBottom: 8,
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LOCAL_COLORS.cardWhite,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.headerBrown,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  addFriendText: {
    color: LOCAL_COLORS.headerBrown,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },

  // FRIENDS
  friendsScroll: {
    paddingVertical: 8,
  },
  friendItem: {
    alignItems: "center",
    marginRight: 16,
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  friendName: {
    fontSize: 14,
    color: LOCAL_COLORS.textPrimary,
    textAlign: "center",
  },
  addFriendCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: LOCAL_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },


});
