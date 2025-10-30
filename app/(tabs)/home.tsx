import {
    StyleSheet,
    Platform,
    Text,
    TextInput,
    FlatList,
    Modal,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import SurveyItem from "@/components/listItem";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [surveys, setSurveys] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const [commentSheet, setCommentSheet] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [currentItem, setCurrentItem] = useState<string | null>(null);
    const [comments, setComments] = useState([{comment: "this is a new Comment this is a new Comment this is a new Comment this is a new Comment"}, {comment: "this is a new Comment"}]);

    const filteredSurveys = surveys.filter((survey) =>
        survey.question.toLowerCase().includes(search.toLowerCase())
    );

    const fetchSurveys = async () => {
        const { data, error } = await supabase
            .from("surveys")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) {
            const surveysWithNormalizedComments = (data || []).map(s => {
                let comments = Array.isArray(s.comments) ? s.comments : [];

                // normalize comments
                comments = comments.map((c: string) => {
                    if (typeof c === "string") {
                        try {
                            const parsed = JSON.parse(c);
                            return parsed.comment ? parsed : { comment: c };
                        } catch {
                            return { comment: c };
                        }
                    }
                    return c;
                });

                return { ...s, comments };
            });

            setSurveys(surveysWithNormalizedComments);
        }


    };

    useFocusEffect(
        useCallback(() => {
            fetchSurveys().then(() => setIsLoading(false));
        }, [])
    );

    const addComment = async () => {
        if (!newComment || !currentItem) return;

        const survey = surveys.find(s => s.id === currentItem);
        if (!survey) return;

        // immer als Objekt speichern
        const updatedComments = [...(survey.comments || []), { comment: newComment }];

        const { error } = await supabase
            .from("surveys")
            .update({ comments: updatedComments })
            .eq("id", currentItem);

        if (!error) {
            setNewComment("");
            setComments(updatedComments);

            const updatedSurveys = surveys.map((s) =>
                s.id === currentItem ? { ...s, comments: updatedComments } : s
            );
            setSurveys(updatedSurveys);
        } else {
            console.error(error);
        }
    };

    const renderCommentItem = ({ item }: any) => (
        <View style={styles.commentItem}>
            <Text style={styles.comment}>{item.comment}</Text>
        </View>
    );


    if (!isLoading) {

        return (
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
                    renderItem={({item}) => (
                        <SurveyItem item={item} onVoted={fetchSurveys}
                                    onPressComment={async () => {
                                        setCurrentItem(item.id);
                                        setCommentSheet(true);

                                        const survey = surveys.find(s => s.id === item.id);

                                        setComments(survey?.comments || []);
                                    }}
                        />
                    )}
                    style={{width: "100%"}}
                    contentContainerStyle={{paddingBottom: 80}}
                    keyExtractor={(item) => item.id}
                />

                <Modal transparent animationType="slide" visible={commentSheet}>
                    <View style={styles.overlay}>
                        {/* Bereich über dem Modal (zum Schließen) */}
                        <TouchableWithoutFeedback onPress={() => setCommentSheet(false)}>
                            <View style={styles.backgroundTouchable} />
                        </TouchableWithoutFeedback>

                        {/* Modal-Sheet */}
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalHeading}>Comments</Text>

                            <FlatList
                                data={comments || []}
                                renderItem={renderCommentItem}
                                keyExtractor={(item, index) => index.toString()}
                                style={{ flex: 1, width: "100%" }}
                                contentContainerStyle={{ paddingBottom: 80 }}
                                keyboardShouldPersistTaps="handled"
                                nestedScrollEnabled={true}
                            />

                            <View style={styles.bottomRow}>
                                <TextInput
                                    value={newComment}
                                    onChangeText={setNewComment}
                                    placeholder={"comment"}
                                    placeholderTextColor={"#000"}
                                    style={styles.input}
                                />
                                <TouchableOpacity style={styles.addCommentButton} onPress={addComment}>
                                    <Text style={styles.addCommentButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaProvider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
    },
    heading: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#000",
        marginTop: Platform.OS === "android" ? 20 : 0,
        marginBottom: 20,
    },
    search: {
        width: "95%",
        padding: 15,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "rgba(74, 144, 226, 0.1)",
        shadowColor: "#4A90E2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },

    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },

    backgroundTouchable: {
        flex: 1,
    },

    modalContainer: {
        backgroundColor: "#f9fafb",
        padding: 16,
        maxHeight: "50%",
        minHeight: "50%",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderWidth: 1,
        borderColor: "rgba(74, 144, 226, 0.1)",
        shadowColor: "#4a90e2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 8,
        width: "100%",
    },

    commentItem: {
        width: "100%",
        minHeight: 40,
        borderBottomWidth: 1,
        borderColor: "rgba(74, 144, 226, 0.3)",
        justifyContent: "center",
        padding: 10,
    },

    comment: {
        fontSize: 18,
        flexWrap: "wrap",
    },

    modalHeading: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#000",
        marginTop: 20,
        marginBottom: 20,
        alignSelf: "center",
    },

    bottomRow: {
        flexDirection: "row",
        position: "absolute",
        bottom: 30,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0)",
    },

    input: {
        alignSelf: "center",
        width: "80%",
        height: 50,
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

    addCommentButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#4a90e2",
        marginHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    addCommentButtonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
    },


});