import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
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

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Image
        source={require("../assets/sandw.png")}
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

      <TouchableOpacity
        onPress={() => Alert.alert("Password recovery not implemented")}
      >
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text>Launched by</Text>
        <Text> AMA Developments</Text>
        <TouchableOpacity onPress={() => Alert.alert("Contact us clicked")}>
          <Text style={styles.contactUs}>Contact us</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 30,

    overflow: "hidden",
  },
  logo: {
    top: 40,
    width: 240,
    height: 240,
  },
  foodImages: {
    width: 420,
    height: 253,
  },
  mainText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  signUpText: {
    color: "black",
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
    backgroundColor: "#F89D14",

    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: ".white",
  },
  customButton: {
    width: "39%",
    height: 40,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    backgroundColor: "#F89D14",

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
  },
  textInput: {
    width: "90%",
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F89D14",
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  forgotPassword: {
    color: "gray",
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    bottom: 20,
    alignItems: "center",
  },
  contactUs: {
    color: "black",
    textDecorationLine: "underline",
  },
});

export default LoginPage;
