import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "@/store/billStore";
import { useApi, useFriends } from "@/hooks/useApi";
import { Colors } from '../../constants/Colors';

export default function MemberOfBills() {
  const { draft, setSelectedMembers } = useBillStore();
  const [tab, setTab] = useState<"Group" | "Teman">("Group");
  const [selected, setSelected] = useState<string[]>(draft.selectedMemberIds);
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  const { getGroups } = useApi();
  const { friends, loading: loadingFriends } = useFriends();
  
  const filteredFriends = useMemo(() => {
    if (!searchText.trim()) return friends;
    return friends.filter(f => {
      const name = f.friend?.name || f.name || '';
      return name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [friends, searchText]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const canConfirm = selected.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Pilih Anggota</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          {(["Group", "Teman"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.pill, tab === t && styles.pillActive]}>
              <Text style={[styles.pillText, tab === t && styles.pillActiveText]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        
        {tab === "Teman" && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari teman..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        )}

        {tab === "Group" ? (
          loadingGroups ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00897B" />
              <Text style={styles.loadingText}>Memuat grup...</Text>
            </View>
          ) : (
            <View>
              {groups.map((item) => {
                const memberIds = item.members?.map((m: any) => m.userId || m.id) || [];
                return (
                  <Pressable key={item.groupId} onPress={() => setSelected(memberIds)} style={styles.row}>
                    <Text style={styles.groupName}>{item.groupName}</Text>
                    <Text style={styles.memberCount}>({memberIds.length} anggota)</Text>
                  </Pressable>
                );
              })}
            </View>
          )
        ) : (
          loadingFriends ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00897B" />
              <Text style={styles.loadingText}>Memuat teman...</Text>
            </View>
          ) : (
            <View>
              {filteredFriends.map((item) => {
                const friendId = item.friend?.userId || item.id;
                const friendName = item.friend?.name || item.name;
                return (
                  <Pressable key={friendId} onPress={() => toggle(friendId)} style={styles.row}>
                    <Text style={styles.friendName}>{friendName}</Text>
                    <Text style={styles.checkmark}>{selected.includes(friendId) ? "✓" : ""}</Text>
                  </Pressable>
                );
              })}
            </View>
          )
        )}

        <Pressable
          disabled={!canConfirm}
          onPress={() => { setSelectedMembers(selected); router.push("/create-bill/split-bill"); }}
          style={[styles.confirmButton, { opacity: canConfirm ? 1 : 0.5 }]}
        >
          <Text style={styles.confirmText}>Konfirmasi</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  header: {
    backgroundColor: '#00897B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    backgroundColor: Colors.white,
  },
  pillActive: {
    backgroundColor: '#E6FFF3',
    borderColor: '#20C997',
  },
  pillText: {
    fontSize: 14,
    color: Colors.text,
  },
  pillActiveText: {
    color: '#20C997',
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
  },
  groupName: {
    fontWeight: "600",
    fontSize: 16,
    color: Colors.text,
  },
  memberCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  friendName: {
    fontSize: 16,
    color: Colors.text,
  },
  checkmark: {
    fontSize: 16,
    color: '#20C997',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  confirmButton: {
    backgroundColor: '#00897B',
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  confirmText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});