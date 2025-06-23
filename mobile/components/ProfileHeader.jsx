import { View, Text } from "react-native";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import COLORS from "../constants/colors";
import { Image } from "expo-image";
import { formatMemberSince } from "../lib/utils";
import LogoutButton from "../components/LogoutButton";

export default function ProfileHeader({ userData, showLogout}) {
  const { user: currentUser } = useAuthStore();
  const user = userData || currentUser;

  if (!user) {
    return null;
  }

  return (
    <View style={styles.profileHeader}>
      <Image source={{ uri: user.profileImage }} style={styles.profileImage} />

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <View style={styles.upperHeader}>
          <Text style={styles.memberSince}>
            Joined {formatMemberSince(user.createdAt)}
          </Text>
          <LogoutButton />
        </View>
      </View>
    </View>
  );
}
