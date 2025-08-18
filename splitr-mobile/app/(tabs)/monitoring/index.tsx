// app/(tabs)/monitoring/index.tsx
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

type Group = { id: string; name: string; membersCount: number };

const COLORS = {
  bg: '#F2F4F7',          // abu muda (background)
  primary: '#FF7A00',     // oranye header & aksen
  cardBorder: '#E4E7EC',  // garis tepi kartu
  title: '#111827',       // teks judul
  subtitle: '#667085',    // teks subjudul
  icon: '#98A2B3',        // chevron
};

const DATA: Group[] = [
  { id: '1', name: 'Grup 1', membersCount: 5 },
  { id: '2', name: 'Grup 2', membersCount: 3 },
  { id: '3', name: 'Grup 3', membersCount: 6 },
  { id: '4', name: 'Grup 4', membersCount: 2 },
  { id: '5', name: 'Grup 5', membersCount: 7 },
];

export default function MonitoringIndex() {
  const [groups, setGroups] = useState<Group[]>(DATA);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: ganti dengan API asli (getGroups())
    await new Promise((r) => setTimeout(r, 600));
    setGroups([...DATA]);
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }: { item: Group }) => (
    <GroupCard
      group={item}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/monitoring/group/[id]',
          params: { id: item.id },
        })
      }
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header oranye dengan sudut bawah melengkung */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Grup</Text>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Belum ada grup</Text>
            <Text style={styles.emptyText}>
              Buat grup baru untuk mulai memonitor tagihan.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function GroupCard({
  group,
  onPress,
}: {
  group: Group;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`Buka ${group.name}`}
    >
      {/* Garis aksen oranye di kiri */}
      <View style={styles.cardAccent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{group.name}</Text>
        <Text style={styles.cardSubtitle}>
          {group.membersCount} orang dalam grup ini
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={COLORS.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // HEADER
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  // LIST
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },

  // CARD
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    // shadow iOS
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    // shadow Android
    elevation: 3,
  },
  cardAccent: {
    width: 6,
    alignSelf: 'stretch',     // garis vertikal penuh di sisi kiri
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginVertical: 6,        // beri jarak dari tepi kartu (sesuai desain)
  },
  cardTitle: {
    color: COLORS.title,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: COLORS.subtitle,
    fontSize: 13,
  },

  // EMPTY STATE
  emptyWrap: {
    marginTop: 48,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.subtitle,
  },
});
