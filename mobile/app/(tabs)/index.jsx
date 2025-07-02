import "react-native-gesture-handler";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "../../assets/styles/home.styles";
import { API_URL } from "../../constants/api";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";
import Loader from "../../components/Loader";
import SwipeableCard from "../../components/SwipeableCard";
import { useSharedValue } from "react-native-reanimated";
import filter from "lodash.filter";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const { token } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValue = useSharedValue(0);
  const [activityIndex, setActivityIndex] = useState(0);

  const [foodcards, setFoodcards] = useState([]);
  const [fullFoodcards, setFullFoodcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      const formattedQuery = query.trim().toLowerCase();
      const filteredFoodcards = filter(fullFoodcards, (item) => {
        return contains(item, formattedQuery);
      });
      setFoodcards(filteredFoodcards);
      setCurrentIndex(0);
    },
    [fullFoodcards]
  );

  const handleRefresh = useCallback(() => {
    setCurrentIndex(0);
    setSearchQuery("");
    setPage(1);
    setHasMore(true);
    fetchFoodcards(1, true);
  }, []);

  const contains = (item, query) => {
    if (!query) return true;
    const lowerCaseQuery = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.caption.toLowerCase().includes(lowerCaseQuery) ||
      item.location.toLowerCase().includes(lowerCaseQuery) ||
      item.tag.toLowerCase().includes(lowerCaseQuery)
    );
  };

  const fetchFoodcards = async (pagenum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pagenum === 1) {
        setLoading(true);
      }

      const response = await fetch(
        `${API_URL}/foodcards?page=${pagenum}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch foodcards");
      }

      // setFoodcards((prevFoodcards) => [...prevFoodcards, ...data.foodcards]);
      const uniqueFoodcards =
        refresh || pagenum === 1
          ? data.foodcards
          : Array.from(
              new Set(
                [...fullFoodcards, ...data.foodcards].map((item) => item._id)
              )
            ).map((id) =>
              [...fullFoodcards, ...data.foodcards].find(
                (item) => item._id === id
              )
            );

      setFullFoodcards(uniqueFoodcards);

      if (!searchQuery.trim()) {
        setFoodcards(uniqueFoodcards);
      } else {
        // If there's a search, filter the new data
        const filteredData = filter(uniqueFoodcards, (item) => {
          return contains(item, searchQuery.trim().toLowerCase());
        });
        setFoodcards(filteredData);
      }

      setHasMore(pagenum < data.totalPages);
      setPage(pagenum);
    } catch (error) {
      console.error("Error fetching foodcards:", error);
    } finally {
      if (refresh) {
        await sleep(800);
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFoodcards();
  }, []);

  useEffect(() => {
    const FETCH_THRESHOLD = 3;
    const remainingCards = foodcards.length - currentIndex;

    if (
      remainingCards <= FETCH_THRESHOLD &&
      hasMore &&
      !loading &&
      !refreshing
    ) {
      console.log("Auto-fetching more cards...");
      fetchFoodcards(page + 1);
    }
  }, [currentIndex, foodcards.length, hasMore, loading, refreshing, page]);

  useEffect(() => {
    animatedValue.value = currentIndex;
  }, [foodcards, currentIndex]);

  // useEffect(() => {
  //   if (currentIndex >= foodcards.length && foodcards.length > 0) {
  //     if (!hasMore) {
  //       setCurrentIndex(0);
  //     }
  //   }
  // }, [currentIndex, foodcards.length, hasMore]);

  const saveFoodcard = async (foodcardId) => {
    try {
      const response = await fetch(
        `${API_URL}/foodcards/save-foodcard/${foodcardId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save foodcard");
      }

      console.log("Foodcard saved successfully:", data);
    } catch (error) {
      console.error("Error saving foodcard:", error);
    }
  };

  const handleSwipeLeft = useCallback(async (item, index) => {
    console.log(`Swiped LEFT on card ${index}:`, item.title);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleSwipeRight = useCallback(async (item, index) => {
    console.log(`Swiped RIGHT on card ${index}:`, item.title);
    setCurrentIndex((prev) => prev + 1);

    await saveFoodcard(item._id);
  }, []);

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color={i <= rating ? "#F4B400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  // const renderItem = ({ item }) => {
  //   return (
  //     <View style={styles.bookCard}>
  //       <View style={styles.bookImageContainer}>
  //         <Image source={{ uri: item.image }} style={styles.bookImage} />

  //         <View style={styles.overlayContent}>
  //           <View style={styles.infoBackground} />
  //           <View style={styles.bookDetails}>
  //             <View style={styles.userInfo}>
  //               <Image
  //                 source={{ uri: item.user.profileImage }}
  //                 style={styles.avatar}
  //               />
  //             </View>

  //             <View style={styles.ratingContainer}>
  //               <Text style={styles.bookTitle}>{item.title}</Text>
  //               {renderRatingStars(item.rating)}
  //             </View>
  //             <Text style={styles.caption}>{item.caption}</Text>
  //             <Text style={styles.date}>
  //               Shared on {formatPublishDate(item.createdAt)}
  //             </Text>
  //           </View>
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  if (loading) {
    return <Loader size="large" />;
  }

  const MAX = 3;
  return (
    <ScrollView
      style={{ backgroundColor: COLORS.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>eatsiami</Text>
        </View>
      </View>

      {/* SearchBar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={30}
          color={COLORS.textSecondary}
          style={{ marginLeft: 5 }}
        />
        <TextInput
          style={styles.searchText}
          placeholder="search for anything"
          value={searchQuery}
          onChangeText={(query) => {
            handleSearch(query);
          }}
          placeholderTextColor={COLORS.textSecondary}
          maxLength={50}
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View>
        <View style={styles.CardContainer}>
          {foodcards.map((item, index) => {
            if (index > currentIndex + MAX || index < currentIndex) return null;
            return (
              <SwipeableCard
                item={item}
                key={item._id}
                index={index}
                datalength={foodcards.length}
                maxVisibleItem={MAX}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                animatedValue={animatedValue}
                foodcards={foodcards}
                setFoodcards={setFoodcards}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            );
          })}
        </View>

        {/* Loading indicator for background fetching */}
        {loading && foodcards.length > 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading more cards...</Text>
          </View>
        )}

        {/* Empty State */}
      </View>
    </ScrollView>

    // <View style={styles.container}>
    //   <FlatList
    //     data={filteredFoodcards}
    //     renderItem={renderItem}
    //     keyExtractor={(item) => item._id}
    //     contentContainerStyle={styles.listContent}
    //     showsVerticalScrollIndicator={false}
    //     onEndReached={handleLoadMore}
    //     onEndReachedThreshold={0.1}
    //     refreshControl={
    //       <RefreshControl
    //         refreshing={refreshing}
    //         onRefresh={() => {
    //           fetchFoodcards(1, true);
    //         }}
    //         colors={[COLORS.primary]}
    //         tintColor={COLORS.primary}
    //       />
    //     }
    //     ListHeaderComponent={
    //       <View>
    //         <View style={styles.header}>
    //           <Text style={styles.headerTitle}>EatSiaMi</Text>
    //         </View>

    //         <View style={styles.searchContainer}>
    //           <Ionicons name="search" size={30} color={COLORS.textSecondary} style={{ marginLeft: 5}} />
    //           <TextInput
    //             style={styles.searchText}
    //             placeholder="search for anything"
    //             value={searchQuery}
    //             onChangeText={handleSearch}
    //             placeholderTextColor={COLORS.textSecondary}
    //             maxLength={50}
    //             multiline={false}
    //             autoCapitalize="none"
    //             autoCorrect={false}
    //           />
    //         </View>
    //       </View>
    //     }
    //     ListEmptyComponent={
    //       <View style={styles.emptyContainer}>
    //         <Ionicons name="fast-food-outline" size={60} color={"#8e8e8e"} />
    //         <Text style={styles.emptyText}>No foodcards available</Text>
    //         <Text style={styles.emptySubtext}>Share your first foodcard!</Text>
    //       </View>
    //     }
    //     ListFooterComponent={
    //       hasMore && filteredFoodcards.length > 0 ? (
    //         <ActivityIndicator
    //           style={styles.footerLoader}
    //           size="small"
    //           color={COLORS.primary}
    //         />
    //       ) : null
    //     }
    //   />
    // </View>
  );
}
