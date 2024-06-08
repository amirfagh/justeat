import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import firebase from "../firebase"; // Adjust the path if necessary

const LoginPage = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const email = `${phoneNumber.replace(/[^\d]/g, "")}@blabla.com`;

    try {
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      const userDoc = await firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        navigation.navigate("Home", {
          uid,
          name: userData.name,
          phoneNumber: userData.phoneNumber,
        });
      } else {
        Alert.alert("Error", "User data not found");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const customLogin = () => {
    navigation.navigate("Home", {
      uid: "n1MBKAkxR4duBUT1lE2tQrGa2g73",
    });
  };

  const showContactInfo = () => {
    Alert.alert(
      "Unity Developments",
      "For support, call or message 0525454174",
      [{ text: "OK" }]
    );
  };

  return (
    <ImageBackground
      source={require("../assets/BG.png")} // Adjust the path if necessary
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/logo4.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Image
          source={require("../assets/sandw2.png")}
          style={styles.foodImages}
          resizeMode="contain"
        />

        <Text style={styles.mainText}>
          Log In or{" "}
          <Text
            style={styles.signUpText}
            onPress={() => navigation.navigate("SignUp")}
          >
            Sign up Now!
          </Text>
        </Text>
        <Text style={styles.subText}>
          Save your details for a faster Checkout experience
        </Text>

        <TextInput
          style={styles.textInput}
          placeholder="phone number:"
          placeholderTextColor="black"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Password:"
          placeholderTextColor="black"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.ud}>Launched by Unity Developments</Text>

        <TouchableOpacity onPress={showContactInfo}>
          <Text style={styles.contactUs}>Contact us</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: 30,
  },
  container: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
    // Removed or adjust the background color for better visibility of the background image
    // backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: Adjust the opacity
    marginTop: 30,
    overflow: "hidden",
  },
  logo: {
    top: 28,
    width: 240,
    height: 240,
  },
  foodImages: {
    width: "100%",
    height: 253,
  },
  mainText: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
    marginBottom: 10,
  },
  signUpText: {
    color: "white",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  button: {
    width: "30%",
    height: 40,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    backgroundColor: "#2E3D1A",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
  customButton: {
    width: "39%",
    height: 40,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    backgroundColor: "#2E3D1A",
    justifyContent: "center",
    alignItems: "center",
  },
  customButtonText: {
    color: "black",
  },
  subText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  textInput: {
    width: "80%",
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2E3D1A",
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  footer: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#2E3D1A",
    paddingVertical: 5,
    height: 60,
    bottom: 1,
  },
  ud: {
    color: "white",
  },
  contactUs: {
    color: "white",
    textDecorationLine: "underline",
  },
});

export default LoginPage;
