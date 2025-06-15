import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "../../assets/styles/friends.styles";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";
import Loader from "../../components/Loader";

export default function notification() {
  const { token } = useAuthStore();
  return (
    <View>
      <Text>notification</Text>
    </View>
  );
}
