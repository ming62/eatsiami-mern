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
  notificationSection: {
    flex: 1,
    paddingHorizontal: 15,
  },

  scrollContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  requestTitle: {
    fontSize: 20,
    color: COLORS.black,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 5,
  },

  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    marginVertical: 6,
  },

  avatar: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#d3d3d3",
  },

  userInfo: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },

  time: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  notificationName: {
    fontSize: 18,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "600",
    color: "#333",
  },

  notificationTime: {
    fontSize: 12,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    color: "#2c2c2c",
    marginLeft: 10,
    paddingTop: 8,
  },

  notificationText: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: 13,
    color: COLORS.primary,
    marginTop: -10,
  },

  buttons: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginLeft: 5,
  },

  acceptButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default styles;
