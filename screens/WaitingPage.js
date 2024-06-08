// WaitingPage.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import firebase from "../firebase"; // Adjust the path if necessary

const WaitingPage = ({ route }) => {
  const { uid } = route.params;
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastOrderStatus = async () => {
      try {
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .get();
        if (userDoc.exists && userDoc.data().orders) {
          const orderNumbers = userDoc.data().orders;
          if (orderNumbers.length > 0) {
            const lastOrderNumber = orderNumbers[orderNumbers.length - 1];
            const orderDoc = await firebase
              .firestore()
              .collection("orders")
              .doc(lastOrderNumber)
              .get();
            if (orderDoc.exists) {
              setOrderStatus(orderDoc.data().status);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching order status: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastOrderStatus();
  }, [uid]);

  const getStatusMessage = () => {
    switch (orderStatus) {
      case "pending":
        return "Waiting for the restaurant to accept the order الطلب ينتظر موافقة المطعم";
      case "accepted":
        return "Order is being prepared at the restaurant يتم تحضير الطلب في المطعم";
      case "delivery":
        return "Order is being delivered الطلب قيد التوصيل";
      case "done":
      default:
        return "You don't have current orders, please place an order لا يوجد طلبات,الرجاء اضافة الماكولات";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/bg2.png")}
      style={styles.container}
    >
      <Image source={require("../assets/del.png")} style={styles.image} />
      <Text style={styles.statusText}>{getStatusMessage()}</Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 45,
    color: "#fff",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WaitingPage;

// CartPage.js
// (Ensure the CartPage code is as shown previously)
