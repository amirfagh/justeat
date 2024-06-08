import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignUpPage from "./screens/SignUpPage";
import HomeScreen from "./screens/HomeScreen"; // Adjust the path if necessary
import MenuPage from "./screens/MenuPage"; // Adjust the path if necessary
import CartPage from "./screens/CartPage";
import LoginPage from "./screens/LoginPage";
import { CartProvider } from "./screens/CartContext";
import AccountPage from "./screens/AccountPage";
import WaitingPage from "./screens/WaitingPage";
const Stack = createStackNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MenuPage"
            component={MenuPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Cart"
            component={CartPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Account" component={AccountPage} />
          <Stack.Screen name="Order Status" component={WaitingPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
