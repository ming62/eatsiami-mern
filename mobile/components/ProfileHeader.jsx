import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import COLORS from "../constants/colors";
import { Image } from "expo-image";
import { formatMemberSince } from "../lib/utils";
import LogoutButton from "../components/LogoutButton";
import { useRouter } from "expo-router";

export default function ProfileHeader({ userData, showMore }) {
  const { user: currentUser } = useAuthStore();
  const user = userData || currentUser;
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.profileHeader}>
      {showMore && (
        <View style={styles.menuIconContainer}>
          <TouchableOpacity
            onPress={() => router.push("/otherpage/more/morePage")}
          >
            <Ionicons name="menu-outline" size={30} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      )}

      <Image source={{ uri: user.profileImage }} style={styles.profileImage} />

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        {user.bio !== "Introduce yourself..." ? (
          <Text style={styles.bio}>{user.bio}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    position: "relative",
    marginBottom: 32,
  },

  logoutButtonContainer: {
    position: "absolute",
    top: 4,
    right: 16,
    zIndex: 10,
  },
  bio: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    fontFamily: "Figtree",
    marginTop: -10,
    marginBottom: 15,
  },
  menuIconContainer: {
    position: "absolute",
    top: 4,
    right: 16,
    zIndex: 10,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.black,
    alignSelf: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },

  profileInfo: {
    alignItems: "center",
    justifyContent: "center",
  },

  username: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.grayDark,
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
});
