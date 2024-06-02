import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import firebase from "../firebase"; // Adjust the path if necessary

const AccountPage = ({ route, navigation }) => {
  const { uid } = route.params;
  const [userData, setUserData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    const fetchOrderHistory = async () => {
      try {
        const orders = [];
        const ordersRef = firebase.firestore().collection("orders");
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .get();
        if (userDoc.exists && userDoc.data().orders) {
          const orderNumbers = userDoc.data().orders;
          for (const orderNumber of orderNumbers) {
            const orderDoc = await ordersRef.doc(orderNumber).get();
            if (orderDoc.exists) {
              orders.push({ orderId: orderNumber, ...orderDoc.data() });
            }
          }
          setOrderHistory(orders);
        }
      } catch (error) {
        console.error("Error fetching order history: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchOrderHistory();
  }, [uid]);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItemContainer}>
      <Text style={styles.orderItemText}>Order ID: {item.orderId}</Text>
      <Text style={styles.orderItemText}>
        Total Price: {item.totalPrice} NIS
      </Text>
      <Text style={styles.orderItemText}>Status: {item.status}</Text>
      <FlatList
        data={item.items}
        renderItem={({ item }) => (
          <View style={styles.orderItemDetail}>
            <Text style={styles.orderItemDetailText}>Name: {item.name}</Text>
            <Text style={styles.orderItemDetailText}>
              Price: {item.price} NIS
            </Text>
            <Text style={styles.orderItemDetailText}>
              Options: {item.options.map((option) => option.name).join(", ")}
            </Text>
            <Text style={styles.orderItemDetailText}>-----------------</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );

  const renderHeader = () => {
    if (!userData) {
      return null;
    }
    return (
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>Name: {userData.name}</Text>
        <Text style={styles.userInfoText}>
          Phone Number: {userData.phoneNumber}
        </Text>
        <Text style={styles.userInfoText}>Address: {userData.address}</Text>
        <Text style={styles.orderHistoryTitle}>Order History</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orderHistory}
      ListHeaderComponent={renderHeader}
      renderItem={renderOrderItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 30,
  },
  userInfoContainer: {
    marginBottom: 20,
    padding: 15,
    borderBottomWidth: 1, // Only bottom border
    borderLeftWidth: 1, // Left border
    borderRightWidth: 1, // Right border
    borderColor: "#F89D14",
    borderBottomLeftRadius: 10, // Bottom left radius
    borderBottomRightRadius: 10, // Bottom right radius
    shadowColor: "#fff", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadowid shadow
  },
  userInfoText: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  orderHistoryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#F89D14",
  },
  orderItemContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F89D14",
    borderRadius: 10,
    shadowColor: "#fff", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadowid shadow
  },
  orderItemText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  orderItemDetail: {
    marginLeft: 10,
    marginBottom: 5,
  },
  orderItemDetailText: {
    fontSize: 14,
    marginBottom: 2,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AccountPage;
