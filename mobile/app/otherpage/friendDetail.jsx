import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import ProfileHeader from "../../components/ProfileHeader";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const initialLayout = { width: Dimensions.get("window").width };

export default function FriendDetail() {
  const router = useRouter();
  const { friendId } = useLocalSearchParams();
  const { token } = useAuthStore();

  const [friendData, setFriendData] = useState(null);
  const [friendFoodcards, setFriendFoodcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([{ key: "foodcards", title: "Foodcards" }]);

  const fetchFriendData = async () => {
    try {
      
      setLoading(true);
      const response = await fetch(`${API_URL}/users/${friendId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        Alert.alert(
          "Private Profile",
          "This user's profile is only visible to friends.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch friend data");
      }

      const data = await response.json();
      setFriendData(data);
    } catch (error) {
      console.error("Error fetching friend data:", error);
      Alert.alert("Error", error.message || "Failed to fetch friend data");
      router.back();
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFriendData(), fetchFriendFoodcards()]);
    setRefreshing(false);
  };

  const renderFoodcard = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/otherpage/cardDetail?cardId=${item._id}`)}
        activeOpacity={0.8}
        style={styles.foodcard}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />

          <LinearGradient
            colors={[
              "transparent",
              "transparent",
              "transparent",
              "rgba(0,0,0,0.2)",
              "rgba(0,0,0,0.6)",
              "rgba(0,0,0,0.8)",
            ]}
            locations={[0, 0.5, 0.7, 0.8, 0.9, 1]}
            style={styles.gradientOverlay}
          >
            <View style={styles.foodcardDetails}>
              <Text style={styles.foodcardTitle}>{item.title}</Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  const FoodcardsRoute = () => (
    <FlatList
      key={"2-columns"}
      data={friendFoodcards}
      renderItem={renderFoodcard}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyListContainer}>
          <Ionicons
            name="fast-food-outline"
            size={50}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyListText}>No foodcards found.</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/create")}
          >
            <Text style={styles.addButtonText}>Add Foodcard</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );

  useEffect(() => {
    if (friendId && token) {
      fetchFriendData();
      fetchFriendFoodcards();
    }
  }, [friendId, token]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading friend profile...</Text>
      </SafeAreaView>
    );
  }

  const renderScene = SceneMap({
    foodcards: FoodcardsRoute,
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
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

      <ProfileHeader userData={friendData} showMore={false} />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        style={styles.tabView}
        renderTabBar={() => (
          <View style={{ backgroundColor: "white", elevation: 20 }}>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                  backgroundColor: COLORS.primary,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  Foodcard
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c2c2c",
  },

  header: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 70,
    justifyContent: "flex-end",
    paddingTop: 10,
    position: "relative",
  },

  headerTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    textAlign: "center",
    fontWeight: 1000,
  },

  backButton: {
    position: "absolute",
    left: 20,
    top: "50%",
    marginTop: -12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  foodcard: {
    borderRadius: 16,
    marginBottom: 50,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    width: "48%",
    aspectRatio: 9 / 16,
    overflow: "hidden",
    alignSelf: "center",
    backgroundColor: COLORS.cardBackground,
  },

  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.border,
  },

  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    borderRadius: 16,
  },

  foodcardDetails: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    marginTop: 0,
    zIndex: 1,
  },

  foodcardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },

  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 30,
    paddingTop: 20,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: -30,
  },

  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: "white",
  },

  emptyListText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },

  emptyListSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c2c2c",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.white,
  },

  tabView: {
    flex: 1,
    backgroundColor: COLORS.white,
    height: "120%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 5,
    marginTop: -15,
  },
});
