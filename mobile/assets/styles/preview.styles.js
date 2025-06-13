// styles/preview.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";
import { ImageBackground } from "expo-image";

const styles = StyleSheet.create({
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