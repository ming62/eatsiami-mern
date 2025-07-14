import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: "50%",
    marginTop: -12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 15,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  sliderContainer: {
    marginTop: -10,
    alignItems: "stretch",
    backgroundColor: COLORS.primary + 10,
    margin: 20,
    borderRadius: 15,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  sliderLabel: {
    fontSize: 20,
    color: COLORS.textPrimary,
    margin: 15,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },

  sliderValue: {
    fontSize: 18,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 0,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },

  slider: {
    width: "90%",
    height: 40,
    alignSelf: "center",
  },
  reportBox: {
    marginTop: 20,
    backgroundColor: COLORS.primary + "10",
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  reportHeader: {
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingBottom: 4,
  },
  reportTitle: {
    fontSize: 22,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: -15,
  },
  reportText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  disclaimer: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 16,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
});

export default styles;
