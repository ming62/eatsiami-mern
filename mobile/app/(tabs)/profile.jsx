import {
  Animated,
  View,
  Text,
  Alert,
  FlatList,
  Touchable,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { use, useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import styles from "../../assets/styles/profile.styles";
import COLORS from "../../constants/colors";
import ProfileHeader from "../../components/ProfileHeader";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { sleep } from "./index";
import Loader from "../../components/Loader";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-web";
import { fetchNotificationCount } from "../../hooks/countNotifications";

export default function Profile() {
  const [foodcards, setFoodcards] = useState([]);
  const [savedFoodcards, setSavedFoodcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);
  const [unsaveFoodcardId, setUnsaveFoodcardId] = useState(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "foodcards", title: "Mine" },
    { key: "saved", title: "Saved" },
  ]);

  const initialLayout = { width: Dimensions.get("window").width };

  const { token, user } = useAuthStore();

  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/foodcards/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile data");
      }

      setFoodcards(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setFoodcards([]);
      Alert.alert(
        "Error",
        error.message ||
          "An error occurred while fetching data. Pull down to refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedFoodcards = async () => {
    try {
      const response = await fetch(`${API_URL}/foodcards/saved-foodcards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch saved foodcards");
      }
      setSavedFoodcards(data);
    } catch (error) {
      console.error("Error fetching saved foodcards:", error);
      setSavedFoodcards([]);
      Alert.alert(
        "Error",
        error.message ||
          "An error occurred while fetching saved foodcards. Pull down to refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSavedFoodcards();
  }, []);

  const deleteFoodcard = async (id) => {
    try {
      setDeleteBookId(id);
      const response = await fetch(`${API_URL}/foodcards/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete foodcard");
      }

      setFoodcards(foodcards.filter((foodcard) => foodcard._id !== id));
      Alert.alert("Success", "Foodcard deleted successfully.");
    } catch (error) {
      console.error("Error deleting foodcard:", error);
      Alert.alert(
        "Error",
        "An error occurred while deleting the foodcard. Please try again."
      );
    } finally {
      setDeleteBookId(null);
    }
  };

  const unsaveFoodcard = async (id) => {
    try {
      setUnsaveFoodcardId(id);
      const response = await fetch(
        `${API_URL}/foodcards/unsave-foodcard/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to unsave foodcard");
      }

      setSavedFoodcards(
        savedFoodcards.filter((foodcard) => foodcard._id !== id)
      );
      Alert.alert("Success", "Foodcard unsaved successfully.");
    } catch (error) {
      console.error("Error unsaving foodcard:", error);
      Alert.alert(
        "Error",
        "An error occurred while unsaving the foodcard. Please try again."
      );
    } finally {
      setUnsaveFoodcardId(null);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete Foodcard",
      "Are you sure you want to delete this foodcard?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteFoodcard(id),
          style: "destructive",
        },
      ]
    );
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#F4B400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const renderFoodcard = ({ item }) => (
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

  const renderSavedFoodcard = ({ item }) => (
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(500);
    await fetchData();
    await fetchSavedFoodcards();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <Loader />;
  }

  const FoodcardsRoute = () => (
    <FlatList
      key={"2-columns"}
      data={foodcards}
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
            size={48}
            color={COLORS.textSecondary}
            style={styles.privateAccountIcon}
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

  const SavedRoute = () => (
    <FlatList
      key={"saved-2-columns"}
      data={savedFoodcards}
      renderItem={renderSavedFoodcard}
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
            name="heart-outline"
            size={50}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyListText}>No saved foodcards yet.</Text>
          <Text style={styles.emptyListSubtext}>
            Swipe right on foodcards to save them!
          </Text>
        </View>
      }
    />
  );

  const renderScene = SceneMap({
    foodcards: FoodcardsRoute,
    saved: SavedRoute,
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}> Profile </Text>
      </View>

      <ProfileHeader userData={null} showMore={true} />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        style={styles.tabView}
        renderTabBar={() => (
          <View style={{ backgroundColor: "white", elevation: 5 }}>
            <View style={{ flexDirection: "row" }}>
              {routes.map((route, i) => {
                const isActive = i === index;
                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={() => setIndex(i)}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 12,
                      backgroundColor: isActive ? COLORS.primary : "white",
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "white" : "#2c2c2c",
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      {route.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
