import { View, Text, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { useNotificationStore } from "../../store/notificationStore";
import { useAuthStore } from "../../store/authStore";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: 75 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 5,
          paddingLeft: 10,
          paddingRight: 10,
          borderTopWidth: 5,
          elevation: 24,
          borderColor: "transparent",
          borderRadiusColor: "transparent",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          fontFamily: "Konkhmer_Sleokchher-Regular",
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={0.8}
            style={[props.style, { flex: 1 }]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIconStyle: {
            marginTop: 3,
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                marginTop: 10,
                width: 60,
                height: 60,
                borderRadius: 16,
                backgroundColor: focused ? COLORS.primary : "transparent",
                justifyContent: "center",
                alignItems: "center",
                elevation: focused ? 5 : 0,
              }}
            >
              <Ionicons
                name="home"
                size={30}
                color={focused ? COLORS.white : COLORS.textSecondary}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIconStyle: {
            marginTop: 3,
          },
          tabBarIcon: ({ focused }) => {
            const badgeCount = useAuthStore((s) => s.unreadChannelCount);

            return (
              <View
                style={{
                  marginTop: 10,
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  backgroundColor: focused ? COLORS.primary : "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                  elevation: focused ? 5 : 0,
                }}
              >
                <Ionicons
                  name="people"
                  size={30}
                  color={focused ? COLORS.white : COLORS.textSecondary}
                  resizeMode="contain"
                />
                {badgeCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 10,
                      backgroundColor: "red",
                      borderRadius: 8,
                      paddingHorizontal: 5,
                      paddingVertical: 1,
                      minWidth: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIconStyle: {
            marginTop: 3,
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                marginTop: 10,
                width: 60,
                height: 60,
                borderRadius: 16,
                backgroundColor: focused ? COLORS.primary : "transparent",
                justifyContent: "center",
                alignItems: "center",
                elevation: focused ? 5 : 0,
              }}
            >
              <Ionicons
                name="add-circle"
                size={30}
                color={focused ? COLORS.white : COLORS.textSecondary}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarIconStyle: {
            marginTop: 3,
          },
          tabBarIcon: ({ focused }) => {
            const badgeCount = useNotificationStore((s) => s.badgeCount);

            return (
              <View
                style={{
                  marginTop: 10,
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  backgroundColor: focused ? COLORS.primary : "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                  elevation: focused ? 5 : 0,
                }}
              >
                <Ionicons
                  name="notifications"
                  size={30}
                  color={focused ? COLORS.white : COLORS.textSecondary}
                />
                {badgeCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 10,
                      backgroundColor: "red",
                      borderRadius: 8,
                      paddingHorizontal: 5,
                      paddingVertical: 1,
                      minWidth: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIconStyle: {
            marginTop: 3,
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                marginTop: 10,
                width: 60,
                height: 60,
                borderRadius: 16,
                backgroundColor: focused ? COLORS.primary : "transparent",
                justifyContent: "center",
                alignItems: "center",
                elevation: focused ? 5 : 0,
              }}
            >
              <Ionicons
                name="person"
                size={30}
                color={focused ? COLORS.white : COLORS.textSecondary}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
