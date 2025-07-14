// styles/preview.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";
import { ImageBackground } from "expo-image";

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
    position: "relative",
  },
  headerTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    textAlign: "center",
    fontWeight: "400",
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
  contentFrame: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerFrame: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
});

export default styles;