import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import React from "react";
import COLORS from "../constants/colors";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../lib/utils";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

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

const SwipeableCard = ({
  item,
  index,
  datalength,
  maxVisibleItem,
  currentIndex,
  animatedValue,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const direction = useSharedValue(0);
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const isSwipeRight = e.translationX > 0;
      direction.value = isSwipeRight ? 1 : -1;

      if (currentIndex == index) {
        translateX.value = e.translationX;
        animatedValue.value = interpolate(
          Math.abs(e.translationX),
          [0, width],
          [index, index + 1]
        );
      }
    })
    .onEnd((e) => {
      if (currentIndex == index) {
        if (Math.abs(e.translationX) > 150 || Math.abs(e.velocityX) > 1000) {
          translateX.value = withTiming(width * direction.value, {}, () => {
            if (e.translationX > 0) {
              if (onSwipeRight) {
                runOnJS(onSwipeRight)(item, index);
              }
            } else {
              if (onSwipeLeft) {
                runOnJS(onSwipeLeft)(item, index);
              }
            }
          });
          animatedValue.value = withTiming(currentIndex + 1);
        } else {
          translateX.value = withTiming(0, { duration: 500 });
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const currentItem = index === currentIndex;

    const rotateZ = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0, 20]
    );

    const translateY = interpolate(
      animatedValue.value,
      [index - 1, index],
      [-45, 0]
    );

    const scale = interpolate(
      animatedValue.value,
      [index - 1, index],
      [0.9, 1]
    );

    const opacity = interpolate(
      animatedValue.value + maxVisibleItem,
      [index, index + 1],
      [0, 1]
    );

    return {
      transform: [
        { translateX: translateX.value },
        {
          scale: currentItem ? 1 : scale,
        },
        {
          translateY: currentItem ? 0 : translateY,
        },
        {
          rotateZ: currentItem ? `${direction.value * rotateZ}deg` : `0deg`,
        },
      ],
      opacity: index < maxVisibleItem + currentIndex ? 1 : opacity,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            zIndex: datalength - index,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />

          <View style={styles.overlayContent}>
            <View style={styles.infoBackground} />
            <View style={styles.bookDetails}>
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: item.user.profileImage }}
                  style={styles.avatar}
                />
              </View>

              <View style={styles.ratingContainer}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                {renderRatingStars(item.rating)}
              </View>
              <Text style={styles.caption}>{item.caption}</Text>
              <Text style={styles.location}>📍 {item.location}</Text>
              <Text style={styles.date}>
                Shared on {formatPublishDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default SwipeableCard;

const styles = StyleSheet.create({
  cardContainer: {
    position: "absolute",
    height: 517,
    width: 303,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,

    aspectRatio: 9 / 16,
    overflow: "hidden",
    alignSelf: "center",
  },
  infoBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "21%",
    backgroundColor: "rgba(0, 0, 0, 0.33)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 0,
  },
  bookHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  userInfo: {
    position: "absolute",
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: "85%",
    marginVertical: "3%",
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: COLORS.border,
  },

  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    contentFit: "cover",
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 1,
  },
  bookDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 0,
    zIndex: 1,
  },

  bookTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    marginRight: 8,
    marginVertical: "-3%",
  },

  ratingContainer: {
    marginTop: -10,
    flexDirection: "row",
    marginVertical: "5%",
  },
  caption: {
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 8,
    lineHeight: 20,
  },
  location: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  date: {
    fontSize: 12,
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 20,
  },
  location: {
    fontSize: 12,
    color: COLORS.white,
    marginBottom: 4,
    fontStyle: "italic",
  },
});
