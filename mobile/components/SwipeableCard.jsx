import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import COLORS from "../constants/colors";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../lib/utils";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_RATIO = 9 / 16;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.58;
const CARD_WIDTH = CARD_HEIGHT * CARD_RATIO;

const renderRatingStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= rating; i++) {
    stars.push(
      <Ionicons
        key={i}
        name="star"
        size={CARD_WIDTH * 0.066}
        color={i <= rating ? COLORS.starColor : COLORS.textSecondary}
        style={{
          marginRight: CARD_WIDTH * 0.0066, marginBottom: CARD_HEIGHT * 0.005,
        }}
      />
    );
  }
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {stars}
    </View>
  );
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
  const router = useRouter();
  const translateX = useSharedValue(0);
  const direction = useSharedValue(0);

  const navigateToCardDetail = () => {
    router.push(`/otherpage/cardDetail?cardId=${item._id}`);
  };

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
        if (
          Math.abs(e.translationX) > CARD_WIDTH * 0.5 ||
          Math.abs(e.velocityX) > 1000
        ) {
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

  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      if (currentIndex === index) {
        runOnJS(navigateToCardDetail)();
      }
    });

  const combinedGesture = Gesture.Exclusive(pan, tap);

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
      [-CARD_HEIGHT * 0.087, 0]
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

  const rightOverlayStyle = useAnimatedStyle(() => {
    const currentItem = index === currentIndex;
    if (!currentItem || translateX.value <= 0) return { opacity: 0 };

    const overlayOpacity = interpolate(
      translateX.value,
      [0, CARD_WIDTH * 0.33, CARD_WIDTH * 0.66],
      [0, 0.6, 0.9]
    );

    return {
      opacity: overlayOpacity,
    };
  });

  const leftOverlayStyle = useAnimatedStyle(() => {
    const currentItem = index === currentIndex;
    if (!currentItem || translateX.value >= 0) return { opacity: 0 };

    const overlayOpacity = interpolate(
      Math.abs(translateX.value),
      [0, CARD_WIDTH * 0.33, CARD_WIDTH * 0.66],
      [0, 0.6, 0.9]
    );

    return {
      opacity: overlayOpacity,
    };
  });

  return (
    <GestureDetector gesture={combinedGesture}>
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

          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.rightSwipeOverlay,
              rightOverlayStyle,
            ]}
          >
            <View style={styles.swipeIconContainer}>
              <Ionicons name="heart" size={CARD_WIDTH * 0.264} color="white" />
              <Text style={styles.swipeText}>SAVE</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.swipeOverlay,
              styles.leftSwipeOverlay,
              leftOverlayStyle,
            ]}
          >
            <View style={styles.swipeIconContainer}>
              <Ionicons name="close" size={CARD_WIDTH * 0.264} color="white" />
              <Text style={styles.swipeText}>NOPE</Text>
            </View>
          </Animated.View>

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
            <View style={styles.detailsContainer}>
              {/* Title and Rating Row */}
              <View style={styles.titleRatingRow}>
                <Text style={styles.foodcardTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                <View style={styles.ratingRight}>
                  {renderRatingStars(item.rating)}
                </View>
              </View>

              {/* Caption, Location and User Profile Picture Row */}
              <View style={styles.bottomContentRow}>
                <View style={styles.textContent}>
                  {/* Caption */}
                  <Text
                    style={styles.caption} 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.caption}
                  </Text>

                  {/* Location and Tag Row */}
                  <View style={styles.locationTagRow}>
                    <Ionicons
                      name="location"
                      size={CARD_WIDTH * 0.053}
                      color={COLORS.white}
                      style={{ marginRight: CARD_WIDTH * 0.01, marginBottom: CARD_HEIGHT * 0.005 }}
                    />
                    <Text style={styles.location}>{item.location}</Text>
                    <Text style={styles.tag}>{item.tag}</Text>
                  </View>
                </View>

                <View style={styles.userInfo}>
                  <Image
                    source={{ uri: item.user.profileImage }}
                    style={styles.avatar}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default SwipeableCard;

const styles = StyleSheet.create({
  cardContainer: {
    position: "absolute",
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: CARD_WIDTH * 0.053,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: CARD_HEIGHT * 0.015 },
    shadowOpacity: 0.25,
    shadowRadius: CARD_WIDTH * 0.04,
    elevation: CARD_WIDTH * 0.066,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_WIDTH * 0.053,
    backgroundColor: COLORS.border,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: CARD_WIDTH * 0.053,
    contentFit: "cover",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    borderRadius: CARD_WIDTH * 0.053,
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: CARD_WIDTH * 0.053,
    paddingBottom: CARD_HEIGHT * 0.031,
    zIndex: 1,
  },
  titleRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  foodcardTitle: {
    fontSize: CARD_WIDTH * 0.08,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    flex: 1,
    marginRight: CARD_WIDTH * 0.026,
  },
  ratingRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bottomContentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  textContent: {
    flex: 1,
    marginRight: CARD_WIDTH * 0.04,
  },
  caption: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.038,
    fontWeight: "400",
    opacity: 0.7,
    color: COLORS.white,
    marginBottom: CARD_HEIGHT * 0.012,
    lineHeight: CARD_WIDTH * 0.055,
    top: -CARD_HEIGHT * 0.020,
  },
  locationTagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    bottom: -CARD_HEIGHT * 0.012,
  },
  location: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.053,
    color: COLORS.white,
    marginRight: CARD_WIDTH * 0.02,
  },
  tag: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.053,
    color: COLORS.white,
    opacity: 0.7,
    marginLeft: CARD_WIDTH * 0.02,
  },
  userInfo: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatar: {
    width: CARD_WIDTH * 0.198,
    height: CARD_WIDTH * 0.198,
    borderRadius: CARD_WIDTH * 0.099,
  },
  swipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: CARD_WIDTH * 0.053,
  },
  rightSwipeOverlay: {
    backgroundColor: COLORS.primary,
  },
  leftSwipeOverlay: {
    backgroundColor: "#2c2c2c",
  },
  swipeIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  swipeText: {
    color: "white",
    fontSize: CARD_WIDTH * 0.079,
    fontWeight: "bold",
    marginTop: CARD_HEIGHT * 0.019,
    letterSpacing: CARD_WIDTH * 0.0066,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: CARD_WIDTH * 0.132,
    marginTop: CARD_WIDTH * 0.132,
  },
  emptyText: {
    fontSize: CARD_WIDTH * 0.059,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: CARD_WIDTH * 0.053,
    marginBottom: CARD_WIDTH * 0.026,
  },
  emptySubtext: {
    fontSize: CARD_WIDTH * 0.046,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});