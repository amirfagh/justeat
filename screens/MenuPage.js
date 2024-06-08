import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ImageBackground,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { CheckBox } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { CartContext } from "../screens/CartContext"; // Import the CartContext
import firebase from "../firebase"; // Adjust the path if necessary

const MenuPage = ({ route, navigation }) => {
  const { category, menuItems, uid, address, name, phonenumber } = route.params;
  const { addItemToCart } = useContext(CartContext); // Use the CartContext

  const categories = [
    { name: "Sandwiches", arabic: "ساندويشات" },
    { name: "Meals", arabic: "وجبات" },
    { name: "Beverages", arabic: "مشروبات" },
    { name: "Salads", arabic: "سلطات" },
    { name: "French Fries", arabic: "بطاطا مقلية" },
    { name: "Sauces", arabic: "صلصات" },
  ];

  const scrollViewRef = useRef(null);
  const [categoryPositions, setCategoryPositions] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // Add this line
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleLayout = (event, categoryName) => {
    const { y } = event.nativeEvent.layout;
    setCategoryPositions((prevPositions) => ({
      ...prevPositions,
      [categoryName]: y,
    }));
  };

  useEffect(() => {
    if (category && categoryPositions[category] !== undefined) {
      scrollViewRef.current.scrollTo({
        y: categoryPositions[category],
        animated: true,
      });
    }
  }, [category, categoryPositions]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    let currentCategory = selectedCategory;

    for (const [categoryName, position] of Object.entries(categoryPositions)) {
      if (scrollPosition >= position - 50) {
        currentCategory = categoryName;
      }
    }
    setSelectedCategory(currentCategory);
  };

  const renderCategory = (categoryName, categoryArabic, items) => {
    return (
      <View
        style={styles.categoryContainer}
        key={categoryName}
        onLayout={(event) => handleLayout(event, categoryName)}
      >
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
          <Text style={styles.categoryTitleArabic}>{categoryArabic}</Text>
        </View>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => handleItemPress(item)}
            >
              <Image source={{ uri: item.photo }} style={styles.itemImage} />
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemNameArabic}>{item.namea}</Text>
                <Text style={styles.itemName}>{item.price} NIS</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Disable FlatList scrolling to enable ScrollView scrolling
        />
      </View>
    );
  };

  const handleItemPress = async (item) => {
    if (item.category === "Sandwiches") {
      try {
        const optionsSnapshot = await firebase
          .firestore()
          .collection("menu")
          .doc(item.id)
          .collection("options")
          .get();
        const options = [];
        optionsSnapshot.forEach((doc) => {
          options.push({ id: doc.id, ...doc.data() });
        });
        setSelectedOptions(
          options.reduce((acc, option) => {
            acc[option.id] = option.selected === "true";
            return acc;
          }, {})
        );
        setSelectedItem({ ...item, options });
        setModalVisible(true);
      } catch (error) {
        console.error("Error fetching options: ", error);
      }
    } else {
      setSelectedItem({ ...item, options: [] });
      setModalVisible(true);
    }
  };

  const handleOptionToggle = (optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const handleAddToCart = () => {
    const selectedOptionsList = selectedItem.options.filter(
      (option) => selectedOptions[option.id]
    );
    const cartItem = {
      name: selectedItem.name,
      namea: selectedItem.namea,
      price: selectedItem.price,
      photo: selectedItem.photo,
      category: selectedItem.category,
      options: selectedOptionsList,
    };
    addItemToCart(cartItem);
    setModalVisible(false);
  };

  const renderOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionContainer}
      onPress={() => handleOptionToggle(option.id)}
    >
      <Image source={{ uri: option.image }} style={styles.optionImage} />
      <Text style={styles.optionName}>{option.name}</Text>
      <Text style={styles.optionPrice}>
        {option.selected === "true"
          ? "Free"
          : option.additionalprice
          ? `+ ${option.additionalprice} NIS`
          : "Free"}
      </Text>
      <CheckBox
        checked={selectedOptions[option.id]}
        onPress={() => handleOptionToggle(option.id)}
        checkedIcon={
          <Icon
            name="check-square"
            size={24}
            color="#2E3D1A"
            iconStyle={{ backgroundColor: "#F89D14" }}
          />
        }
        uncheckedIcon={
          <Icon
            name="square"
            size={24}
            color="#2E3D1A"
            iconStyle={{ backgroundColor: "#F89D14" }}
          />
        }
        containerStyle={styles.checkBoxContainer}
      />
    </TouchableOpacity>
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 0],
    extrapolate: "clamp",
  });

  return (
    <ImageBackground
      source={require("../assets/BG.png")}
      style={styles.container}
    >
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <ImageBackground
          source={require("../assets/sandw.png")} // Adjust the path to your background image
          style={styles.headerBackground}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/logo2.png")} // Adjust the path to your logo
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headerTitle}>Just Eat</Text>
            <View style={styles.headerDetails}>
              <Text style={styles.headerDetail}>Delivery fee</Text>
              <Text style={styles.headerDetail}>Delivery time</Text>
              <Text style={styles.headerDetail}>Delivery by</Text>
            </View>
            <View style={styles.headerDetails2}>
              <Text style={styles.headerDetail}>10 Nis</Text>
              <Text style={styles.headerDetail2}>20 - 30 min</Text>
              <Text style={styles.headerDetail}>Just Eat</Text>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
      <View style={styles.footer}>
        <Image
          source={require("../assets/menu.png")}
          style={styles.logo3}
          resizeMode="contain"
        />
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={styles.footerButton}
            onPress={() => {
              setSelectedCategory(cat.name); // Set the selected category
              if (categoryPositions[cat.name] !== undefined) {
                scrollViewRef.current.scrollTo({
                  y: categoryPositions[cat.name],
                  animated: true,
                });
              }
            }}
          >
            <View style={styles.footerButtonTextContainer}>
              <Text
                style={[
                  styles.footerButtonText,
                  selectedCategory === cat.name && styles.selectedCategoryText, // Apply underline style if selected
                ]}
              >
                {cat.name}
              </Text>
              {selectedCategory === cat.name && (
                <View style={styles.underline} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.menuContainer}>
        <Animated.ScrollView
          ref={scrollViewRef}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false, listener: handleScroll }
          )}
        >
          {categories.map((cat) => {
            const items = menuItems.filter(
              (item) => item.category === cat.name
            );
            return renderCategory(cat.name, cat.arabic, items);
          })}
        </Animated.ScrollView>
      </View>

      <TouchableOpacity
        style={styles.footer2Button}
        onPress={() =>
          navigation.navigate("Cart", {
            category,
            menuItems,
            uid,
            address,
            name,
            phonenumber,
          })
        }
      >
        <View style={styles.footer2ButtonContent}>
          <Image
            source={require("../assets/basket2.png")}
            style={styles.logo2}
            resizeMode="contain"
          />
          <Text style={styles.footer2ButtonText}>View basket</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedItem && (
                <>
                  <Image
                    source={{ uri: selectedItem.photo }}
                    style={styles.modalImage}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalItemName}>
                      {selectedItem.name}
                    </Text>
                    <Text style={styles.modalItemNameArabic}>
                      {selectedItem.namea}
                    </Text>
                    <Text style={styles.modalItemPrice}>
                      {selectedItem.price} NIS
                    </Text>
                  </View>
                  {selectedItem.category === "Sandwiches" && (
                    <>
                      <Text style={styles.modalOptionsTitle}>Options</Text>
                      <View style={styles.modalOptionsContainer}>
                        {selectedItem.options
                          .filter((option) => option.selected === "true")
                          .map(renderOption)}
                      </View>
                      <Text style={styles.modalOptionsTitle}>Extras</Text>
                      <View style={styles.modalOptionsContainer}>
                        {selectedItem.options
                          .filter((option) => option.selected === "false")
                          .map(renderOption)}
                      </View>
                    </>
                  )}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddToCart}
                  >
                    <Text style={styles.addButtonText}>Add to Basket</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  headerContainer: {
    marginBottom: 40,
  },
  headerBackground: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    backgroundColor: "#fff",
    height: "60%",
    width: "70%",
    alignSelf: "center",
    padding: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
    borderRightWidth: 1, // Right border
    borderColor: "#F89D14",
    borderRadius: 10,
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadow
    marginTop: 150,
  },
  logoContainer: {
    position: "absolute",
    marginLeft: 5,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
  },
  logo: {
    height: 70,
    width: 70,
    borderRadius: 25,
  },
  logo2: {
    marginRight: 10,
  },
  logo3: {
    marginVertical: "auto",
    marginLeft: 3,
  },
  headerTitle: {
    marginLeft: 80,
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  headerDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    width: "100%",
  },
  headerDetails2: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 1,
    width: "100%",
  },
  headerDetail: {
    fontSize: 10,
  },
  headerDetail2: {
    fontSize: 10,
    marginLeft: 8,
  },
  menuContainer: {
    flex: 1,
  },
  categoryContainer: {
    marginVertical: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginLeft: 15,
    color: "white",
  },
  categoryTitleArabic: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
    textDecorationLine: "underline",
    marginRight: 15,
    color: "white",
  },
  flatListContainer: {
    paddingBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",

    height: 73,
    width: "90%",
    marginVertical: 5,
    marginHorizontal: 15,
  },
  itemImage: {
    width: 110,
    height: 73,
    backgroundColor: "#e0e0e0",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  itemTextContainer: {
    flex: 1,
    height: 73,
    justifyContent: "center",
    borderBottomWidth: 1, // Only bottom border
    borderTopWidth: 1,
    backgroundColor: "#fff",
    borderRightWidth: 1, // Right border
    borderColor: "#F89D14",
    borderTopRightRadius: 10, // Bottom left radius
    borderBottomRightRadius: 10, // Bottom right radius
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadow
  },
  itemName: {
    fontSize: 15,
    textAlign: "left",
    marginLeft: 10,
  },
  itemNameArabic: {
    fontSize: 15,
    textAlign: "right",
    marginRight: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",

    backgroundColor: "#fff",

    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadow
    marginTop: 15,
    height: 36,
  },
  footerButton: {
    padding: 8,
  },
  footerButtonText: {
    fontSize: 10,
  },
  footerButtonTextContainer: {
    alignItems: "center",
  },
  underline: {
    width: "100%",
    height: 4,
    backgroundColor: "#2E3D1A",
    marginTop: 2,
  },
  footer2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,

    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadow
    height: 60,
  },
  footer2Button: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,

    borderRadius: 10,
    paddingVertical: 5,
    height: 43,
    width: "100%",
    paddingHorizontal: 15,
    backgroundColor: "#2E3D1A",
  },
  footer2ButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: "auto",
  },
  footer2ButtonTextContainer: {
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
  },
  footer2ButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  modalContainer: {
    flex: 1,

    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",

    paddingBottom: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 20,
    position: "relative", // Add relative positioning
  },
  closeButton: {
    position: "absolute", // Add absolute positioning
    top: 10, // Adjust the top position as needed
    right: 10, // Adjust the right position as needed
    borderWidth: 1,
    height: 30,

    width: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
  },

  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  modalTextContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  modalItemName: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: "70%",
  },
  modalItemNameArabic: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: "50%",
  },
  modalItemPrice: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: "bold",
    marginRight: "65%",
  },
  modalOptionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: "10%",
  },
  modalOptionsContainer: {
    maxHeight: 300,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    height: 38,
    paddingRight: 10,
    marginVertical: 5,
    marginHorizontal: 15,
    borderWidth: 1,
    backgroundColor: "#fff",
    borderRightWidth: 1, // Right border
    borderColor: "#2E3D1A",
    borderRadius: 10,
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow offset
    shadowOpacity: 0.4, // Stronger shadow opacity
    shadowRadius: 5, // Stronger shadow radius
    elevation: 10, // Higher elevation for Android shadow
  },
  optionImage: {
    width: 38,
    height: 36,
    marginRight: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  optionName: {
    fontSize: 13,
  },
  optionPrice: {
    marginLeft: 2,
    fontSize: 13,
    color: "gray",
  },
  checkBoxContainer: {
    padding: 0,
    margin: 0,
    marginLeft: "auto",
  },
  addButton: {
    backgroundColor: "#2E3D1A",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "white",

    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MenuPage;
