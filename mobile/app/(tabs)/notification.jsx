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
  const [Notification, setNotification] = useState({
    pendingFriendReqs: [],
    pendingJioReqs: [],
    acceptedFriendReqs: [],
    acceptedJioRequest: [],
    rejectedJioRequest: [],
  });

  const fetchNotification = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      const response = await fetch(`${API_URL}/users/notification`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch friend requests");
      }

      setNotification({
        pendingFriendReqs: data.pendingFriendReqs || [],
        pendingJioReqs: data.pendingJioReqs || [],
        acceptedFriendReqs: data.acceptedFriendReqs || [],
        acceptedJioRequest: data.acceptedJioRequest || [],
        rejectedJioRequest: data.rejectedJioRequest || [],
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

      setNotification((prev) => ({
        ...prev,
        pendingFriendReqs: prev.pendingFriendReqs.filter(
          (request) => request._id !== requestId
        ),
      }));
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
    }
  };

  const handleJioRequest = async (requestId, action) => {
    try {
      const response = await fetch(
        `${API_URL}/users/jio-request/${requestId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} friend request`);
      }

      setNotification((prev) => ({
        ...prev,
        pendingJioReqs: prev.pendingJioReqs.filter(
          (request) => request._id !== requestId
        ),
      }));
    } catch (error) {
      console.error(`Error ${action}ing jio request:`, error);
    }
  };

  const onRefresh = useCallback(() => {
    fetchNotification(true);
  }, []);

  useEffect(() => {
    fetchNotification();
  }, []);

  const pendingFriendReqs = Notification?.pendingFriendReqs || [];
  const pendingJioReqs = Notification?.pendingJioReqs || [];
  const otherNotification = [
    ...Notification.acceptedFriendReqs.map((item) => ({
      ...item,
      type: "acceptedFriend",
    })),
    ...Notification.acceptedJioRequest.map((item) => ({
      ...item,
      type: "acceptedJio",
    })),
    ...Notification.rejectedJioRequest.map((item) => ({
      ...item,
      type: "rejectedJio",
    })),
  ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const renderFriendRequest = ({ item }) => {
    return (
      <View style={styles.requestCard}>
        <Image
          source={{ uri: item.sender.profileImage }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <View style={styles.time}>
            <Text style={styles.notificationName}>{item.sender.username}</Text>
            <Text style={styles.notificationTime}>
              {formatPublishDate(item.createdAt)}
            </Text>
          </View>
          <Text style={styles.notificationText}>sent you a friend request</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleFriendRequest(item._id, "accept")}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
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
            <Ionicons name="trash-outline" size={24} color="#6A6968" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderJioRequest = ({ item }) => {
    return (
      <View style={styles.requestCard}>
        <Image
          source={{ uri: item.sender.profileImage }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <View style={styles.time}>
            <Text style={styles.notificationName}>{item.sender.username}</Text>
            <Text style={styles.notificationTime}>
              {formatPublishDate(item.createdAt)}
            </Text>
          </View>
          <Text style={styles.notificationText}>jio you for a meal!</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleJioRequest(item._id, "accept")}
          >
            <Text style={styles.buttonText}>gogogo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                "Confirm Delete",
                "Are you sure you don't want to jia beng?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleJioRequest(item._id, "reject"),
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#6A6968" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOtherNotification = ({ item }) => {
    const isFriendRequest = item.type === "acceptedFriend";
    const isJioAccepted = item.type === "acceptedJio";
    const isJioRejected = item.type === "rejectedJio";

    return (
      <View style={styles.requestCard}>
        <Image
          source={{ uri: item.recipient.profileImage }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <View style={styles.time}>
            <Text style={styles.notificationName}>
              {item.recipient.username}
            </Text>
            <Text style={styles.notificationTime}>
              {formatPublishDate(item.createdAt)}
            </Text>
          </View>
          <Text style={styles.notificationText}>
            {isFriendRequest
              ? "accepted your friend request"
              : isJioAccepted
                ? "accepted your jio request!"
                : isJioRejected
                  ? "don't want jia beng"
                  : null}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification</Text>
        <View style={styles.grayBlock} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={[...pendingFriendReqs, ...pendingJioReqs, ...otherNotification]}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            if (pendingFriendReqs.some((req) => req._id === item._id)) {
              return renderFriendRequest({ item });
            }
            if (pendingJioReqs.some((req) => req._id === item._id)) {
              return renderJioRequest({ item });
            }
            if (otherNotification.some((req) => req._id === item._id)) {
              return renderOtherNotification({ item });
            }
            return null;
          }}
          ListHeaderComponent={
            <>
              {pendingFriendReqs.length > 0 && (
                <Text style={styles.requestTitle}>Friend Requests</Text>
              )}
              {pendingFriendReqs.length === 0 &&
                pendingJioReqs.length === 0 &&
                otherNotification.length === 0 && (
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
