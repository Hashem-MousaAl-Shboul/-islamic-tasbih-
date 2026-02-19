import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const TasbihCounter = () => {
    const [count, setCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [timerActive, setTimerActive] = useState(false);
    const progressAnim = useState(new Animated.Value(0))[0];

    const incrementCount = () => {
        setCount(count + 1);
        if (soundEnabled) {
            // Play sound
        }
        if (vibrationEnabled) {
            // Trigger vibration
        }
        // Progress animation
        Animated.timing(progressAnim, {
            toValue: (count + 1) / 100,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const resetCounter = () => {
        setCount(0);
        progressAnim.setValue(0);
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.progressRing, { transform: [{ rotate: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0rad', '1rad'] }) }] }]}/>
            <Text style={styles.count}>{count}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={incrementCount}>
                    <Icon name="plus" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={resetCounter}>
                    <Icon name="refresh" size={30} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'linear-gradient(to right, #FF7E5F, #FEB47B)',
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
        position: 'absolute',
    },
    count: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    buttonContainer: {
        flexDirection: 'row',
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