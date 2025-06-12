import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import COLORS from "../../constants/colors";

import homeIcon from "../../assets/images/home.png";
import friendsIcon from "../../assets/images/friends.png";
import notifIcon from "../../assets/images/notification.png";
import profileIcon from "../../assets/images/profile.png";

import { Image } from "react-native";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "600",
          fontFamily: "Konkhmer_Sleokchher-Regular",
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={homeIcon}
              style={{
                width: 30,
                height: 30,
                tintColor: focused ? COLORS.primary : COLORS.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ focused }) => (
            <Image
              source={friendsIcon}
              style={{
                width: 30,
                height: 30,
                tintColor: focused ? COLORS.primary : COLORS.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: COLORS.primary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 0,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 36,
                  fontWeight: "bold",
                  lineHeight: 36,
                }}
              >
                +
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarLabel: "Notifications",
          tabBarIcon: ({ focused }) => (
            <Image
              source={notifIcon}
              style={{
                width: 30,
                height: 30,
                tintColor: focused ? COLORS.primary : COLORS.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Image
              source={profileIcon}
              style={{
                width: 30,
                height: 30,
                tintColor: focused ? COLORS.primary : COLORS.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
