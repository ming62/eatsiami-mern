import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection:'column',
  },
  header: {  
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8,
    padding: 15,
    backgroundColor: COLORS.white,
  },
  searchheader: {  
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: 0.8,
  padding: 15,
  backgroundColor: COLORS.white,
},
  searchSection: {
    padding:15,
    flex:1,
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    flex:1,
    padding:5,
    borderRadius:15,
    backgroundColor:'#d3d3d3',
  },
 searchIcon: {
  marginRight: 8,
  marginLeft: 4,
},
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  friendCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    padding: 5,
  },
  userInfo: {
    flex: 6,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'flex-start',
  },
  profileImage: {
    borderWidth:1,
    borderColor:COLORS.gray,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
    backgroundColor: "#d3d3d3",
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    
  },
  addButton: {
    margin:3,
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.primary ,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent:'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: 'bold',
  },
 friendsSection: {
  flex: 11,
  justifyContent: 'center', 
},

emptyText: {
  fontSize: 16,
  color: '#666',
  textAlign: 'center',
},
backButton: {
  width: 35,
  padding: 4,
  borderRadius: 20,
},
actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
deleteButton: {
  backgroundColor: COLORS.danger,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 8, 
},
});

export default styles;