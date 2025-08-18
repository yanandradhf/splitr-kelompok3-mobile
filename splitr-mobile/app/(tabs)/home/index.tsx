// app/(tabs)/home/index.tsx
import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

type Activity = {
  id: string;
  name: string;
  account: string;
  description: string;
  avatar?: string;
};

type Group = {
  id: string;
  name: string;
  membersCount: number;
  host: 'you' | 'other';
  cover?: string;
};

const COLORS = {
  teal: '#7ADFD6',
  tealDark: '#57C8BF',
  bg: '#F2F4F7',
  white: '#FFFFFF',
  title: '#111827',
  subtitle: '#667085',
  primary: '#FF7A00',
  border: '#E4E7EC',
  icon: '#98A2B3',
  shadow: '#000000',
};

const ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    name: 'Hans Sye',
    account: '1765324215',
    description: 'Membayar Birthday House Party sebesar Rp 200.000',
    avatar:
      'https://i.pravatar.cc/80?img=14', // ganti ke aset kamu jika perlu
  },
];

const GROUPS: Group[] = [
  { id: 'g1', name: 'Holiday', membersCount: 4, host: 'you' },
  { id: 'g2', name: 'Holiday', membersCount: 3, host: 'other' },
];

export default function HomeScreen() {
  const user = useMemo(() => ({ name: 'Ivana', avatar: 'https://i.pravatar.cc/80?img=5' }), []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* HEADER */}
        <View style={styles.hero}>
          {/* top row: logo kiri, sapaan kanan */}
          <View style={styles.heroTopRow}>
            <Image
              source={require('../../../assets/images/splitr.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <View style={styles.welcomeWrap}>
              <Avatar size={36} uri={user.avatar} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.welcomeSmall}>Hi, Welcome Back!</Text>
                <Text style={styles.welcomeName}>{user.name}</Text>
              </View>
            </View>
          </View>

          {/* Aktivitas Terbaru */}
          <Text style={styles.sectionTitleHero}>Aktivitas Terbaru</Text>
          {ACTIVITIES.map((a) => (
            <View key={a.id} style={styles.activityCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Avatar size={40} uri={a.avatar} />
                <View>
                  <Text style={styles.activityName}>{a.name}</Text>
                  <Text style={styles.activityAcct}>{a.account}</Text>
                </View>
              </View>
              <Text style={styles.activityDesc}>{a.description}</Text>
            </View>
          ))}
        </View>

        {/* BODY (white) */}
        <View style={styles.body}>
          <Text style={styles.bodyTitle}>Buat grup</Text>

          {/* Group cards */}
          <View style={{ gap: 16 }}>
            {GROUPS.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/monitoring/group/[id]', params: { id: g.id } })
                }
              />
            ))}
          </View>

          {/* Quick actions */}
          <View style={styles.quickGrid}>
            <QuickAction
              label="Unggah Struk"
              icon="scan-outline"
              onPress={() => router.push('/(modals)/pick-my-bill')}
            />
            <QuickAction
              label="Buat Bill"
              icon="reader-outline"
              onPress={() => router.push('/(tabs)/home/split')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
 * Subcomponents
 * =======================*/

function Avatar({ size = 40, uri }: { size?: number; uri?: string }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.border,
      }}
    />
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
      style={({ pressed }) => [styles.groupCard, pressed && { opacity: 0.9 }]}
    >
      {/* pill host di atas */}
      <View style={styles.hostPillWrap}>
        <View style={styles.hostPill}>
          <Text style={styles.hostPillText}>
            Host : {group.host === 'you' ? 'You' : 'Hans'}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* foto grup (avatar bundar berisi beberapa orang) */}
        <View style={styles.groupAvatarWrap}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=60' }}
            style={styles.groupAvatar}
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&q=60' }}
            style={[styles.groupAvatar, { marginLeft: -18 }]}
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&q=60' }}
            style={[styles.groupAvatar, { marginLeft: -18 }]}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.groupTitle}>{group.name}</Text>
          <Text style={styles.groupSubtitle}>
            {group.membersCount} orang dalam grup ini
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={COLORS.icon} />
      </View>
    </Pressable>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.9 }]}>
      <View style={styles.quickIconWrap}>
        <Ionicons name={icon} size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

/* =========================
 * Styles
 * =======================*/

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 28 },

  // HEADER
  hero: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoImage: {
    width: 120,
    height: 40,
  },

  welcomeWrap: { flexDirection: 'row', alignItems: 'center' },
  welcomeSmall: { color: '#0F172A', fontSize: 11, opacity: 0.8 },
  welcomeName: { color: '#0F172A', fontSize: 12, fontWeight: '700' },

  sectionTitleHero: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    // shadow
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  activityName: { fontSize: 14, fontWeight: '700', color: COLORS.title },
  activityAcct: { fontSize: 12, color: COLORS.subtitle },
  activityDesc: { fontSize: 12, color: COLORS.title, fontWeight: '600' },

  // BODY WHITE
  body: {
    marginTop: -10, // sedikit menumpuk ke header (sesuai desain)
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 18,
  },
  bodyTitle: {
    alignSelf: 'center',
    color: COLORS.title,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },

  // GROUP CARD
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    // shadow
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  hostPillWrap: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  hostPill: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  hostPillText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },

  groupAvatarWrap: { flexDirection: 'row', alignItems: 'center' },
  groupAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: COLORS.white },
  groupTitle: { color: COLORS.title, fontSize: 16, fontWeight: '700' },
  groupSubtitle: { color: COLORS.subtitle, fontSize: 12, marginTop: 2 },

  // QUICK ACTIONS
  quickGrid: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    // shadow ringan
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  quickIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    marginBottom: 8,
  },
  quickLabel: { fontSize: 13, fontWeight: '700', color: COLORS.title },
});
