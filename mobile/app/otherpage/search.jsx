import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import styles from "../../assets/styles/friends.styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";

export default function SearchScreen() {
  const { token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [outgoingRequestIds, setOutgoingRequestIds] = useState(new Set());

  const router = useRouter();

  const handleBack = () => {
    setSearchTerm("");
    setSearchResults([]);
    router.back();
  };

  const fetchOutgoingRequests = async () => {
    try {
      const response = await fetch(
        `${API_URL}/users/outgoing-friend-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch outgoing requests"
        );
      }

      const data = await response.json();

      const ids = new Set(data.map((req) => req.recipient._id));
      setOutgoingRequestIds(ids);
    } catch (error) {
      console.error("Error fetching outgoing requests:", error);
    }
  };

  useEffect(() => {
    fetchOutgoingRequests();
  }, []);

  // Search Users
  const handleSearch = async (text) => {
    setSearchTerm(text);

    //check is not emtpy string
    if (text.trim()) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_URL}/users/search?username=${text}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Search failed");
        }

        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching users:", error);
        Alert.alert("Error", error.message || "Failed to search users");
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Send Friend Request
  const handleSendFriendRequest = async (userId) => {
    try {
      const response = await fetch(
        `${API_URL}/users/friend-request/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send friend request");
      }

      setOutgoingRequestIds((prev) => new Set(prev).add(userId));

      Alert.alert("Success", "Friend request sent successfully!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", error.message || "Failed to send friend request");
    }
  };

  //friends card for search page
  const renderSearchFriends = ({ item }) => {
    const requestAlreadySent = outgoingRequestIds.has(item._id);
    return (
      <View style={styles.friendCard}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() =>
            router.push(`/otherpage/friendDetail?friendId=${item._id}`)
          }
        >
          <Image
            source={{ uri: item.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>
            {item.username.length > 15
              ? item.username.slice(0, 12) + "..."
              : item.username}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addButton,
            requestAlreadySent && { backgroundColor: "#d3d3d3" },
          ]}
          onPress={() => handleSendFriendRequest(item._id)}
          disabled={requestAlreadySent}
        >
          <Text style={styles.buttonText}>
            {requestAlreadySent ? "Requested" : "Add"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Similar to Friends page */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      {/* Search Section - Similar to Friends page */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={30}
          color={COLORS.textSecondary}
          style={{ marginLeft: 5 }}
        />
        <TextInput
          style={styles.searchText}
          placeholder="search by username..."
          accessibilityLabel="search bar"
          value={searchTerm}
          onChangeText={handleSearch}
          onSubmitEditing={() => handleSearch(searchTerm)}
          returnKeyType="search"
          placeholderTextColor={COLORS.textSecondary}
          autoFocus={true}
        />
      </View>

      {/* Search Results */}
      <View style={styles.friendsSection}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchFriends}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            {searchTerm.trim()
              ? "No users found"
              : "Start searching for friends"}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
