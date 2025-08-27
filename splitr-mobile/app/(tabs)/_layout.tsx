import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, Text, Image } from "react-native";
import { router, usePathname } from "expo-router";
import { COLORS } from "../../constants/theme";

function CustomTabBar() {
  const pathname = usePathname();
  const isHome = pathname === "/home" || pathname === "/";
  const isMonitoring = pathname.includes("/monitoring");
  // Removed unused payment route checks
  const isBill = pathname.includes("/bill") || pathname.includes("/create-bill");

  if (isBill) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
        onPress={() => !isHome && router.push("/(tabs)/home")}
      >
        {isHome && (
          <View
            style={{
              width: 60,
              height: 4,
              backgroundColor: "#FF8500",
              borderRadius: 2,
              marginBottom: 4,
            }}
          />
        )}
        <Ionicons
          name="home"
          size={24}
          color={isHome ? "#000000" : "#666666"}
        />
        <Text
          style={{
            fontSize: 12,
            marginTop: 4,
            color: isHome ? "#000000" : "#666666",
            fontWeight: isHome ? "600" : "400",
          }}
        >
          Beranda
        </Text>
      </TouchableOpacity>

      <View
        style={{
          alignItems: "center",
          marginTop: -50,
        }}
      >
        <TouchableOpacity
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
          }}
          onPress={() => router.push("/create-bill")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.orange} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 12,
            color: "#000000",
            marginTop: 4,
            fontWeight: "600",
          }}
        >
          Buat Tagihan
        </Text>
      </View>

      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
        onPress={() => !isMonitoring && router.push("/(tabs)/monitoring")}
      >
        {isMonitoring && (
          <View
            style={{
              width: 60,
              height: 4,
              backgroundColor: "#FF8500",
              borderRadius: 2,
              marginBottom: 4,
            }}
          />
        )}
        <Ionicons
          name="stats-chart"
          size={24}
          color={isMonitoring ? "#000000" : "#666666"}
        />
        <Text
          style={{
            fontSize: 12,
            marginTop: 4,
            color: isMonitoring ? "#000000" : "#666666",
            fontWeight: isMonitoring ? "600" : "400",
          }}
        >
          Aktivitas
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const pathname = usePathname();

  // Hide tab bar on group-related pages and bill pages
  const hideTabBar =
    pathname.includes("/groups") ||
    pathname.includes("/group-detail") ||
    pathname.includes("/create-group") ||
    pathname.includes("/bill") ||
    pathname.includes("/create-bill");

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Beranda",
          }}
        />
        <Tabs.Screen
          name="monitoring"
          options={{
            title: "Aktivitas",
          }}
        />



      </Tabs>
      {!hideTabBar && <CustomTabBar />}
    </>
  );
}
