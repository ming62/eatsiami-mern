import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import styles from "../../assets/styles/home.styles";
import { API_URL } from '../../constants/api';
import { Image } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { formatPublishDate } from '../../lib/utils';
import Loader from '../../components/Loader';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {

    const { token } = useAuthStore();
    const [foodcards, setFoodcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchFoodcards = async (pagenum = 1, refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else if (pagenum === 1) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/foodcards?page=${pagenum}&limit=5`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch foodcards');
            }

            

            // setFoodcards((prevFoodcards) => [...prevFoodcards, ...data.foodcards]);
            const uniqueFoodcards = refresh || pagenum === 1 ?
                data.foodcards :
                Array.from(new Set([...foodcards, ...data.foodcards].map(item => item._id)))
                .map(id => [...foodcards, ...data.foodcards].find(item => item._id === id));

            setFoodcards(uniqueFoodcards);
            

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

    const handleLoadMore = async () => {
        if (hasMore && !loading && !refreshing) {
            await fetchFoodcards(page + 1);
        }
    }

    const renderRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={16}
                    color={i <= rating ? "#F4B400" : COLORS.textSecondary}
                    style={{ marginRight: 2 }}
                />
            );
        }
        return <View style={{ flexDirection: 'row' }}>{stars}</View>;
    }

    const renderItem = ({item}) => {
    return ( <View style={styles.bookCard}>
                <View style={styles.bookHeader}>
                    <View style={styles.userInfo}>
                    <Image source={{ uri: item.user.profileImage }} style={styles.avatar} /> 
                    <Text style={styles.username}>{item.user.username}</Text>     
                    </View>
                </View>

                <View style={styles.bookImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.bookImage} contentFit="cover" />
                </View>

                <View style={styles.bookDetails}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
                    <Text style={styles.caption}>{item.caption}</Text>
                    <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
                </View>
                </View>
        );
    }

    if (loading) {
        return <Loader size='large' />; 
    }
    return (
        <View style={styles.container}>
            <FlatList
                data={foodcards}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            fetchFoodcards(1, true);
                        }}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary} 
                    />
                }

                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Latest Foodcards</Text>
                        <Text style={styles.headerSubtitle}>Discover new food experiences</Text>
                    </View>
                }

                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="fast-food-outline" size={60} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>No foodcards available</Text>
                        <Text style={styles.emptySubtext}>Share your first foodcard!</Text>
                    </View>
                }

                ListFooterComponent={
                    hasMore && foodcards.length > 0 ? (
                        <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
                    ) : null
                }
            />

   
        </View>
    );
}