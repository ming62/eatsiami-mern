import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

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
  },

  headerTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher_Regular",
    fontWeight: "bold",
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
    marginBottom: 20,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
  },

  searchInput: {
    marginLeft: 10,
    marginTop: 2,
    color: "#2c2c2c",
    fontSize: 15,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    flex: 1,
  },

  friendsSection: {
    flex: 1,
    paddingHorizontal: 15,
  },

  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    marginVertical: 6,
  },

  userInfo: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  profileImage: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    width: 50, // CHANGED: Slightly bigger
    height: 50, // CHANGED: Slightly bigger
    borderRadius: 25, // CHANGED: Adjust border radius
    marginRight: 15,
    backgroundColor: "#d3d3d3",
  },

  username: {
    fontSize: 18, // CHANGED: Slightly bigger font
    fontWeight: "600", // CHANGED: Increase font weight
    color: "#333",
  },

  addButton: {
    paddingVertical: 10, // CHANGED: Increase padding
    paddingHorizontal: 25,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50, // CHANGED: Add top margin
  },

  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  buttons: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginLeft: 5,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 20,
    top: "50%",
    marginTop: -20,
    zIndex: 1,
  },
});

export default styles;
