import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  Image, 
  Pressable, 
  Platform,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    ocupacion: '',
  });

  const showAlert = (title, message, isSuccess = false) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(
        title,
        message,
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (isSuccess) {
                navigation.navigate('Login');
              }
            }
          }
        ]
      );
    }
  };

  const translateFirebaseError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está registrado. ¿Ya tienes una cuenta?';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña generada no es segura. Por favor, inténtalo de nuevo.';
      case 'auth/network-request-failed':
        return 'Problema de conexión a internet. Verifica tu conexión.';
      default:
        return 'Ocurrió un error al registrar. Por favor, inténtalo de nuevo.';
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { nombreCompleto: '', correo: '', telefono: '', ocupacion: '' };

    if (!nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es obligatorio.';
      isValid = false;
    }

    if (!correo.trim()) {
      newErrors.correo = 'El correo es obligatorio.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      newErrors.correo = 'El correo no es válido.';
      isValid = false;
    }


    setErrors(newErrors);
    return isValid;
  };

  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const isCodeUnique = async (code) => {
    const q = query(collection(db, 'usuarios'), where('codigo_acceso', '==', code));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const sendEmail = async (email, code, uid) => {
    try {
      const response = await fetch('https://us-central1-clubpotros-f28a5.cloudfunctions.net/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, uid }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error('No se pudo enviar el correo.');
      }
    } catch (err) {
      console.error('Error al enviar el correo:', err);
      throw new Error('No se pudo enviar el correo. El código de acceso es: ' + code);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let codigoAcceso;
      let isUnique = false;
      let intentos = 0;
      const maxIntentos = 5;

      while (!isUnique && intentos < maxIntentos) {
        codigoAcceso = generateRandomCode();
        isUnique = await isCodeUnique(codigoAcceso);
        intentos++;
      }

      if (!isUnique) {
        throw new Error('No se pudo generar un código único. Por favor, inténtalo de nuevo.');
      }

      Alert.alert(
        'Registrando usuario',
        'Estamos creando tu cuenta. Por favor espera...',
        [],
        { cancelable: false }
      );

      const userCredential = await createUserWithEmailAndPassword(auth, correo, codigoAcceso);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        rol_id: "",
        nombre_completo: nombreCompleto,
        correo,
        celular: telefono,
        ocupacion,
        codigo_acceso: codigoAcceso,
        fecha_registro: new Date().toISOString(),
      };

      await addDoc(collection(db, 'usuarios'), userData);

      Alert.alert(
        'Enviando código de acceso',
        'Estamos enviando el código a tu correo electrónico...',
        [],
        { cancelable: false }
      );

      await sendEmail(correo, codigoAcceso, user.uid);

      showAlert(
        '¡Registro exitoso!', 
        `Usuario registrado correctamente. Tu código de acceso ha sido enviado a tu correo electrónico.`, 
        true
      );

    } catch (err) {
      console.error('Error al registrar el usuario:', err);
      
      const errorMessage = err.code 
        ? translateFirebaseError(err) 
        : err.message || 'Error al registrar el usuario. Por favor, inténtalo de nuevo.';
      
      showAlert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Image
                source={require('../assets/logoPotros.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Registro Club Potros</Text>
              <Text style={styles.subtitle}>Padres/Tutores de Jugadores</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput
                  style={[styles.input, errors.nombreCompleto && styles.inputError]}
                  placeholder="Ej. Juan Pérez López"
                  placeholderTextColor="#999"
                  value={nombreCompleto}
                  onChangeText={setNombreCompleto}
                  editable={!loading}
                />
                {errors.nombreCompleto && <Text style={styles.errorText}>{errors.nombreCompleto}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                  style={[styles.input, errors.correo && styles.inputError]}
                  placeholder="Ej. usuario@correo.com"
                  placeholderTextColor="#999"
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono <Text style={styles.optionalText}>(opcional)</Text></Text>
                <TextInput
                  style={[styles.input, errors.telefono && styles.inputError]}
                  placeholder="10 dígitos"
                  placeholderTextColor="#999"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
                {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ocupación <Text style={styles.optionalText}>(opcional)</Text></Text>
                <TextInput
                  style={[styles.input, errors.ocupacion && styles.inputError]}
                  placeholder="Ej. Profesionista, Comerciante"
                  placeholderTextColor="#999"
                  value={ocupacion}
                  onChangeText={setOcupacion}
                  editable={!loading}
                />
                {errors.ocupacion && <Text style={styles.errorText}>{errors.ocupacion}</Text>}
              </View>

              <Pressable 
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled
                ]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="person-add" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Registrarse</Text>
                  </View>
                )}
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  disabled={loading}
                >
                  <Text style={[styles.footerLink, loading && styles.linkDisabled]}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b51f28',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginLeft: 5,
  },
  optionalText: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'normal',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#b51f28',
    backgroundColor: '#FFF9F9',
  },
  errorText: {
    color: '#b51f28',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#b51f28',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#b51f28',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonPressed: {
    backgroundColor: '#9a1a22',
  },
  buttonDisabled: {
    backgroundColor: '#D3D3D3',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#b51f28',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  linkDisabled: {
    color: '#999',
  },
});

export default RegisterScreen;