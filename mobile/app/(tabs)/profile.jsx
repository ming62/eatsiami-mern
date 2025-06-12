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

export default function Profile() {
  const [foodcards, setFoodcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "foodcards", title: "Foodcards" },
    { key: "saved", title: "Saved" },
  ]);

  const initialLayout = { width: Dimensions.get("window").width };

  const { token } = useAuthStore();

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

  useEffect(() => {
    fetchData();
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
    <View style={styles.bookCard}>
      <View style={styles.bookImageContainer}>
        <Image source={{ uri: item.image }} style={styles.bookImage} />

        <View style={styles.overlayContent}>
          <View style={styles.infoBackground} />
          <View style={styles.bookDetails}>
            <TouchableOpacity
              onPress={() => confirmDelete(item._id)}
              style={styles.deleteButton}
            >
              {deleteBookId === item._id ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={25}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>

            <View style={styles.ratingContainer}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              {renderRatingStars(item.rating)}
            </View>
            <Text style={styles.caption}>{item.caption}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(500);
    await fetchData();
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

  const SavedRoute = () => (
    <View>
      <Text>This is the Saved tab</Text>
    </View>
  );

  const renderScene = SceneMap({
    foodcards: FoodcardsRoute,
    saved: SavedRoute,
  });

  return (
    <View style={styles.container}>
      {/* Orange header background */}
      <View style={styles.headerBackground} />

      <ProfileHeader />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            //line under active tab
            indicatorStyle={{
              backgroundColor: "#ff6c36",
              height: 5,
            }}
            //tabbar background
            style={{ backgroundColor: "white" }}
            activeColor="#ff6c36"
            inactiveColor="#000000"
            tabStyle={{
              justifyContent: "center",
            }}
          />
        )}
      />
    </View>
  );
}
