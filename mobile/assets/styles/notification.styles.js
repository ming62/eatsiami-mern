import { StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {  
    flexDirection:'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  time: {
    flexDirection: 'row',
  },
  request: {
    backgroundColor: COLORS.background,
    padding: 10,
  },
  notification: {
    backgroundColor: COLORS.background,
    padding: 10,
  },
  scrollContainer: {    
  paddingHorizontal: 10,
  paddingBottom: 10,
},
requestTitle: {
   fontSize: 20,
  color: COLORS.black,
  fontWeight: "bold",
},
emptyText: {
  fontSize: 16,
  color: '#666',
  textAlign: 'center',
},
requestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 0,
  },
  avatar: {
    borderWidth:1,
    borderColor:COLORS.grayDark,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: COLORS.grayLight,
  },
  userInfo: {
    flex: 1,
  },
  notificationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  notificationText: {
    fontSize: 14,
    color: "#99704C",
    marginTop: 0,
  },
  notificationTime: {
    fontSize: 12,
    color: "#99704C",
    marginTop: 5,
    marginLeft: 5,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginLeft: 5,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  acceptButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",       
  justifyContent: "center",
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
grayBlock: {
  height: 35,              
  backgroundColor: "#d9d9d9", 
  borderRadius: 10,
  width: "100%",  
},        
  // loadingContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: COLORS.background,
  // },
  // listContainer: {
  //   flexGrow: 1,
  //   padding: 16,
  // },
  // notificationItem: {
  //   flexDirection: 'row',
  //   padding: 16,
  //   backgroundColor: COLORS.white,
  //   borderRadius: 12,
  //   marginBottom: 12,
  //   shadowColor: '#000',
  //   shadowOffset: {
  //     width: 0,
  //     height: 2,
  //   },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 3,
  //   elevation: 3,
  // },
  // unreadNotification: {
  //   backgroundColor: COLORS.background,
  //   borderLeftWidth: 4,
  //   borderLeftColor: COLORS.primary,
  // },
  // notificationIconContainer: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: COLORS.background,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginRight: 12,
  // },
  // notificationContent: {
  //   flex: 1,
  // },
  // notificationText: {
  //   fontSize: 16,
  //   color: COLORS.text,
  //   marginBottom: 4,
  // },
  // notificationTime: {
  //   fontSize: 12,
  //   color: COLORS.gray,
  // },
  // emptyContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   paddingVertical: 32,
  // },
  // emptyText: {
  //   fontSize: 16,
  //   color: COLORS.gray,
  //   marginTop: 12,
  // },
});

export default styles; 