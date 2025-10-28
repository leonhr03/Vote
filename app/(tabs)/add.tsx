import {
    StyleSheet,
    Modal,
    Text,
    View,
    TouchableWithoutFeedback,
    Platform,
    TextInput,
    FlatList,
    TouchableOpacity
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import {SafeAreaProvider} from "react-native-safe-area-context";
import { supabase } from "../../utils/supabase";

export default function Add() {
    const router = useRouter();

    const [newQuestion, setNewQuestion] = useState("")
    const [newAnswer1, setNewAnswer1] = useState("")
    const [newAnswer2, setNewAnswer2] = useState("")

    async function add() {
        const {data, error} = await supabase
            .from("surveys")
            .insert({
                question: newQuestion,
                answer1: newAnswer1,
                answer2: newAnswer2,

            })

            if (error) console.error(error);
            console.log(data);
            setNewQuestion("")
            setNewAnswer1("")
            setNewAnswer2("")
            return data;
    }

    return (
        <SafeAreaProvider style={styles.container}>
            <Text style={styles.heading}>Add a new Survey</Text>
            <View style={styles.itemCard}>
                <Text style={styles.text}>Enter a new Question</Text>
                <TextInput
                    value={newQuestion}
                    onChangeText={setNewQuestion}
                    style={styles.inputQuestion}
                    placeholder="question?"
                    placeholderTextColor="#555"
                />
            </View>
            <View style={styles.itemCard}>
                <Text style={styles.text}>Enter a answer 1</Text>
                <TextInput
                    value={newAnswer1}
                    onChangeText={setNewAnswer1}
                    style={styles.inputQuestion}
                    placeholder="answer"
                    placeholderTextColor="#555"
                />
            </View>
            <View style={styles.itemCard}>
                <Text style={styles.text}>Enter a answer 2</Text>
                <TextInput
                    value={newAnswer2}
                    onChangeText={setNewAnswer2}
                    style={styles.inputQuestion}
                    placeholder="answer"
                    placeholderTextColor="#555"
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={add}>
                <Text style={styles.buttonText}>Add Survey</Text>
            </TouchableOpacity>

        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
    },

    heading: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#000',
        marginTop: Platform.OS === 'android' ? 20 : 0,
        marginBottom: 20,
    },

    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },


    itemCard: {
        alignSelf: "center",
        width: "95%",
        padding: 20,
        marginVertical: 10,
        justifyContent: "center",
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "rgba(74, 144, 226, 0.1)",
        shadowColor: "#4A90E2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },

    inputQuestion: {
        alignSelf: "center",
        width: "95%",
        padding: 16,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "rgba(74, 144, 226, 0.1)",
        shadowColor: "#4A90E2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,

    },

    button: {
        padding: 10,
        backgroundColor: "#4a90e2",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        width: "50%",
        borderRadius: 15,
        marginVertical: 10,
    },

    buttonText: {
        color: "#fff",
        fontSize: 20,
    },
})