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
  Switch,
} from "react-native";
import { FirebaseRecaptchaVerifierModal } from "../recap/modal";
import firebase, { firebaseConfig } from "../firebase"; // Adjust the path if necessary
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const SignUpPage = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const recaptchaVerifier = useRef(null);
  const [message, setMessage] = useState("");

  const sendVerification = async () => {
    if (
      !phoneNumber ||
      !firstName ||
      !lastName ||
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
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      setMessage("Verification code has been sent to your phone.");
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const confirmCode = async () => {
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "");
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
            firstName: firstName,
            lastName: lastName,
            address: address,
            phoneNumber: phoneNumber,
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
              firstName: firstName,
              lastName: lastName,
              address: address,
              phoneNumber: phoneNumber,
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

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.mainText}>Sign up Now!</Text>
      <Text style={styles.subText}>
        Save your details for a faster Checkout experience
      </Text>

      <TextInput
        style={styles.textInput}
        placeholder="First Name :"
        placeholderTextColor="black"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Last Name :"
        placeholderTextColor="black"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Phone number : example +972 52 4444 333"
        placeholderTextColor="black"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
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
  },
  subText: {
    fontSize: 10,
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
  passwordContainer: {
    flexDirection: "row",
    height: 45,
    alignItems: "center",
    width: "90%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F89D14",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  textInputPassword: {
    flex: 1,
    height: 25,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  eyeIcon: {
    padding: 10,
  },
  message: {
    color: "red",
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
  button: {
    width: "50%",
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
    color: "#fff",
  },
});

export default SignUpPage;
