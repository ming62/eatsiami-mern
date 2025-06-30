import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import COLORS from "../constants/colors";
import { useAuthStore } from "../store/authStore";

export default function LogoutButton() {
  const { logout } = useAuthStore();

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => logout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
      <Ionicons
        name="log-out"
        size={20}
        color="#fff"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
