import {
    Animated,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/auth-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Account() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User>();
    const [surveys, setSurveys] = useState<any[]>([]);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
    const [newComment, setNewComment] = useState("");

    useFocusEffect(
        useCallback(() => {
            const getUser = async () => {
                const { data, error } = await supabase.auth.getUser();
                if (error) {
                    console.error(error);
                } else {
                    setUser(data.user);
                }
            };

            const loadData = async () => {
                const { data, error } = await supabase
                    .from("surveys")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error(error);
                    return;
                }

                const surveysWithNormalizedComments = (data || []).map((s) => {
                    let comments = Array.isArray(s.comments) ? s.comments : [];
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
            };



            getUser();
            loadData();
            setIsLoading(false);
        }, [])
    );

    const filteredSurveys = useMemo(() => {
        if (!user) return [];
        return surveys.filter((survey) => survey.useremail === user.email);
    }, [surveys, user]);

    const openComments = (survey: any) => {
        setSelectedSurvey(survey);
        setCommentModalVisible(true);
    };

    const addComment = async () => {
        if (!newComment || !selectedSurvey) return;

        const updatedComments = [
            ...(selectedSurvey.comments || []),
            { comment: newComment },
        ];

        const { error } = await supabase
            .from("surveys")
            .update({ comments: updatedComments })
            .eq("id", selectedSurvey.id);

        if (!error) {
            const updatedSurveys = surveys.map((s) =>
                s.id === selectedSurvey.id ? { ...s, comments: updatedComments } : s
            );
            setSurveys(updatedSurveys);
            setSelectedSurvey({ ...selectedSurvey, comments: updatedComments });
            setNewComment("");
        } else {
            console.error(error);
        }
    };

    const renderCommentItem = ({ item }: any) => (
        <View style={styles.commentItem}>
            <Text style={styles.comment}>{item.comment}</Text>
        </View>
    );

    const renderItem = ({ item }: any) => {
        const allParticipants = item.participants || 0;
        const percentAnswer1 =
            allParticipants > 0
                ? ((item.answer1part || 0) / allParticipants) * 100
                : 0;
        const percentAnswer2 =
            allParticipants > 0
                ? ((item.answer2part || 0) / allParticipants) * 100
                : 0;


        return (
            <View style={styles.itemCard}>
                <Text style={styles.questionText}>{item.question}</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>
                            {item.answer1} - {percentAnswer1.toFixed(0)}%
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>
                            {item.answer2} - {percentAnswer2.toFixed(0)}%
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.bottomRow}>
                        <TouchableOpacity style={styles.commentButton}>
                            <Ionicons name="heart-outline" size={25} color="#000" />
                            <Text>{item.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.commentButton}
                            onPress={() => openComments(item)}
                        >
                            <Ionicons name="chatbubble-outline" size={25} color="#000" />
                            <Text>{item.comments?.length || 0}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (!isLoading) {

        return (
            <SafeAreaProvider style={styles.container}>
                <Ionicons
                    name="person"
                    size={130}
                    color="#000"
                    style={{marginTop: 60}}
                />
                <Text style={styles.heading}>{user?.email}</Text>

                <View style={styles.card}>
                    <Text style={styles.cardHeading}>Your Surveys</Text>
                    <FlatList
                        data={filteredSurveys}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>

                <Modal
                    visible={commentModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setCommentModalVisible(false)}
                >
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback
                            onPress={() => setCommentModalVisible(false)}
                        >
                            <View style={styles.backgroundTouchable}/>
                        </TouchableWithoutFeedback>

                        <View style={styles.modalContainer}>
                            <Text style={styles.modalHeading}>Comments</Text>

                            <FlatList
                                data={selectedSurvey?.comments || []}
                                renderItem={renderCommentItem}
                                keyExtractor={(item, index) => index.toString()}
                                style={{flex: 1, width: "100%"}}
                                contentContainerStyle={{paddingBottom: 80}}
                            />
                        </View>
                    </View>
                </Modal>
            </SafeAreaProvider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginTop: Platform.OS === "android" ? 20 : 0,
        marginBottom: 20,
    },
    card: {
        alignSelf: "center",
        width: "95%",
        maxHeight: "50%",
        minHeight: "50%",
        padding: 16,
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
    cardHeading: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginTop: 10,
        marginBottom: 20,
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
        color: "#000",
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
    bottomRow: {
        width: "90%",
        flexDirection: "row",
        alignSelf: "center",
        alignItems: "flex-end",
        marginTop: 10,
    },
    commentButton: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        marginHorizontal: 5,
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

    modalHeading: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#000",
        marginTop: 20,
        marginBottom: 20,
        alignSelf: "center",
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
    commentInputRow: {
        flexDirection: "row",
        position: "absolute",
        bottom: 20,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    commentInput: {
        width: "80%",
        height: 45,
        borderWidth: 1,
        borderColor: "rgba(74,144,226,0.3)",
        borderRadius: 20,
        backgroundColor: "#fff",
        paddingHorizontal: 15,
    },
});