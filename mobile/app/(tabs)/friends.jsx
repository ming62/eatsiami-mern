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

export default function Friends() {
  // State Management
  const { token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const router = useRouter();

  const fetchFriends = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/users/friends`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch friends");
      }

      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", error.message || "Failed to fetch friends");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Friends List
  useEffect(() => {
    fetchFriends();
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

      Alert.alert("Success", "Friend request sent successfully!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", error.message || "Failed to send friend request");
    }
  };

  //friends card for search page
  const renderSearchFriends = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.userInfo}>
        <Image
          source={{ uri: item.profileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleSendFriendRequest(item._id)}
      >
        <Ionicons name="person-add" size={20} color="white" />
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  //friends card for added friends
  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => router.push(`/profile/${item._id}`)}
    >
      <View style={styles.userInfo}>
        <Image
          source={{ uri: item.profileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={() => handleSearch(searchTerm)} //trigger search when press search key
            returnKeyType="search" //show search on keyboard
            placeholderTextColor="#666"
          />
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchFriends}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>

      {/* Friends List Section */}
      <View style={styles.friendsSection}>
        <Text style={styles.sectionTitle}>My Friends</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : friends.length > 0 ? (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            No friends yet. Start adding some!
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
