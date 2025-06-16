import { StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {  
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
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
  padding: 10,
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
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,
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
    color: COLORS.primary,
  },
  notificationText: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  buttons: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginLeft: 8,
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

  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
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