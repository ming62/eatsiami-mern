import { View, Text, Alert, FlatList, Touchable, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { use, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';
import styles from '../../assets/styles/profile.styles';
import COLORS from '../../constants/colors';
import ProfileHeader from '../../components/ProfileHeader';
import LogoutButton from '../../components/LogoutButton';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { sleep } from './index';
import Loader from '../../components/Loader';

export default function Profile() {

    const [foodcards, setFoodcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteBookId, setDeleteBookId] = useState(null);

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
                throw new Error(data.message || 'Failed to fetch profile data');
            }

            setFoodcards(data);

        } catch (error) {
            console.error("Error fetching data:", error);
            setFoodcards([]);
            Alert.alert(
                "Error",
                error.message || "An error occurred while fetching data. Pull down to refresh.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }
    , []);

    const deleteFoodcard = async (id) => {
        try{
            setDeleteBookId(id);
            const response = await fetch(`${API_URL}/foodcards/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete foodcard');
            }

            setFoodcards(foodcards.filter((foodcard) => foodcard._id !== id));
            Alert.alert("Success", "Foodcard deleted successfully.");

        } catch (error) {
            console.error("Error deleting foodcard:", error);
            Alert.alert("Error", "An error occurred while deleting the foodcard. Please try again.");
        } finally { 
            setDeleteBookId(null);
        }
    };

    const confirmDelete = (id) => {
        Alert.alert("Delete Foodcard", "Are you sure you want to delete this foodcard?", [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: () => deleteFoodcard(id),
                style: "destructive"
            }]
        )
    };

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

    const renderFoodcard = ({ item }) => (
        <View  style={styles.bookItem}>
            <Image source={{uri: item.image}} style={styles.bookImage} />
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
                <Text style={styles.bookCaption} numberOfLines={2}>{item.caption}</Text>
                <Text style={styles.bookDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        
        <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteButton}>
           {deleteBookId === item._id ? 
             <ActivityIndicator size="small" color={COLORS.primary} />
            : <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
           } 
        </TouchableOpacity>
        </View>
    )

    const handleRefresh = async () => {
        setRefreshing(true);
        await sleep(500); 
        await fetchData();
        setRefreshing(false);
    }

    if (loading && !refreshing) { 
        return <Loader />;
    }

    return (
        <View style={styles.container}>
            <ProfileHeader />
            <LogoutButton />

            <View style={styles.booksHeader}>
                <Text style={styles.booksTitle}>My Foodcards</Text>
                <Text style={styles.booksCount}>{foodcards?.length || 0} foodcards </Text>
            </View>

            <FlatList
                data={foodcards}
                renderItem={renderFoodcard}
                keyExtractor={(item) => item._id}
                showVerticalScrollIndicator={false}
                contentContainerStyle={styles.booksList}
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
                        <Ionicons name="fast-food-outline" size={50} color={COLORS.textSecondary} />
                        <Text style={styles.emptyListText}>No foodcards found.</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/create')}>
                            <Text style={styles.addButtonText}>Add Foodcard</Text>
                        </TouchableOpacity>
                    </View>
                }
            />


            
        </View>
    );
}