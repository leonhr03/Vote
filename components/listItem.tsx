// components/SurveyItem.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";
import {Ionicons} from "@expo/vector-icons";

interface SurveyItemProps {
    item: any;
    onVoted?: () => void;
    onPressLike?: () => void;
    onPressComment?: () => void;
}

export default function SurveyItem({ item, onVoted, onPressLike, onPressComment }: SurveyItemProps) {
    const [voted, setVoted] = useState(false);
    const [isToggled, setIsToggled] = useState(false);

    useEffect(() => {
        const checkVote = async () => {
            const hasVoted = await AsyncStorage.getItem(`voted_${item.id}`);
            setVoted(!!hasVoted);
        };

        const checkLiked = async() => {
            const liked = await AsyncStorage.getItem(`liked_${item.id}`);
            if(liked === "true"){
                setIsToggled(true);
            }
            else{
                setIsToggled(false);
            }
        }
        checkLiked();
        checkVote();
    }, [item.id]);

    const handleVote = async (field: "answer1part" | "answer2part") => {
        if (voted) {
            alert("Du hast bereits abgestimmt!");
            return;
        }

        const newCount = (item[field] || 0) + 1;
        const newParticipants = (item.participants || 0) + 1;

        const { error } = await supabase
            .from("surveys")
            .update({
                [field]: newCount,
                participants: newParticipants,
            })
            .eq("id", item.id);

        if (error) {
            console.error(error);
            alert("Fehler beim Abstimmen!");
            return;
        }

        await AsyncStorage.setItem(`voted_${item.id}`, "true");
        setVoted(true);

        if (onVoted) onVoted();
    };

    const like = async() => {
       setIsToggled(!isToggled);
       if(onPressLike) onPressLike()

        if (!isToggled){
            const newLikes = (item.likes || 0) + 1


            const { error } = await supabase.from("surveys").update({
                likes: newLikes,
            }).eq("id", item.id);

            if (error) {
                console.error(error);
                alert("Fehler beim Liken");
            }

            await AsyncStorage.setItem(`liked_${item.id}`, "true");
        }
        else{
            const newLikes = (item.likes || 0) - 1


            const { error } = await supabase.from("surveys").update({
                likes: newLikes,
            }).eq("id", item.id);

            if (error) {
                console.error(error);
                alert("Fehler beim Liken");
            }

            await AsyncStorage.removeItem(`liked_${item.id}`);
        }

    };

    const allParticipants = item.participants || 0;
    const percentAnswer1 =
        allParticipants > 0 ? ((item.answer1part || 0) / allParticipants) * 100 : 0;
    const percentAnswer2 =
        allParticipants > 0 ? ((item.answer2part || 0) / allParticipants) * 100 : 0;

    return (
        <View style={styles.itemCard}>
            <Text style={styles.questionText}>{item.question}</Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, voted && { backgroundColor: "#888" }]}
                    disabled={voted}
                    onPress={() => handleVote("answer1part")}
                >
                    <Text style={styles.buttonText}>
                        {item.answer1} {voted ? ` ${percentAnswer1.toFixed(0)}%` : ""}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, voted && { backgroundColor: "#888" }]}
                    disabled={voted}
                    onPress={() => handleVote("answer2part")}
                >
                    <Text style={styles.buttonText}>
                        {item.answer2} {voted ? ` ${percentAnswer2.toFixed(0)}%` : ""}
                    </Text>
                </TouchableOpacity>

                <View style={styles.bottomRow}>
                    <TouchableOpacity style={styles.commentButton} onPress={like}>
                        {isToggled ? (<Ionicons name="heart" size={25} color="red" />) : <Ionicons name="heart-outline" size={25} color="#000" />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentButton} onPress={onPressComment}>
                        <Ionicons name="chatbubble-outline" size={25} color="#000" />
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        flexDirection: "row",
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
        marginHorizontal: 10,
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
    }
});