import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Plus, RotateCcw } from 'lucide-react-native';

const TasbihCounter = () => {
    const [count, setCount] = useState<number>(0);
    const progressAnim = useState(new Animated.Value(0))[0];

    const incrementCount = useCallback(() => {
        setCount(prev => {
            const next = prev + 1;
            Animated.timing(progressAnim, {
                toValue: next / 100,
                duration: 300,
                useNativeDriver: false,
            }).start();
            return next;
        });
    }, [progressAnim]);

    const resetCounter = useCallback(() => {
        setCount(0);
        progressAnim.setValue(0);
    }, [progressAnim]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.progressRing, { transform: [{ rotate: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0rad', '1rad'] }) }] }]}/>
            <Text style={styles.count}>{count}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={incrementCount}>
                    <Plus size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={resetCounter}>
                    <RotateCcw size={30} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: '#FF7E5F',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    progressRing: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        position: 'absolute' as const,
    },
    count: {
        fontSize: 40,
        fontWeight: 'bold' as const,
        color: '#ffffff',
    },
    buttonContainer: {
        flexDirection: 'row' as const,
        marginTop: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 50,
        padding: 10,
        margin: 10,
    },
});

export default TasbihCounter;