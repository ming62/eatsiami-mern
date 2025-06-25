import { View, Text, StyleSheet } from "react-native";
import { useAuthStore } from "../store/authStore";
import COLORS from "../constants/colors";
import { Image } from "expo-image";
import { formatMemberSince } from "../lib/utils";
import LogoutButton from "../components/LogoutButton";

export default function ProfileHeader({ userData, showLogout }) {
  const { user: currentUser } = useAuthStore();
  const user = userData || currentUser;

  if (!user) {
    return null;
  }

  return (
    <View style={styles.profileHeader}>
      {showLogout && (
        <View style={styles.logoutButtonContainer}>
          <LogoutButton />
        </View>
      )}
      
      <Image source={{ uri: user.profileImage }} style={styles.profileImage} />

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>

        <Text style={styles.memberSince}>
          Joined {formatMemberSince(user.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: "#2c2c2c",
    position: "relative", 
    marginBottom: 32,
  },

  logoutButtonContainer: {
    position: "absolute",
    top: 4,
    right: 16,
    zIndex: 10, 
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "black", 
    marginBottom: 12,
    alignSelf: "center",
    marginTop: 10, 
  },

  profileInfo: {
    alignItems: "center",
    justifyContent: "center",
  },

  username: {
    fontSize: 24,
    fontWeight: "600", 
    color: COLORS.white,
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular",
    marginBottom: 8,
  },

  memberSince: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginTop: -10,
  },


});