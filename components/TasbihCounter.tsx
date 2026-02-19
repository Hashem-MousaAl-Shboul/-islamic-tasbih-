import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const TasbihCounter = () => {
    const progress = React.useRef(new Animated.Value(0)).current;
    const [count, setCount] = React.useState(0);

    const animatedRing = progress.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
    });

    const handleCount = () => {
        setCount(count + 1);
        Animated.timing(progress, {
            toValue: (count + 1) % 100,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.progressRing, { opacity: animatedRing }]}/>
            <Text style={styles.counter}>{count}</Text>
            <Button title="Count" onPress={handleCount} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    progressRing: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#4caf50',
        position: 'absolute',
    },
    counter: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default TasbihCounter;