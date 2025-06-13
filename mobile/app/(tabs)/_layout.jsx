import { View, Text, TouchableOpacity} from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

import homeIcon from "../../assets/images/home.png";
import friendsIcon from "../../assets/images/friends.png";
import notifIcon from "../../assets/images/notification.png";
import profileIcon from "../../assets/images/profile.png";

import { Image } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 2,

          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          fontFamily: "Konkhmer_Sleokchher-Regular",
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={0.8} 
            style={[props.style, { flex: 1 }]}
          />)
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
              <Ionicons
                name="home-outline"
                size={30}
                color={focused ? COLORS.primary : COLORS.textSecondary}
                resizeMode="contain"
              />
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
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="people-outline"
              size={30}
              color={focused ? COLORS.primary : COLORS.textSecondary}
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
            <Ionicons
              name="add"
              size={30}
              color={COLORS.white}
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
          tabBarLabel: "Notifications",
          tabBarIconStyle: {
            marginTop: 3,
          },
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="notifications-outline"
              size={30}
              color={focused ? COLORS.primary : COLORS.textSecondary}
              resizeMode="contain"
            />
          ),
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
            <Ionicons
              name="person-outline"
              size={30}
              color={focused ? COLORS.primary : COLORS.textSecondary}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
