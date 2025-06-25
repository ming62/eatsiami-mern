import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  Touchable,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
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
      <Ionicons name="log-out" size={20} color="#2c2c2c" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: COLORS.white,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: 8,
    paddingRight: 8,
    elevation: 2,
  },
});
