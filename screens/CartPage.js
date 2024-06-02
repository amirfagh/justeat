import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { CartContext } from "../screens/CartContext";
import firebase from "../firebase"; // Adjust the path if necessary

const CartPage = ({ route, navigation }) => {
  const { cartItems, removeItemFromCart, clearCart } = useContext(CartContext);
  const { category, menuItems, uid, address, name, phonenumber } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(address);
  const [orderType, setOrderType] = useState("Delivery"); // Default to "Delivery"

  const handleProceedToOrder = () => {
    setModalVisible(true);
  };

  const handleSendOrder = async () => {
    setModalVisible(false);

    const orderAddress = deliveryAddress || "No Address Provided";

    const db = firebase.firestore();
    const orderSequenceRef = db.collection("orderSequence").doc("sequence");
    const userRef = db.collection("users").doc(uid);

    try {
      await db.runTransaction(async (transaction) => {
        const orderSequenceDoc = await transaction.get(orderSequenceRef);
        if (!orderSequenceDoc.exists) {
          throw new Error("Sequence document does not exist!");
        }

        const currentSequence = orderSequenceDoc.data().currentSequence;
        const sequenceNumber = (currentSequence + 1)
          .toString()
          .padStart(4, "0");

        const totalPrice = cartItems.reduce(
          (sum, item) =>
            sum +
            (parseFloat(item.price) || 0) +
            item.options.reduce(
              (optionSum, option) =>
                optionSum + (parseFloat(option.additionalprice) || 0),
              0
            ),
          0
        );

        const orderData = {
          items: cartItems.map((item) => ({
            name: item.name || "Unknown Name",
            namea: item.namea || "Unknown Name (Arabic)",
            price: item.price || "0",
            photo: item.photo || "",
            category: item.category || "Unknown Category",
            options: item.options.map((option) => ({
              name: option.name || "Unknown Option",
              additionalprice: option.additionalprice || "0",
              selected: option.selected || "false",
            })),
          })),
          totalPrice: totalPrice.toFixed(2),
          address: orderAddress,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          status: "pending",
          userUid: uid || "Unknown UID",
          phoneNumber: phonenumber || "unknown",
          name: name || "unknown",
          orderType, // Add order type to order data
        };

        const ordersCollection = db.collection("orders");
        await ordersCollection.doc(sequenceNumber).set(orderData);

        transaction.update(orderSequenceRef, {
          currentSequence: currentSequence + 1,
        });

        // Update the user's document to add the order number
        transaction.update(userRef, {
          orders: firebase.firestore.FieldValue.arrayUnion(sequenceNumber),
        });

        Alert.alert(
          "Order processed",
          "Your order has been placed successfully!"
        );
        clearCart();
        navigation.navigate("Waiting", { uid });
      });
    } catch (error) {
      console.error("Error sending order: ", error);
      Alert.alert("Error", "Failed to place the order. Please try again.");
    }
  };

  const renderCartItem = ({ item, index }) => (
    <View style={styles.cartItemContainer}>
      <View style={styles.cartItemTextContainer}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemOptions}>
          {item.options.map((option) => option.name).join(", ")}
        </Text>
        <Text style={styles.cartItemNameArabic}>{item.namea}</Text>
        <Text style={styles.cartItemPrice}>{item.price} NIS</Text>
      </View>
      <Image source={{ uri: item.photo }} style={styles.cartItemImage} />
      <TouchableOpacity
        style={styles.closeButton2}
        onPress={() => removeItemFromCart(index)}
      >
        <Text style={styles.closeButton2Text}>X</Text>
      </TouchableOpacity>
    </View>
  );

  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum +
      (parseFloat(item.price) || 0) +
      item.options.reduce(
        (optionSum, option) =>
          optionSum + (parseFloat(option.additionalprice) || 0),
        0
      ),
    0
  );

  const deliveryFee = orderType === "Delivery" ? 10 : 0;
  const totalAmount = totalPrice + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyCartText}>Your cart is empty.</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("MenuPage", {
              category,
              menuItems,
              uid,
              address,
              name,
              phonenumber,
            })
          }
        >
          <Text style={styles.addButtonText}>Add More</Text>
          <Text style={styles.addButtonText}>لاضافة المزيد</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.flatListContainer}
            />
            <View style={styles.divider} />
            <View style={styles.orderTypeContainer}>
              <Text style={styles.orderTypeQuestion}>
                Delivery or Pick Up or Eat In?
              </Text>
              <Text style={styles.orderTypeQuestion}>
                توصيل او استلام بالمحل او اكل فالمحل؟
              </Text>
              <View style={styles.orderTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    orderType === "Delivery" && styles.orderTypeButtonSelected,
                  ]}
                  onPress={() => setOrderType("Delivery")}
                >
                  <Text
                    style={[
                      styles.orderTypeButtonText,
                      orderType === "Delivery" &&
                        styles.orderTypeButtonTextSelected,
                    ]}
                  >
                    Delivery
                  </Text>
                  <Text
                    style={[
                      styles.orderTypeButtonText,
                      orderType === "Delivery" &&
                        styles.orderTypeButtonTextSelected,
                    ]}
                  >
                    توصيل
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    orderType === "Pick Up" && styles.orderTypeButtonSelected,
                  ]}
                  onPress={() => setOrderType("Pick Up")}
                >
                  <Text
                    style={[
                      styles.orderTypeButtonText,
                      orderType === "Pick Up" &&
                        styles.orderTypeButtonTextSelected,
                    ]}
                  >
                    Pick Up
                  </Text>
                  <Text
                    style={[
                      styles.orderTypeButtonText,
                      orderType === "Pick Up" &&
                        styles.orderTypeButtonTextSelected,
                    ]}
                  >
                    استلام بالمحل
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    orderType === "Eat In" && styles.orderTypeButtonSelected,
                  ]}
                  onPress={() => setOrderType("Eat In")}
                >
                  <Text
                    style={[
                      styles.orderTypeButtonText,
                      orderType === "Eat In" &&
                        styles.orderTypeButtonTextSelected,
                    ]}
                  >
                    Eat In
                  </Text>
                  <Text
                    style={[
                      styles.orderTypeButtonText,
                      orderType === "Eat In" &&
                        styles.orderTypeButtonTextSelected,
                    ]}
                  >
                    اكل بالمحل
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentSummary}>
              <Text style={styles.paymentSummaryTitle}>Payment summary</Text>
              <Text style={styles.paymentSummaryText}>
                Delivery estimated time: 40min : وقت التوصيل المتوقع
              </Text>
              <Text style={styles.paymentSummaryText}>
                Address: {address} العنوان
              </Text>
              <Text style={styles.paymentSummaryText}>
                Total: {totalPrice.toFixed(2)} NIS :المجموع
              </Text>
              {orderType === "Delivery" && (
                <Text style={styles.paymentSummaryText}>
                  Delivery fee: 10 NIS :قيمة التوصيل
                </Text>
              )}
              <Text style={styles.paymentSummaryText}>
                Total amount: {totalAmount.toFixed(2)} NIS :المجموع الكلي
              </Text>
            </View>
          </>
        }
        data={[]}
        renderItem={null}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.flatListContainer}
        ListFooterComponent={
          <>
            <View style={styles.divider} />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation.navigate("MenuPage", {
                    category,
                    menuItems,
                    uid,
                    address,
                    name,
                    phonenumber,
                  })
                }
              >
                <Text style={styles.addButtonText}>Add More</Text>
                <Text style={styles.addButtonText}>لاضافة المزيد</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleProceedToOrder}
              >
                <Text style={styles.checkoutButtonText}>Checkout</Text>
                <Text style={styles.checkoutButtonText}>الدفع</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to place the order?
            </Text>
            {orderType === "Delivery" && (
              <TextInput
                style={styles.addressInput}
                placeholder={address}
                value={deliveryAddress}
                onChangeText={(text) => setDeliveryAddress(text)}
              />
            )}

            <TouchableOpacity
              style={styles.sendOrderButton}
              onPress={handleSendOrder}
            >
              <Text style={styles.sendOrderButtonText}>Send Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyCartText: {
    fontSize: 20,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  cartItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    width: "100%",
    height: 145,
  },
  cartItemImage: {
    width: "40%",
    height: 145,
    backgroundColor: "#e0e0e0",
    borderTopRightRadius: 10, // Bottom left radius
    borderBottomRightRadius: 10, // Bottom right radius
    marginRight: 10,
  },
  cartItemTextContainer: {
    flex: 1,
    height: 145,
    borderBottomWidth: 1, // Only bottom border
    borderTopWidth: 1,
    backgroundColor: "#fff",
    borderLeftWidth: 1, // Right border
    borderColor: "#F89D14",
    borderTopLeftRadius: 10, // Bottom left radius
    borderBottomLeftRadius: 10, // Bottom right radius
    padding: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cartItemOptions: {
    fontSize: 10,
    color: "#666",
    marginBottom: 5,
  },
  cartItemNameArabic: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#F89D14",
    marginBottom: 5,
  },
  closeButton2: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#F89D14",
    borderRadius: 10,

    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton2Text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  totalContainer: {
    backgroundColor: "#F89D14",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  proceedButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addressInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  sendOrderButton: {
    backgroundColor: "#F89D14",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  sendOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#ff0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 6,
    marginVertical: 30,
  },
  divider2: {
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 6,
    marginVertical: 10,
    marginBottom: 60,
  },
  orderTypeContainer: {
    alignItems: "center",
  },
  orderTypeQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  orderTypeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  orderTypeButton: {
    borderWidth: 1,
    borderColor: "#F89D14",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
  },
  orderTypeButtonSelected: {
    backgroundColor: "#F89D14",
  },
  orderTypeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F89D14",
    alignContent: "center",
    alignSelf: "center",
  },
  orderTypeButtonTextSelected: {
    color: "#fff",
    alignContent: "center",
    alignSelf: "center",
  },
  addressOptionButton: {
    borderWidth: 1,
    borderColor: "#F89D14",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  addressOptionText: {
    fontSize: 16,
    color: "#F89D14",
  },
  paymentSummary: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    alignContent: "center",
    alignSelf: "center",
  },
  paymentSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    alignContent: "center",
    alignSelf: "center",
  },
  paymentSummaryText: {
    fontSize: 16,
    marginBottom: 5,
    alignContent: "center",
    alignSelf: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F89D14",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "48%",
  },
  addButtonText: {
    color: "#F89D14",
    fontSize: 20,

    alignSelf: "center",
  },
  checkoutButton: {
    backgroundColor: "#F89D14",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "48%",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 20,

    alignSelf: "center",
  },
});

export default CartPage;
