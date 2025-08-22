import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FixedGroqService } from "./fixedGroqService";

const TOSCA = "#73E0D1";
const BG = "#FFFFFF";

export default function ScanningScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const navigation = useNavigation<any>();
  const [scanAnimation] = useState(new Animated.Value(0));
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Hide tab bar
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation])
  );

  useEffect(() => {
    // Start scanning animation
    const animate = () => {
      Animated.loop(
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    animate();

    // Simulate OCR processing
    const processImage = async () => {
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 10;
          });
        }, 300);

        // Process image with OCR service
        setTimeout(async () => {
          try {
            console.log('Starting OCR processing with URI:', uri);
            
            if (!uri) {
              throw new Error('No image URI provided');
            }

            const ocrResults = await FixedGroqService.processReceipt(uri);
            console.log('OCR processing completed:', ocrResults);
            
            clearInterval(progressInterval);
            setProgress(100);

            // Navigate to results
            setTimeout(() => {
              router.replace({
                pathname: "/(tabs)/bill/scan-bill/results",
                params: { 
                  uri: uri,
                  results: JSON.stringify(ocrResults)
                }
              });
            }, 500);
            
          } catch (error) {
            clearInterval(progressInterval);
            console.error("OCR processing failed:", error);
            setError(String(error));
            
            // Navigate to results with empty data
            setTimeout(() => {
              router.replace({
                pathname: "/(tabs)/bill/scan-bill/results",
                params: { 
                  uri: uri || '',
                  results: JSON.stringify({
                    items: [],
                    subtotal: 0,
                    discount: 0,
                    tax: 0,
                    taxPercentage: 0,
                    serviceCharge: 0,
                    serviceChargePercentage: 0,
                    total: 0,
                    confidence: 0,
                    rawText: "OCR failed",
                    provider: "error"
                  })
                }
              });
            }, 1000);
          }
        }, 2000);

      } catch (error) {
        console.error("OCR processing failed:", error);
        // Handle error - could show error screen or go back
        setTimeout(() => router.back(), 2000);
      }
    };

    processImage();
  }, [uri]);

  const rotateInterpolate = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.scanIcon, { transform: [{ rotate: rotateInterpolate }] }]}>
            <Ionicons name="scan" size={64} color={TOSCA} />
          </Animated.View>
        </View>

        <Text style={styles.title}>
          {error ? 'Gagal Memindai' : 'Memindai dengan Groq AI'}
        </Text>
        <Text style={styles.subtitle}>
          {error 
            ? `OCR Error: ${error}`
            : 'Groq Llama-4 Scout sedang menganalisis struk untuk mengekstrak nama pesanan, diskon per item, harga, dan pajak...'
          }
        </Text>

        {!error && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons 
              name={progress > 25 ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={progress > 25 ? TOSCA : "#ccc"} 
            />
            <Text style={[styles.statusText, progress > 25 && styles.statusTextActive]}>
              Memproses gambar
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={progress > 50 ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={progress > 50 ? TOSCA : "#ccc"} 
            />
            <Text style={[styles.statusText, progress > 50 && styles.statusTextActive]}>
              Menganalisis dengan AI
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={progress > 75 ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={progress > 75 ? TOSCA : "#ccc"} 
            />
            <Text style={[styles.statusText, progress > 75 && styles.statusTextActive]}>
              Mengekstrak item menu
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={progress > 90 ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={progress > 90 ? TOSCA : "#ccc"} 
            />
            <Text style={[styles.statusText, progress > 90 && styles.statusTextActive]}>
              Menghitung total, pajak & layanan
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 32,
  },
  scanIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${TOSCA}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  progressBar: {
    width: "80%",
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: TOSCA,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusContainer: {
    width: "100%",
    gap: 16,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#ccc",
  },
  statusTextActive: {
    color: "#111827",
    fontWeight: "500",
  },
});