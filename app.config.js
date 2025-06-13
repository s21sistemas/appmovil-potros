import withFixedFirebaseModularHeaders from "./expo-plugins/withFixedFirebaseModularHeaders";

export default {
  expo: {
    name: "ClubPotros",
    slug: "club-potros-app",
    owner: "s21sistemas", // ← AGREGAR ESTA LÍNEA
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logoPotros.jpg",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    permissions: [
      "CAMERA",
      "MEDIA_LIBRARY"
    ],
    splash: {
      image: "./assets/logoPotros.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    fonts: [
      {
        name: "MiFuente",
        file: "./assets/fonts/MiFuente.ttf"
      }
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mx.s1sistem.ClubPotros",
      icon: "./assets/logoPotros.jpg",
      buildNumber: "1.0.0",
      usesAppleSignIn: true,
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        NSPhotoLibraryUsageDescription: "Permite acceder a tus fotos para subir imágenes",
        NSCameraUsageDescription: "Permite tomar fotos para subir a la aplicación",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.mx.s1sistem.ClubPotros",
      
      adaptiveIcon: {
        foregroundImage: "./assets/potrosIcon.png",
        backgroundColor: "#ffffff"
      },
      icon: "./assets/potrosIcon.png",
      permissions: [
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT"
      ]
    },
    web: {
      favicon: "./assets/potrosIcon.png"
    },
    extra: {
      eas: {
        projectId: "188b7c17-174d-408f-90b0-41e17117eae3"
      }
    },
    plugins: [
      "expo-signature",
      withFixedFirebaseModularHeaders 
    ]
  }
};
