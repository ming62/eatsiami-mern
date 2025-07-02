// styles/preview.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";
import { ImageBackground } from "expo-image";

const CARD_WIDTH = 303;
const CARD_HEIGHT = 517;
const CARD_ASPECT_RATIO = 9 / 16;

const styles = StyleSheet.create({
    cardContainer: {
    position: "absolute",
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: CARD_WIDTH * 0.053,
    aspectRatio: CARD_ASPECT_RATIO,
    overflow: "hidden",
    alignSelf: "center",

    // Responsive shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: CARD_HEIGHT * 0.015,
    },
    shadowOpacity: 0.25,
    shadowRadius: CARD_WIDTH * 0.04,
    elevation: CARD_WIDTH * 0.066,
  },
    cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: CARD_WIDTH * 0.053,
    contentFit: "cover",
  },
    imageContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_WIDTH * 0.053,
    backgroundColor: COLORS.border,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    borderRadius: CARD_WIDTH * 0.053,
  },
    userInfo: {
    position: "absolute",
    alignItems: "center",
    bottom: CARD_HEIGHT * 0.031,
    right: CARD_WIDTH * 0.053,
  },

  avatar: {
    width: CARD_WIDTH * 0.198,
    height: CARD_WIDTH * 0.198,
    borderRadius: CARD_WIDTH * 0.099,
  },
   foodcardDetails: {
    paddingHorizontal: CARD_WIDTH * 0.053,
    paddingBottom: CARD_HEIGHT * 0.031,
    marginTop: 0,
    zIndex: 1,
  },

  foodcardTitle: {
    fontSize: CARD_WIDTH * 0.099,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    marginRight: CARD_WIDTH * 0.026,
    marginVertical: CARD_HEIGHT * -0.006,
  },

  ratingContainer: {
    flexDirection: "row",
    marginVertical: CARD_HEIGHT * 0.015,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
   caption: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.046,
    color: COLORS.white,
    marginTop: CARD_HEIGHT * 0.008,
    marginBottom: CARD_HEIGHT * 0.015,
    lineHeight: CARD_WIDTH * 0.066,
    top: -CARD_HEIGHT * 0.023,
  },
    tagContainer: {
    flexDirection: "row",
  },

  locationContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: CARD_WIDTH * 0.04,
    paddingHorizontal: CARD_WIDTH * 0.026,
    paddingVertical: CARD_HEIGHT * 0.008,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    marginEnd: 5,
  },

  location: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.04,
    color: COLORS.white,
    textAlign: "center",
    textAlignVertical: "center",
  },

  bookCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '80%',
    aspectRatio: 9 / 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  bookImageContainer: {
    ...StyleSheet.absoluteFillObject,
    //overflow: "hidden",
    backgroundColor: COLORS.border,
  },
    previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlayContent: {
   ...StyleSheet.absoluteFillObject,
  justifyContent: 'flex-end',
  zIndex: 1,
},
infoBackground: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '21%',
  backgroundColor: 'rgba(0, 0, 0, 0.33)',
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  zIndex: 0,
},
  
  bookDetails: {
  paddingHorizontal: 16,
  paddingBottom: 16,
  marginTop: 0,
  zIndex: 1,
},
 ratingContainer: {
    marginTop:-10,
  flexDirection: 'row',
  marginVertical: "5%",
},
bookTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: COLORS.white,
  fontFamily: "Konkhmer_Sleokchher-Regular",
  marginRight: 8, 
  marginVertical:"-3%",
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
  container: {
  flex: 1,
  backgroundColor: COLORS.background,
  flexDirection: 'column',
},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    position: 'relative',
  },

contentFrame: {
  flex: 5,
  paddingHorizontal: 20,
  justifyContent: 'center',
  alignItems: 'center',
},

footerFrame: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingBottom: 20,
},
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 50,
    width: '100%',
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  backButton: {
    zIndex: 2,
    padding: 8,
  },
    title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },

});

export default styles;