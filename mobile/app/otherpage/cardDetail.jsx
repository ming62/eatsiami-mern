import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";
import FriendsWindow from "../../components/FriendsWindow";

const CARD_WIDTH = 303;
const CARD_HEIGHT = 517;

export default function CardDetail() {
  const router = useRouter();
  const inputRef = useRef(null);
  const { cardId } = useLocalSearchParams();
  const { token, user } = useAuthStore();

  const [foodcard, setFoodcard] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyToUsername, setReplyToUsername] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const [isFriend, setIsFriend] = useState(false);

  const [cardLoading, setCardLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const checkFriendship = async (ownerId) => {
    try {
      const response = await fetch(`${API_URL}/users/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setIsFriend(data.some((f) => f._id === ownerId));
      }
    } catch {
      setIsFriend(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await fetch(`${API_URL}/comments/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch comments");
      }
      setComments(data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    try {
      setPosting(true);
      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: cardId,
          content: newComment.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to post comment");
      }

      setNewComment("");
      fetchComments();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setPosting(false);
      setReplyToCommentId(null);
      setReplyToUsername(null);
    }
  };

  const handleReplyComment = async (commentId) => {
    if (!newComment.trim()) return;

    try {
      setPosting(true);
      const response = await fetch(`${API_URL}/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: cardId,
          content: newComment.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to post reply");
      }

      setNewComment("");
      fetchComments();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setPosting(false);
      setReplyToCommentId(null);
      setReplyToUsername(null);
    }
  };

  const fetchCardDetails = async () => {
    try {
      setCardLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/foodcards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch card details");
      }

      setFoodcard(data);
      setSaved(data.isSaved || false);

      if (data.user.privacy === "private" && user.id !== data.user._id) {
        await checkFriendship(data.user._id);
      }
    } catch (error) {
      console.error("Error fetching card details:", error);
      Alert.alert("Error", error.message || "Failed to fetch card details");
    } finally {
      setCardLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Foodcard",
      "Are you sure you want to delete this foodcard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await fetch(`${API_URL}/foodcards/${cardId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (!response.ok) {
                throw new Error(data.message || "Failed to delete foodcard");
              }
              Alert.alert("Success", "Foodcard deleted successfully.");
              router.back();
            } catch (error) {
              console.error("Error deleting foodcard:", error);
              Alert.alert(
                "Error",
                "An error occurred while deleting the foodcard. Please try again."
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);
      const endpoint = saved
        ? `${API_URL}/foodcards/unsave-foodcard/${cardId}`
        : `${API_URL}/foodcards/save-foodcard/${cardId}`;

      const method = saved ? "DELETE" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save card");
      }

      setSaved(!saved);
    } catch (error) {
      console.error("Error saving card:", error);
      Alert.alert("Error", error.message || "Failed to save card");
    } finally {
      setActionLoading(false);
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={26}
          color={i <= rating ? COLORS.starColor : "rgba(0, 0, 0, 0.1)"}
          style={{
            marginRight: 3,
            textShadowColor: "rgba(0, 0, 0, 0.1)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        />
      );
    }
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {stars}
      </View>
    );
  };

  const CommentsItem = ({ comment }) => {
    return (
      <View style={styles.commentContainer}>
        {/* Top-level comment */}
        <TouchableOpacity
          style={styles.commentHeader}
          onPress={() =>
            router.push(
              `/otherpage/friendDetail?friendId=${comment.userId._id}`
            )
          }
        >
          <Image
            source={{ uri: comment.userId.profileImage }}
            style={styles.commentAvatar}
          />
          <Text style={styles.commentUsername}>
            {comment.userId.username.length > 20
              ? comment.userId.username.slice(0, 15) + "..."
              : comment.userId.username}
          </Text>
          <Text style={styles.commentTime}>
            {formatPublishDate(comment.createdAt)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setReplyToCommentId(comment._id);
            setReplyToUsername(comment.userId.username);
            setNewComment(`@${comment.userId.username} `);
            inputRef.current?.focus();
          }}
        >
          <Text style={styles.replyContent}>{comment.content}</Text>
        </TouchableOpacity>

        {/* Replies */}
        {comment.replies.map((reply) => (
          <View key={reply._id} style={styles.replyContainer}>
            <View style={styles.replyHeader}>
              <Image
                source={{ uri: reply.userId.profileImage }}
                style={styles.replyAvatar}
              />
              <Text style={styles.replyUsername}>
                {" "}
                {reply.userId.username.length > 20
                  ? reply.userId.username.slice(0, 15) + "..."
                  : reply.userId.username}
              </Text>
              <Text style={styles.replyTime}>
                {formatPublishDate(reply.createdAt)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setReplyToCommentId(reply._id);
                setReplyToUsername(reply.userId.username);
                setNewComment(`@${reply.userId.username} `);
                inputRef.current?.focus();
              }}
            >
              <Text style={styles.replyContent}>{reply.content}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  useEffect(() => {
    if (cardId) {
      fetchCardDetails();
      fetchComments();
    }
  }, [cardId]);

  if (cardLoading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading foodcard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!foodcard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Foodcard not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isAuthor = user && foodcard?.user?._id && user.id === foodcard.user._id;

  if (
    foodcard &&
    foodcard.user.privacy === "private" &&
    user.id !== foodcard.user._id &&
    !isFriend
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            This foodcard is private and only visible to friends.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {foodcard.user.username}'s {foodcard.title}
          </Text>
          {foodcard.user.privacy === "public" && (
            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareHeaderButton}
            >
              <Ionicons
                name="share-social"
                size={24}
                color={COLORS.white}
                accessibilityLabel="share"
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Image */}
          <View style={styles.cardContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: foodcard.image }}
                style={styles.cardImage}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Card Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.title}>{foodcard.title}</Text>
            <View style={styles.captionSection}>
              <Text style={styles.captionText}>{foodcard.caption}</Text>
            </View>
            <View style={styles.locationTagRow}>
              <Ionicons
                name="location"
                size={24}
                color={COLORS.lightBlackText}
                style={{ marginRight: 0 }}
              />
              <Text style={styles.locationText}>{foodcard.location}</Text>
              <Text style={styles.tagText}>{foodcard.tag}</Text>
            </View>
            <View style={styles.ratingContainer}>
              {renderRatingStars(foodcard.rating)}
            </View>
            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.floatingActionButton,
                isAuthor
                  ? styles.deleteFloatingButton
                  : styles.saveFloatingButton,
                { marginRight: 20 },
              ]}
              onPress={isAuthor ? handleDelete : handleSave}
              accessibilityLabel="action button"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#2c2c2c" />
              ) : (
                <Ionicons
                  name={
                    isAuthor
                      ? "trash-outline"
                      : saved
                      ? "heart"
                      : "heart-outline"
                  }
                  size={24}
                  color={isAuthor ? COLORS.black : "#2c2c2c"}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentTitle}>
              Comments (
              {comments.reduce(
                (total, curr) => total + 1 + (curr.replies?.length || 0),
                0
              )}
              )
            </Text>
            {/* create new comment */}

            <View style={styles.commentForm}>
              <TextInput
                ref={inputRef}
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor={COLORS.searchBarLabel}
                value={newComment}
                onChangeText={(text) => {
                  setNewComment(text);
                  if (text.trim() === "") {
                    setReplyToCommentId(null);
                    setReplyToUsername(null);
                    setNewComment("");
                  }
                }}
              />

              <TouchableOpacity
                style={styles.commentButton}
                onPress={
                  replyToCommentId
                    ? () => handleReplyComment(replyToCommentId)
                    : handleCreateComment
                }
                accessibilityLabel="send comment"
                disabled={posting || !newComment.trim()}
              >
                <View>
                  {posting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={24} color={COLORS.black} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {comments.length === 0 && !commentsLoading ? (
              <Text style={{ textAlign: "center", color: COLORS.white }}>
                No comments yet.
              </Text>
            ) : (
              comments.map((item) => (
                <CommentsItem key={item._id} comment={item} />
              ))
            )}
          </View>

          {/* Sharing */}
          {foodcard.user.privacy === "public" && (
            <FriendsWindow
              visible={showShareModal}
              onClose={() => setShowShareModal(false)}
              foodcardId={cardId}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    flexDirection: "column",
  },

  header: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 70,
    justifyContent: "center",
    paddingTop: 10,
    position: "relative",
  },
  headerTitle: {
    fontSize: 26,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 20,
    top: "50%",
    marginTop: -10,
    zIndex: 1,
  },
  shareHeaderButton: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 15,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    elevation: CARD_WIDTH * 0.066,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_WIDTH * 0.053,
    overflow: "hidden",
    position: "relative",
    backgroundColor: COLORS.border,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: CARD_WIDTH * 0.053,
    contentFit: "cover",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginVertical: 18,
    marginHorizontal: 30,
    opacity: 0.4,
  },
  infoSection: {
    paddingHorizontal: 30,
    paddingBottom: 10,
    paddingTop: 0,
    backgroundColor: "transparent",
    position: "relative",
  },
  title: {
    fontSize: 30,
    fontWeight: "400",
    color: COLORS.lightBlackText,
    marginBottom: 8,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: COLORS.lightBlackText,
    marginBottom: 8,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  captionText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.lightBlackText,
    opacity: 0.5,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "400",
  },
  locationTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
    gap: 8,
  },
  locationText: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: 16,
    color: COLORS.lightBlackText,
    fontWeight: "600",
    marginRight: 12,
  },
  tagText: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: 16,
    color: COLORS.lightBlackText,
    opacity: 0.5,
    fontWeight: "400",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  commentsSection: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 0,
    backgroundColor: "transparent",
  },
  floatingActionButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  saveFloatingButton: {
    backgroundColor: COLORS.white,
  },
  deleteFloatingButton: {
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "400",
  },
  commentContainer: {
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  commentUsername: {
    fontWeight: "400",
    fontSize: 16,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    color: COLORS.lightBlackText,
  },
  commentTime: {
    marginLeft: "auto",
    fontSize: 11,
    fontFamily: "Figtree",
    color: COLORS.lightBlackText,
    opacity: 0.5,
    marginLeft: 10,
    marginTop: 2,
  },
  replyTime: {
    marginLeft: "auto",
    fontSize: 11,
    fontFamily: "Figtree",
    color: COLORS.lightBlackText,
    opacity: 0.5,
    marginLeft: 10,
    top: 6,
  },

  commentContent: {
    marginLeft: 36,
    color: COLORS.lightBlackText,
    fontFamily: "Figtree",
    fontWeight: "400",
    opacity: 0.7,
  },
  replyContainer: {
    marginLeft: 38,
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderColor: "#ddd",
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  replyAvatar: {
    width: 25,
    height: 25,
    borderRadius: 12,
    marginRight: 6,
  },
  replyUsername: {
    fontWeight: "400",
    fontSize: 16,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    color: COLORS.lightBlackText,
  },
  replyContent: {
    marginLeft: 36,
    color: COLORS.lightBlackText,
    fontFamily: "Figtree",
    fontWeight: "400",
    opacity: 0.7,
  },
  commentForm: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 16,
  },
  commentInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.searchBarBackground,
    borderRadius: 18,
    paddingHorizontal: 21,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 16,
    color: COLORS.searchBarText,
    fontFamily: "Figtree",
    fontWeight: "400",
    marginBottom: 20,
  },
  commentButton: {
    backgroundColor: COLORS.white,
    elevation: 4,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
});
