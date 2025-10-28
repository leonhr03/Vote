import {SafeAreaProvider} from "react-native-safe-area-context";
import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useEffect, useState} from "react";
import { supabase } from '../utils/supabase';
import {useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Index() {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const [LoginModal, setLoginModal] = useState(true);
    const [registerModal, setRegisterModal] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const check = async () => {
            const isLogin = await AsyncStorage.getItem("isLogin");
            if (isLogin === "yes"){
                router.replace("/(tabs)")
            }
            else{
                setIsLoading(false);
            }
        }
        check()
    }, []);

    async function signUp(email: string, password: string) {

        const {data, error} = await supabase.auth.signUp({
            email,
            password,
        });

        if (error){
            console.error(error);
            return null;
        }

        console.log("Signup successful");
        setEmail("")
        setPassword("")
        router.replace("/(tabs)")
        await AsyncStorage.setItem("isLogin", "yes")
        return data;




    }

    async function LogIn(email: string, password: string) {
        const {data, error} = await supabase.auth.signInWithPassword({email, password});

        if (error){
            console.error(error);
            return null;
        }

        console.log("SignIn successful");
        setEmail("")
        setPassword("")
        router.replace("/(tabs)")
        await AsyncStorage.setItem("isLogin", "yes")
        return data.session;


    }

if(!isLoading) {
    return (
        <SafeAreaProvider>
            <Modal transparent visible={LoginModal}>
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
                            textContentType={"password"}
                            placeholderTextColor="#555"
                            style={styles.input}
                        />

                        <TouchableOpacity style={styles.button} onPress={() => LogIn(email, password)}>
                            <Text style={styles.buttonText}>Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setRegisterModal(true);
                            setLoginModal(false)
                        }}>
                            <Text style={styles.text}>Don´t have a Account? Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>


            </Modal>

            <Modal transparent visible={registerModal}>
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
                            placeholder="passwort"
                            textContentType={"password"}
                            placeholderTextColor="#555"
                            style={styles.input}
                        />

                        <TouchableOpacity style={styles.button} onPress={() => signUp(email, password)}>
                            <Text style={styles.buttonText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setLoginModal(true);
                            setRegisterModal(false)
                        }}>
                            <Text style={styles.text}>already have an Account? Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>


            </Modal>
        </SafeAreaProvider>

    )
}
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontWeight: 'bold',
        color: '#000',
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
    }
})