import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Lock } from "lucide-react-native";
import { clsx } from "clsx";

interface SecureContentProps {
  children: React.ReactNode;
}

export function SecureContent({ children }: SecureContentProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setHasHardware(compatible);
    })();
  }, []);

  const handleAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to view Mission Log",
        fallbackLabel: "Use Passcode",
      });

      if (result.success) {
        setIsUnlocked(true);
      } else {
        Alert.alert("Authentication Failed", "Access to Mission Log denied.");
      }
    } catch (error) {
       Alert.alert("Error", "Biometric authentication unavailable.");
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative min-h-[100px] flex items-center justify-center">
      <TouchableOpacity 
        onPress={handleAuth}
        activeOpacity={0.7}
        className="items-center justify-center p-8 space-y-4"
      >
        <Lock size={32} color="#71717a" />
        <Text className="text-zinc-500 font-mono text-xs uppercase tracking-widest font-bold">
          {hasHardware ? "Biometric Auth Required" : "Tap to Unlock"}
        </Text>
      </TouchableOpacity>
      
      {/* Fake blurred text background effect (optional, maybe just black box is safer) */}
      <View className="absolute inset-0 -z-10 opacity-10">
         <Text className="text-zinc-700 text-[10px] font-mono p-4">
             // ENCRYPTED DATA // ENCRYPTED DATA // ENCRYPTED DATA // ENCRYPTED DATA
             // ENCRYPTED DATA // ENCRYPTED DATA // ENCRYPTED DATA // ENCRYPTED DATA
             // ENCRYPTED DATA // ENCRYPTED DATA // ENCRYPTED DATA // ENCRYPTED DATA
         </Text>
      </View>
    </View>
  );
}
