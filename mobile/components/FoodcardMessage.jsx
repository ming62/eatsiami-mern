import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router"; 
import { LinearGradient } from "expo-linear-gradient";
import { useMessageContext } from "stream-chat-react-native";
import COLORS from "../constants/colors";

const FoodcardMessage = ({ message }) => {
  const router = useRouter();
  const { isMyMessage } = useMessageContext();
  const attachment = message.attachments[0];
  const foodcardId = attachment.actions[0].value;

  const handleViewFoodcard = () => {
    router.push(`/otherpage/cardDetail?cardId=${foodcardId}`);
  };

  return (
    <View style={[
      styles.container,
      isMyMessage ? styles.myContainer : styles.theirContainer
    ]}>
      <TouchableOpacity
        onPress={handleViewFoodcard}
        activeOpacity={0.8}
        style={styles.foodcardContainer}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: attachment.image_url }} style={styles.cardImage} />
          
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
              <Text style={styles.foodcardTitle}>{attachment.title}</Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
    maxWidth: 180, 
  },
  myContainer: {
    alignSelf: 'flex-end',
  },
  theirContainer: {
    alignSelf: 'flex-start',
    paddingLeft: 24,
  },
  foodcardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 9 / 16,
    width: 160,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: COLORS.border,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    borderRadius: 12,
  },
  foodcardDetails: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    marginTop: 0,
    zIndex: 1,
  },
  foodcardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Konkhmer_Sleokchher-Regular',
  },
});

export default FoodcardMessage;