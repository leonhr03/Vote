import {StyleSheet, Platform, Text, View, FlatList, TouchableOpacity, TextInput} from "react-native"
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useCallback, useState} from "react";
import {supabase} from "@/utils/supabase";
import {useFocusEffect} from "expo-router";

export default function Index() {

    const [surveys, setSurveys] = useState([{question: "magst du Programmieren lernen?", answer1: "yes", answer2: "no" }, {question: "magst du Programmieren lernen?", answer1: "yes", answer2: "no" }]);
    const [search, setSearch] = useState("");
    const filteredSurveys = surveys.filter(survey => survey.question.toLowerCase().includes(search.toLowerCase()));

    useFocusEffect(
        useCallback(() => {
            const fetchSurveys = async () => {
                const { data, error } = await supabase.from("surveys").select("*");
                if (!error) setSurveys(data || []);
            };
            fetchSurveys();
        }, [])
    );

    const renderItem = ({item} : any) => {
        return (
            <View style={styles.itemCard}>
                <Text style={styles.questionText}>{item.question}</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button} onPress={() => alert("cool")}>
                        <Text style={styles.buttonText}>{item.answer1}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => alert("not cool")}>
                        <Text style={styles.buttonText}>{item.answer2}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return(
        <SafeAreaProvider style={styles.container}>
            <Text style={styles.heading}>Vote</Text>
            <TextInput
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="black"
                placeholder={"search"}
                style={styles.search}
            />
            <FlatList
                data={filteredSurveys}
                renderItem={renderItem}
                style={{width: "100%"}}
                contentContainerStyle={{ paddingBottom: 80 }}
                keyExtractor={(item, index) => index.toString()}
            />

        </SafeAreaProvider>

    )
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

    search: {
        width: "95%",
        padding: 15,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "rgba(74, 144, 226, 0.1)",
        shadowColor: "#4A90E2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },

    itemCard: {
        alignSelf: "center",
        width: "90%",
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

    questionText: {
        fontSize: 20,
        color: '#000',
    },

    buttonRow: {
        flexDirection: "column",
        width: "100%",
        alignSelf: "center",
        marginTop: 20,
    },

    button: {
        padding: 10,
        backgroundColor: "#4a90e2",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        width: "90%",
        borderRadius: 15,
        marginVertical: 10,
    },

    buttonText: {
        color: "#fff",
        fontSize: 20,
    },
})