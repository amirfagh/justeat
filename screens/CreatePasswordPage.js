import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import firebase from "../firebase"; // Adjust the path if necessary

const CreatePasswordPage = ({ route, navigation }) => {
  const { phoneNumber } = route.params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const createPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    const email = `${phoneNumber.replace(/[^\d]/g, "")}@blabla.com`;

    try {
      // Create a new user with the email and password
      await firebase.auth().createUserWithEmailAndPassword(email, password);

      // Sign in with the phone number
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      const verificationCode = prompt(
        "Please enter the verification code you received on your phone"
      );
      const phoneCredential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );

      // Link the phone number with the new email/password user
      const user = firebase.auth().currentUser;
      await user.linkWithCredential(phoneCredential);

      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Error:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Create Password for {phoneNumber}</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Create Password" onPress={createPassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 30,

    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  textInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
});

export default CreatePasswordPage;
