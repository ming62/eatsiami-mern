import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LogoutButton from "../../../components/LogoutButton";
import { useRouter } from "expo-router";

export default function MorePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => router.push("../more/updateUser")}
            style={styles.card}
          >
            <Ionicons name="person" size={24} color="#000" />
            <Text> Edit Profile </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("../more/privacy")}
            style={styles.card}
          >
            <Ionicons name="key" size={24} color="#000" />
            <Text> Privacy </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("../more/AIreport")}
            style={styles.card}
          >
            <Ionicons name="analytics" size={24} color="#000" />
            <Text> AI report </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/*Logout Button */}
      <View style={styles.footer}>
        <LogoutButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
    paddingHorizontal: 20,
  },
  header: {
    flex: 1,
  },
  backButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  cardContainer: {
    marginTop: 20,
    alignItems: "flex-start",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 15,
    borderRadius: 15,
    width: "100%",
  },
  footer: {
    paddingVertical: 35,
    alignItems: "center",
  },
});
