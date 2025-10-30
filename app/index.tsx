import { SafeAreaProvider } from "react-native-safe-area-context";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function Index() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [loginModal, setLoginModal] = useState(true);
    const [registerModal, setRegisterModal] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const registerForPushNotifications = async () => {
            try {
                if (Device.isDevice) {
                    const { status: existingStatus } = await Notifications.getPermissionsAsync();
                    let finalStatus = existingStatus;

                    if (existingStatus !== "granted") {
                        const { status } = await Notifications.requestPermissionsAsync();
                        finalStatus = status;
                    }

                    if (finalStatus !== "granted") {
                        alert("Benachrichtigungsberechtigung nicht erteilt!");
                        return;
                    }

                    const tokenData = await Notifications.getExpoPushTokenAsync();
                    console.log("📱 Expo Push Token:", tokenData.data);

                    if (Platform.OS === "android") {
                        Notifications.setNotificationChannelAsync("default", {
                            name: "default",
                            importance: Notifications.AndroidImportance.MAX,
                            vibrationPattern: [0, 250, 250, 250],
                            lightColor: "#FF231F7C",
                        });
                    }

                    // ✅ Tägliche Benachrichtigung planen
                    await scheduleDailyNotification();
                } else {
                    alert("Push Notifications benötigen ein echtes Gerät.");
                }
            } catch (error) {
                console.error("Fehler bei der Notification-Registrierung:", error);
            }
        };

        const scheduleDailyNotification = async () => {
            await Notifications.cancelAllScheduledNotificationsAsync();

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Vote",
                    body: "Die Umfragen warten 😊",
                    sound: true,
                },
                trigger: {
                    type: "daily",
                    hour: 14,
                    minute: 0,
                    repeats: true,
                } as Notifications.DailyTriggerInput,
            });

            console.log("Tägliche Benachrichtigung um 14:00 geplant");
        };

        const checkLogin = async () => {
            const isLogin = await AsyncStorage.getItem("isLogin");
            if (isLogin === "yes") {
                router.replace("/(tabs)/home");
            } else {
                setIsLoading(false);
            }
        };

        registerForPushNotifications();
        checkLogin();
    }, []);

    async function signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            console.error(error);
            alert("Registrierung fehlgeschlagen!");
            return;
        }

        console.log("Signup erfolgreich");
        setEmail("");
        setPassword("");
        await AsyncStorage.setItem("isLogin", "yes");
        router.replace("/(tabs)/home");
    }

    async function logIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error(error);
            alert("Login fehlgeschlagen!");
            return;
        }

        console.log("Login erfolgreich");
        setEmail("");
        setPassword("");
        await AsyncStorage.setItem("isLogin", "yes");
        router.replace("/(tabs)/home");
    }

    if (isLoading) return null;

    return (
        <SafeAreaProvider>

            <Modal transparent visible={loginModal} animationType="slide">
                <View style={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.heading}>Log In</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="example@vote.com"
                            placeholderTextColor="#555"
                            style={styles.input}
                        />
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="password"
                            secureTextEntry
                            placeholderTextColor="#555"
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.button} onPress={() => logIn(email, password)}>
                            <Text style={styles.buttonText}>Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setRegisterModal(true);
                                setLoginModal(false);
                            }}
                        >
                            <Text style={styles.text}>Don’t have an account? Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal transparent visible={registerModal} animationType="slide">
                <View style={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.heading}>Sign Up</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="example@vote.com"
                            placeholderTextColor="#555"
                            style={styles.input}
                        />
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="password"
                            secureTextEntry
                            placeholderTextColor="#555"
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.button} onPress={() => signUp(email, password)}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setLoginModal(true);
                                setRegisterModal(false);
                            }}
                        >
                            <Text style={styles.text}>Already have an account? Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        width: "90%",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "rgba(74, 144, 226, 0.3)",
        shadowColor: "#4A90E2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    heading: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#000",
    },
    input: {
        width: "85%",
        padding: 12,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: "rgba(0, 0, 0, 0.15)",
        backgroundColor: "#F9FAFB",
        fontSize: 18,
        color: "#000",
    },
    button: {
        width: "60%",
        backgroundColor: "#4A90E2",
        paddingVertical: 14,
        marginTop: 20,
        borderRadius: 14,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },
    text: {
        fontSize: 15,
        color: "#000",
        marginTop: 10,
    },
});