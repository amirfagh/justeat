import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import firebase from "../firebase"; // Adjust the path if necessary
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HomeScreen = ({ route, navigation }) => {
  const { uid } = route.params;
  const [userInfo, setUserInfo] = useState({ name: "", phoneNumber: "" });
  const [menuItems, setMenuItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const categories = [
    { name: "Sandwiches", arabic: "ساندويشات" },
    { name: "Meals", arabic: "وجبات" },
    { name: "Beverages", arabic: "مشروبات" },
    { name: "Salads", arabic: "سلطات" },
    { name: "French Fries", arabic: "بطاطا مقلية" },
    { name: "Sauces", arabic: "صلصات" },
  ];

  const checkIfOpen = async () => {
    try {
      const settingsDoc = await firebase
        .firestore()
        .collection("settings")
        .doc("restaurant")
        .get();
      if (settingsDoc.exists) {
        const { isOpen } = settingsDoc.data();
        setIsOpen(isOpen);
      }
    } catch (error) {
      console.error("Error fetching settings: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .get();
        if (userDoc.exists) {
          setUserInfo(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user info: ", error);
      }
    };

    const fetchMenuItems = async () => {
      const menuData = [];
      try {
        const snapshot = await firebase.firestore().collection("menu").get();
        snapshot.forEach((doc) => {
          const data = doc.data();
          menuData.push({ id: doc.id, ...data });
        });
        setMenuItems(menuData);
      } catch (error) {
        console.error("Error fetching menu items: ", error);
      }
    };

    fetchUserInfo();
    fetchMenuItems();
    setTimeout(checkIfOpen, 600);
  }, [uid]);

  useEffect(() => {
    const scrollList = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollX, {
            toValue: 1000,
            duration: 30000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(scrollX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };
    scrollList();
  }, [scrollX]);

  const renderCategory = (category) => {
    const items = menuItems.filter((item) => item.category === category.name);
    return (
      <TouchableOpacity
        key={category.name}
        onPress={() =>
          navigation.navigate("MenuPage", {
            category: category.name,
            menuItems,
            uid,
            address: userInfo.address,
            name: userInfo.name,
            phonenumber: userInfo.phoneNumber,
          })
        }
        style={styles.categoryContainer}
      >
        <View style={styles.categoryTitleContainer}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <Text style={styles.categoryTitleArabic}>{category.arabic}</Text>
        </View>

        <Animated.FlatList
          ref={flatListRef}
          data={items}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Image source={{ uri: item.photo }} style={styles.itemImage} />
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemNameArabic}>{item.namea}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentOffset={{ x: scrollX, y: 0 }}
        />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isOpen) {
    return (
      <ImageBackground
        source={require("../assets/BG.png")}
        style={styles.container}
      >
        <Text style={styles.closedText}>
          The restaurant is closed now or might be so busy, try again later
        </Text>
        <Text style={styles.closedText}>
          Usuall opening hours are 12:00 23:00
        </Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/BG.png")}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Account", {
            uid,
            name: userInfo.name,
            phonenumber: userInfo.phoneNumber,
            address: userInfo.address,
          })
        }
        style={styles.headerContainer}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Name: {userInfo.name}</Text>
          <Text style={styles.headerText}>
            Phone Number: {userInfo.phoneNumber}
          </Text>
        </View>

        <Image
          source={require("../assets/logo4.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <ImageBackground
        source={require("../assets/BG.png")} // Adjust the path if necessary
        style={styles.menuContainer}
      >
        <ScrollView style={styles.menuContainer}>
          {categories.map((category) => (
            <View key={category.name}>{renderCategory(category)}</View>
          ))}
        </ScrollView>
      </ImageBackground>
      <TouchableOpacity
        onPress={() => navigation.navigate("Order Status", { uid })}
        style={styles.footer}
      >
        <Text style={styles.footerText}>Delivery Status</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 100,
  },
  logo2: {
    width: 45,
    height: 38,
  },
  categoryTitleArabic: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
    textDecorationLine: "underline",
    marginRight: 15,
    color: "white",
  },
  categoryTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  arrowIcon: {
    right: 0,
    top: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#2E3D1A",
    borderTopLeftRadius: 10, // Bottom left radius
    borderTopRightRadius: 10, // Bottom right radius
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadowid shadow
    height: 60,
  },
  footerIcon: {
    padding: 10,
    alignItems: "center",
  },
  footerText: {
    padding: "auto",
    marginHorizontal: "auto",
    marginVertical: "auto",
    fontSize: 25,
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B4986B", // Set the background to white
    padding: 20,

    borderRadius: 10,
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.8, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadow
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    marginBottom: 7,
    fontSize: 18,
    color: "white",
  },
  basketIcon: {
    marginLeft: 10,
  },
  menuContainer: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 20,
    marginLeft: 15,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textDecorationLine: "underline",
    marginLeft: 5,
    color: "white",
  },
  itemContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",

    borderRadius: 10,
    marginLeft: 10,
  },
  itemImage: {
    width: 168,
    height: 105,
    backgroundColor: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadow
  },
  itemTextContainer: {
    backgroundColor: "#fff",
    width: "100%",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1, // Only bottom border
    borderLeftWidth: 1, // Left border
    borderRightWidth: 1, // Right border
    borderColor: "#2E3D1A",
    borderBottomLeftRadius: 10, // Bottom left radius
    borderBottomRightRadius: 10, // Bottom right radius
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadowid shadow
  },
  itemName: {
    fontSize: 16,
    textAlign: "left",
    width: "100%",
    paddingLeft: 5,
  },
  itemNameArabic: {
    fontSize: 16,
    textAlign: "right",
    width: "100%",
    paddingRight: 5,
  },
  closedText: {
    fontSize: 40,
    textAlign: "center",
    marginTop: 50,
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
