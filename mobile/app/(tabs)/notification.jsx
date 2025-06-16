import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import styles from "../../assets/styles/notification.styles";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";
import { Image } from "expo-image";

export default function Notification() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friendRequests, setFriendRequests] = useState({
    incomingReqs: [],
    acceptedReqs: [],
  });
  const fetchFriendRequests = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      const response = await fetch(`${API_URL}/users/friend-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch friend requests");
      }

      setFriendRequests({
        incomingReqs: data.incomingReqs || [],
        acceptedReqs: data.acceptedReqs || [],
      });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleFriendRequest = async (requestId, action) => {
    try {
      const response = await fetch(
        `${API_URL}/users/friend-request/${requestId}/${action}`,
        {
          method: action === "delete" ? "DELETE" : "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} friend request`);
      }

      setFriendRequests((prev) => ({
        ...prev,
        incomingReqs: prev.incomingReqs.filter(
          (request) => request._id !== requestId
        ),
      }));
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
    }
  };

  const onRefresh = useCallback(() => {
    fetchFriendRequests(true);
  }, []);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  const renderIncomingRequest = ({ item }) => {
    return (
      <View style={styles.requestCard}>
        <Image
          source={{ uri: item.sender.profileImage }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.notificationName}>{item.sender.username}</Text>
          <Text style={styles.notificationText}>sent you a friend request</Text>
          <Text style={styles.notificationTime}>
            {formatPublishDate(item.createdAt)}
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleFriendRequest(item._id, "accept")}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              Alert.alert(
                "Confirm Delete",
                "Are you sure you want to delete this friend request?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleFriendRequest(item._id, "delete"),
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAcceptedRequest = ({ item }) => {
    return (
      <View style={styles.requestCard}>
        <Image
          source={{ uri: item.recipient.profileImage }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.notificationName}>{item.recipient.username}</Text>
          <Text style={styles.notificationText}>
            has accepted your friends request
          </Text>
          <Text style={styles.notificationTime}>
            {formatPublishDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={[...incomingRequests, ...acceptedRequests]}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isIncoming = incomingRequests.some(
              (req) => req._id === item._id
            );
            return isIncoming
              ? renderIncomingRequest({ item })
              : renderAcceptedRequest({ item });
          }}
          ListHeaderComponent={
            <>
              {incomingRequests.length > 0 && (
                <Text style={styles.requestTitle}>Friend Requests</Text>
              )}
              {incomingRequests.length === 0 &&
                acceptedRequests.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No notifications</Text>
                  </View>
                )}
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={styles.scrollContainer}
        />
      )}
    </SafeAreaView>
  );
}
