// styles/home.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";
import { ImageBackground } from "expo-image";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#2c2c2c",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 70,
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 50,
    color: COLORS.white,
    fontFamily: "Transicty",
    textAlign: "center",
  },

  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    backgroundColor: "#d9d9d9",
    marginBottom: 40,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
  },
  searchText: {
    marginLeft: 10,
    marginTop: 2,
    color: "#2c2c2c",
    fontSize: 15,
    fontFamily: "Konkhmer_Sleokchher-Regular",
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
    width: "80%",
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
  bookImageContainer: {
    ...StyleSheet.absoluteFillObject,
    //overflow: "hidden",
    backgroundColor: COLORS.border,
  },
  bookImage: {
    width: "100%",
    height: "100%",
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
  statsContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginLeft: 8,
    fontSize: 12,
  },
  refreshButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "100%", 
  },
  CardContainer: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
});

export default styles;
