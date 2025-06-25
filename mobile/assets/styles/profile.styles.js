import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";
import { TabView } from "react-native-tab-view";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    flexDirection: "column",
    backgroundColor: "#2c2c2c",
    paddingBottom: -24,
  },

  header: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 70,
    justifyContent: "flex-end",
    paddingTop: 10,
  },

  headerTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    textAlign: "center",
    fontWeight: 1000,
  },

  tabView: {
    flex: 1,
    backgroundColor: COLORS.white,
    height: "120%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 5,
    marginTop: -15,
  },


  foodcard: {
    borderRadius: 16,
    marginBottom: 50,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "48%",
    aspectRatio: 9 / 16,
    overflow: "hidden",
    alignSelf: "center",
  },

  gradientOverlay: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: "flex-end",
  borderRadius: 16,

},

userInfo: {
  position: "absolute",
  alignItems: "center",
  top: 12, 
  right: 12,
},

avatar: {
  width: 40, 
  height: 40,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: COLORS.white,
},

foodcardDetails: {
  paddingHorizontal: 12,
  paddingBottom: 12,
  marginTop: 0,
  zIndex: 1,
},

foodcardTitle: {
  fontSize: 16, 
  fontWeight: "600",
  color: COLORS.white,
  fontFamily: "Konkhmer_Sleokchher-Regular",

},
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.border,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 1,
  },
  infoBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "25%",
    backgroundColor: "rgba(0, 0, 0, 0.33)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 0,
  },
  bookDetails: {
    paddingHorizontal: 5,
    paddingBottom: 5,
    marginTop: 0,
    zIndex: 1,
    flexDirection: "column",
  },
  userInfo: {
    position: "absolute",
    alignItems: "center",
    left: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    flexDirection: "column",
    marginTop: 40,
    alignItems: "flex-start",
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 3,
  },
  profileImage: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },

  profileInfo: {
    alignItems: "flex-start",
    justifyContent: "center",
  },

  username: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "gray",
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  upperHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 0,
  },

  logoutText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  booksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  booksTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  booksCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  booksList: {
    paddingBottom: 20,
  },
  bookItem: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  bookInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    marginRight: 8,
    marginVertical: "-3%",
  },
  ratingContainer: {
    marginTop: 10,
    flexDirection: "row",
    marginVertical: "5%",
  },
  caption: {
    fontSize: 10,
    color: COLORS.white,
    marginBottom: 10,
    marginTop: -5,
    lineHeight: 20,
  },
  date: {
    fontSize: 10,
    color: COLORS.white,
  },
  deleteButton: {
    position: "absolute",
    alignSelf: "flex-end",
    marginVertical: "25%",
    marginHorizontal: "-3%",
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  activeTab: {
    alignItems: "center",
    paddingBottom: 8,
  },
  inactiveTab: {
    alignItems: "center",
    paddingBottom: 8,
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#000",
  },
  inactiveTabText: {
    color: "#999",
  },
  tabUnderline: {
    marginTop: 4,
    height: 4,
    width: 50,
    backgroundColor: "#FF6B3C",
    borderRadius: 2,
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 30,
    paddingTop: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: -30,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  creatorText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: "italic",
  },

  emptyListSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});

export default styles;
