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
import COLORS from "../../../constants/colors";
import { useRouter } from "expo-router";

export default function MorePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.white}
            style={{ marginTop: 10, marginLeft: 10 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.rightSpace} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => router.push("../more/updateUser")}
            style={styles.card}
          >
            <Ionicons name="person" size={24} color="#000" />
            <Text style={styles.LabelText}> Edit Profile </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("../more/privacy")}
            style={styles.card}
          >
            <Ionicons name="key" size={24} color="#000" />
            <Text style={styles.LabelText}> Privacy </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("../more/AIreport")}
            style={styles.card}
          >
            <Ionicons name="analytics" size={24} color="#000" />
            <Text style={styles.LabelText}> AI report </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("(auth)/forgotPassword")}
            style={styles.card}
          >
            <Ionicons name="refresh-circle" size={24} color="#000" />
            <Text style={styles.LabelText}> Reset Password </Text>
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
    flexGrow: 1,
    backgroundColor: "#eee",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 70,
    paddingTop: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginLeft: 0,
  },
  headerTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    textAlign: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  rightSpace: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
  LabelText: {
    fontSize: 14,
    color: COLORS.lightBlackText,
    marginLeft: 10,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
});
