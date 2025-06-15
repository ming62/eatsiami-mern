import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00000',
    flexDirection:'column',
  },
  header: {
    flex: 1,
    pading: 5,
    backgroundColor: '#000000',
  },
  searchSection: {
    flex:1,
    justifyContent: 'center',
  },
    searchConatainer: {
    padding:10,
    borderRadius:15,
    backgroundColor:'#d3d3d3',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  friendsCard: {
    flex: 1,
    backgroundColor: '#000000',
    flexDirection: 'row',
    padding: 5,
  },
  userInfo: {
    flex: 6,
    backgroundColor: '#000000',
    flexDirection: 'row',
  },
    profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary || "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "500",
  },
});