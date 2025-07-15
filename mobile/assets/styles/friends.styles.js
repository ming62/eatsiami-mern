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
    color: COLORS.searchBarText,
    fontSize: 15,
    fontWeight: "400",
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#d3d3d3",
  },

  username: {
    fontSize: 16,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    margin: 3,
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
    marginTop: 50,
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
    marginTop: -10,
    zIndex: 1,
  },
  badgeContainer: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default styles;
