import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../constants/colors";

const FoodcardMessage = ({ message }) => {
    const router = useRouter();
    const attachment = message.attachments[0];
    const foodcardId = attachment.actions[0].value;

    const handlePress = () => {
        router.push(`/otherpage/foodcardPage?id=${foodcardId}`);
    };


  return (
    <View style={styles.messageContainer}>
      <Text style={styles.shareText}>{message.text}</Text>
      
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

}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  shareText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  foodcardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 9 / 16,
    maxWidth: 200,
    alignSelf: 'center',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: COLORS.border,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
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
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Konkhmer_Sleokchher-Regular',
  },
});

export default FoodcardMessage;
