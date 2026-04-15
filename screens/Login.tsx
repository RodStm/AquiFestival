import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const { width, height } = Dimensions.get('window');
const ADMIN_EMAIL = 'admin@tapajos.com';
const ADMIN_PASSWORD = 'admin';

/**
 * Props da tela de Login
 * onLogin: Callback executado após login bem-sucedido
 * onCancel: Callback para retornar à tela anterior
 */
interface LoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

/**
 * Componente de Login
 * Permite autenticação de usuários existentes ou admin
 * Credenciais admin: email: admin@tapajos.com | senha: admin
 */
const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const renderActionButton = (label: string, onPress: () => void, variant: 'primary' | 'secondary' = 'primary') => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === 'secondary' ? styles.actionButtonSecondary : styles.actionButtonPrimary,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.actionButtonText,
          variant === 'secondary' ? styles.actionButtonTextSecondary : styles.actionButtonTextPrimary,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  /**
   * Handler para login
   * Valida credenciais e autentica o usuário
   * Suporta login de admin padrão
   */
  const handleLogin = async () => {
    // Validação: campos obrigatórios
    if (!email.trim() || !password) {
      Alert.alert('Erro', 'Informe email e senha');
      return;
    }

    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: 'admin',
        name: 'Administrador',
        age: 0,
        sex: 'N/A',
        email,
        city: '',
        password: ADMIN_PASSWORD,
        isAdmin: true,
      };
      await AsyncStorage.setItem('user', JSON.stringify(adminUser));
      onLogin(adminUser);
      return;
    }

    const data = await AsyncStorage.getItem('users');
    const users: User[] = data ? JSON.parse(data) : [];

    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (existing) {
      await AsyncStorage.setItem('user', JSON.stringify(existing));
      onLogin(existing);
    } else {
      Alert.alert('Erro', 'Usuário não encontrado ou senha incorreta.\nFaça cadastro para criar uma conta nova.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <TouchableOpacity onPress={onCancel} activeOpacity={0.8} style={styles.logoButton}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>AquiFest</Text>
          <Text style={styles.title}>Acesso a Conta</Text>
        </View>

        <Text style={styles.description}>
          Digite suas credenciais para acessar sua conta
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={true}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={true}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.hintCard}>
          <Text style={styles.hintLabel}>Acesso administrador</Text>
          <Text style={styles.hint}>Use admin@tapajos.com / admin</Text>
        </View>

        <View style={styles.buttonContainer}>
          {renderActionButton('Entrar', handleLogin)}
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          {renderActionButton('Voltar', onCancel, 'secondary')}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

/**
 * Estilos responsivos da tela de Login
 * Utiliza Dimensions para adaptação automática
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef5ef',
  },

  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.05,
  },

  logoButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    borderRadius: 18,
  },

  logo: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
  },

  headerBlock: {
    marginBottom: 8,
  },

  eyebrow: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#5a6d60',
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  title: {
    fontSize: width > 400 ? 28 : 24,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '800',
    color: '#1d4728',
  },

  description: {
    textAlign: 'center',
    color: '#5a6d60',
    marginBottom: 30,
    fontSize: 14,
    lineHeight: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#295c37',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#bdd5bf',
    padding: 14,
    borderRadius: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },

  hintCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#dcecdc',
    marginBottom: 10,
  },

  hintLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#295c37',
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  hint: {
    textAlign: 'center',
    color: '#476451',
    fontSize: 13,
  },

  buttonContainer: {
    marginVertical: 10,
  },

  spacer: {
    height: 15,
  },

  actionButton: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  actionButtonPrimary: {
    backgroundColor: '#1f6f43',
    borderColor: '#1f6f43',
  },

  actionButtonSecondary: {
    backgroundColor: '#ffffff',
    borderColor: '#bdd5bf',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },

  actionButtonTextPrimary: {
    color: '#ffffff',
  },

  actionButtonTextSecondary: {
    color: '#295c37',
  },
});

export default Login;