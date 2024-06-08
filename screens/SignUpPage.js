import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FirebaseRecaptchaVerifierModal } from "../recap/modal";
import firebase, { firebaseConfig } from "../firebase"; // Adjust the path if necessary
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const SignUpPage = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const recaptchaVerifier = useRef(null);
  const [message, setMessage] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+972");

  const sendVerification = async () => {
    if (
      !phoneNumber ||
      !fullName ||
      !address ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      // Remove leading zero from the phone number if it exists
      const formattedPhoneNumber = phoneNumber.startsWith("0")
        ? phoneNumber.slice(1)
        : phoneNumber;
      const fullPhoneNumber = `${phonePrefix}${formattedPhoneNumber}`;
      console.log("Full Phone Number:", fullPhoneNumber); // Debugging
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        fullPhoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      setMessage("Verification code has been sent to your phone.");
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const confirmCode = async () => {
    // Remove leading zero from the phone number if it exists
    const formattedPhoneNumber = phoneNumber.startsWith("0")
      ? phoneNumber.slice(1)
      : phoneNumber;
    const fullPhoneNumber = `${phonePrefix}${formattedPhoneNumber}`;
    console.log("Full Phone Number:", fullPhoneNumber); // Debugging
    const cleanPhoneNumber = fullPhoneNumber.replace(/[^\d]/g, "");
    const localPhoneNumber = cleanPhoneNumber.startsWith("972")
      ? "0" + cleanPhoneNumber.slice(3)
      : cleanPhoneNumber.startsWith("970")
      ? "0" + cleanPhoneNumber.slice(3)
      : cleanPhoneNumber;

    const email = `${localPhoneNumber}@blabla.com`;

    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      const phoneUser = await firebase.auth().signInWithCredential(credential);

      const emailCredential = firebase.auth.EmailAuthProvider.credential(
        email,
        password
      );

      try {
        // Try to link email/password with the current user
        await phoneUser.user.linkWithCredential(emailCredential);

        // Add user details to Firestore
        await firebase
          .firestore()
          .collection("users")
          .doc(phoneUser.user.uid)
          .set({
            name: fullName,
            address: address,
            phoneNumber: fullPhoneNumber,
          });

        navigation.navigate("Login");
      } catch (linkError) {
        if (linkError.code === "auth/credential-already-in-use") {
          // If the email is already linked, sign in with email and link phone
          const existingUser = await firebase
            .auth()
            .signInWithEmailAndPassword(email, password);
          await existingUser.user.linkWithCredential(credential);

          // Add user details to Firestore
          await firebase
            .firestore()
            .collection("users")
            .doc(existingUser.user.uid)
            .set({
              fullName: fullName,
              address: address,
              phoneNumber: fullPhoneNumber,
            });

          navigation.navigate("Login");
        } else {
          setMessage(`Linking Error: ${linkError.message}`);
        }
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
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
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
        />
        <Image
          source={require("../assets/logo3.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.mainText}>Sign up Now!</Text>
        <Text style={styles.subText}>
          Save your details for a faster Checkout experience
        </Text>

        <TextInput
          style={styles.textInput}
          placeholder="Full Name :"
          placeholderTextColor="black"
          value={fullName}
          onChangeText={setFullName}
        />
        <View style={styles.phoneContainer}>
          <Picker
            selectedValue={phonePrefix}
            style={styles.picker}
            onValueChange={(itemValue) => setPhonePrefix(itemValue)}
          >
            <Picker.Item label="+972" value="+972" />
            <Picker.Item label="+970" value="+970" />
          </Picker>
          <TextInput
            style={styles.textInputPhone}
            placeholder="Example: 0526458174"
            placeholderTextColor="black"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Address :"
          placeholderTextColor="black"
          value={address}
          onChangeText={setAddress}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.textInputPassword}
            placeholder="Password :"
            placeholderTextColor="black"
            secureTextEntry={!showPassword1}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword1(!showPassword1)}
            style={styles.eyeIcon}
          >
            <Icon name={showPassword1 ? "eye-off" : "eye"} size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.textInputPassword}
            placeholder="Confirm Password :"
            placeholderTextColor="black"
            secureTextEntry={!showPassword2}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword2(!showPassword2)}
            style={styles.eyeIcon}
          >
            <Icon name={showPassword2 ? "eye-off" : "eye"} size={24} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={sendVerification}>
          <Text style={styles.buttonText}>Send Verification Code</Text>
        </TouchableOpacity>
        {verificationId && (
          <>
            <TextInput
              style={styles.textInput}
              placeholder="Verification Code :"
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
            <TouchableOpacity style={styles.button} onPress={confirmCode}>
              <Text style={styles.buttonText}>Confirm Verification Code</Text>
            </TouchableOpacity>
          </>
        )}

        {message ? <Text style={styles.message}>{message}</Text> : null}
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    // Removed or adjust the background color for better visibility of the background image
    // backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: Adjust the opacity
    marginTop: 30,
    overflow: "hidden",
  },
  logo: {
    width: 192,
    height: 169,
    marginBottom: 20,
  },
  mainText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
    color: "white",
  },
  subText: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  textInput: {
    width: "90%",
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2E3D1A",
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    width: "90%",
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2E3D1A",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  textInputPhone: {
    flex: 1,
  },
  picker: {
    width: 120,
    height: 45,
    marginRight: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    paddingRight: 10,
    marginBottom: 12,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: 30,
  },
  textInputPassword: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2E3D1A",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  eyeIcon: {
    marginLeft: -35,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#2E3D1A",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
  footer: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#2E3D1A",
    paddingVertical: 5,
  },
  ud: {
    color: "white",
  },
  contactUs: {
    color: "white",
    textDecorationLine: "underline",
  },
});

export default SignUpPage;
