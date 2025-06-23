import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


export default function FriendDetail() {
  const { friendId } = useLocalSearchParams();
  const { token } = useAuthStore();

  const [friendData, setFriendData] = React.useState(null);
  const [friendFoodcards, setFriendFoodcards] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchFriendData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/${friendId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friend data");
      }

      const data = await response.json();
      setFriendData(data);
    } catch (error) {
      console.error("Error fetching friend data:", error);
      Alert.alert("Error", error.message || "Failed to fetch friend data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendFoodcards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/foodcards/user/${friendId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friend's food cards");
      }

      const data = await response.json();
      setFriendFoodcards(data);
    } catch (error) {
      console.error("Error fetching friend's food cards:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to fetch friend's food cards"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#FFD700" : "rgba(255, 255, 255, 0.5)"}
          style={{ marginRight: 1 }}
        />
      );
    }
    return <View style={styles.ratingStars}>{stars}</View>;
  };

  const renderFoodcard = ({ item }) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() => router.push(`/otherpage/cardDetail?cardId=${item._id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.foodImageContainer}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />

        <View style={styles.overlayContent}>
          <View style={styles.infoBackground} />
          <View style={styles.foodDetails}>
            <View style={styles.ratingContainer}>
              <Text style={styles.foodTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {renderRatingStars(item.rating)}
            </View>
            <Text style={styles.caption} numberOfLines={2}>
              {item.caption}
            </Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text> Loading friend profile...</Text>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (friendId && token) {
      fetchFriendData();
      fetchFriendFoodcards();
    }
  }, [friendId, token]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {friendData?.username || "Friend!"}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={friendFoodcards}
          renderItem={renderFoodcard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="restaurant-outline"
                size={50}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>No foodcards shared yet</Text>
              <Text style={styles.emptySubtext}>
                {friendData?.username} hasn't shared any foodcards yet.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 80,
    justifyContent: "flex-end",
    paddingBottom: 12,
    position: 'relative',
  },

  headerTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    textAlign: "center",
    fontWeight: '1000',
  },

  backButton: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: 15,
  },

  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    fontFamily: 'Konkhmer_Sleokchher-Regular',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  gridContainer: {
    padding: 16,
    paddingBottom: 80,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  foodCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: (width - 64) / 2,
    aspectRatio: 9 / 16,
    overflow: 'hidden',
  },

  foodImageContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.border,
  },

  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1,
  },

  infoBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  foodDetails: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 2,
  },

  ratingContainer: {
    marginBottom: 6,
  },

  foodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'Konkhmer_Sleokchher-Regular',
    marginBottom: 4,
  },

  caption: {
    fontSize: 12,
    color: COLORS.white,
    marginBottom: 4,
    lineHeight: 16,
  },

  date: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.8,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

