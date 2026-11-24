import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { ImagePlus, RotateCcw } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { recognizeReceipt } from '@/services/ocr/ocrService';

export default function Scan() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);

  async function process(uri: string) {
    setProcessing(true);
    try {
      const optimized = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1800 } }], { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG });
      const extracted = await recognizeReceipt(optimized.uri);
      router.push({ pathname: '/scan/review', params: { extracted: JSON.stringify(extracted), uri: optimized.uri } });
    } catch (error) {
      Alert.alert('OCR unavailable', error instanceof Error ? error.message : 'Unable to process this image.');
    } finally {
      setProcessing(false);
    }
  }

  async function capture() {
    const photo = await camera.current?.takePictureAsync({ quality: 0.85 });
    if (photo) await process(photo.uri);
  }

  async function upload() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!result.canceled) await process(result.assets[0].uri);
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView style={[styles.permission, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Camera access</Text>
        <Text style={{ color: theme.muted, textAlign: 'center', marginBottom: 20 }}>Allow camera access to scan physical receipts.</Text>
        <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={requestPermission}><Text style={styles.buttonText}>Allow camera</Text></Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.camera}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />
      <View style={styles.frame} />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.top}><Text style={styles.cameraTitle}>Scan receipt</Text></View>
        <View style={styles.bottom}>
          <Pressable style={styles.side} onPress={upload}><ImagePlus color="white" /><Text style={styles.sideText}>Gallery</Text></Pressable>
          <Pressable style={[styles.capture, processing && { opacity: 0.5 }]} disabled={processing} onPress={capture}>{processing ? <ActivityIndicator color={theme.primary} /> : <View style={styles.captureInner} />}</Pressable>
          <View style={styles.side} />
        </View>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  camera: { flex: 1, backgroundColor: '#000' }, frame: { position: 'absolute', top: '17%', left: '8%', right: '8%', bottom: '24%', borderWidth: 2, borderColor: 'rgba(255,255,255,.85)', borderRadius: 18 },
  overlay: { flex: 1, justifyContent: 'space-between' }, top: { alignItems: 'center', paddingTop: 12 }, cameraTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, paddingBottom: 30 }, side: { width: 70, alignItems: 'center', gap: 4 }, sideText: { color: 'white', fontSize: 12 },
  capture: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }, captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#10B981' },
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, title: { fontSize: 28, fontWeight: '800', marginBottom: 10 }, button: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }, buttonText: { color: 'white', fontWeight: '800' },
});
