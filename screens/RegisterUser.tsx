import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const { width, height } = Dimensions.get('window');

/**
 * Props da tela de Registro
 * onRegister: Callback executado após registro bem-sucedido
 * onCancel: Callback para retornar à tela anterior
 */
interface RegisterUserProps {
  onRegister: (user: User) => void;
  onCancel: () => void;
}

/**
 * Componente de Registro de Usuário
 * Valida entrada de dados em tempo real:
 * - Nome: apenas letras
 * - Idade: apenas números até 2 dígitos
 * - Sexo: seleção entre Feminino ou Masculino
 * - Email: campo de texto livre
 * - Senha: campo de texto seguro
 */
const RegisterUser: React.FC<RegisterUserProps> = ({ onRegister, onCancel }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');
  const [sex, setSex] = useState('');
  const [sexError, setSexError] = useState('');
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
   * Handler para mudança de nome
   * Valida em tempo real: apenas letras e espaços
   * @param text - Texto digitado
   */
  const handleNameChange = (text: string) => {
    if (text === '' || /^[a-zA-ZÀ-ÿ\s]*$/.test(text)) {
      setName(text);
      setNameError('');
    } else {
      setNameError('Nome só pode conter letras');
    }
  };

  /**
   * Handler para mudança de idade
   * Valida em tempo real: apenas números até 2 dígitos
   * @param text - Texto digitado
   */
  const handleAgeChange = (text: string) => {
    if (text === '' || /^\d{0,2}$/.test(text)) {
      setAge(text);
      setAgeError('');
    } else {
      setAgeError('Idade deve ter até 2 dígitos numéricos');
    }
  };

  /**
   * Handler para seleção de sexo
   * @param selectedSex - 'Feminino' ou 'Masculino'
   */
  const handleSexSelect = (selectedSex: string) => {
    setSex(selectedSex);
    setSexError('');
  };

  /**
   * Handler para registro
   * Valida todos os campos antes de criar o usuário
   * Verifica se email já existe no banco de dados
   */
  const handleRegister = async () => {
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      return;
    }

    if (!age) {
      setAgeError('Idade é obrigatória');
      return;
    }

    if (!sex) {
      setSexError('Selecione um sexo');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }

    if (!password) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return;
    }

    if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(name)) {
      setNameError('Nome só pode conter letras');
      return;
    }

    if (!/^\d{1,2}$/.test(age)) {
      setAgeError('Idade deve ser um número de 1 a 2 dígitos');
      return;
    }

    const data = await AsyncStorage.getItem('users');
    const users: User[] = data ? JSON.parse(data) : [];
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existing) {
      Alert.alert('Erro', 'Este e-mail já está cadastrado');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      age: Number(age),
      sex,
      email,
      city: '',
      password,
      isAdmin: false,
    };

    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));

    await AsyncStorage.setItem('user', JSON.stringify(newUser));

    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    onRegister(newUser);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>AquiFest</Text>
          <Text style={styles.title}>Criar Conta</Text>
        </View>
        <Text style={styles.description}>
          Preencha os dados abaixo para se registrar
        </Text>

        {/* ===== CAMPO NOME ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={handleNameChange}
            autoCapitalize="words"
            editable={true}
            placeholderTextColor="#bbb"
          />
          {nameError && <Text style={styles.errorText}>{nameError}</Text>}
        </View>

        {/* ===== CAMPO IDADE ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Idade</Text>
          <TextInput
            style={[styles.input, ageError ? styles.inputError : null]}
            keyboardType="numeric"
            value={age}
            onChangeText={handleAgeChange}
            placeholderTextColor="#bbb"
          />
          {ageError && <Text style={styles.errorText}>{ageError}</Text>}
        </View>

        {/* ===== SELETOR DE SEXO ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Sexo</Text>
          <View style={styles.sexContainer}>
            {/* Botão Feminino */}
            <TouchableOpacity
              style={[
                styles.sexButton,
                sex === 'Feminino' && styles.sexButtonSelected,
              ]}
              onPress={() => handleSexSelect('Feminino')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sexButtonText,
                  sex === 'Feminino' && styles.sexButtonTextSelected,
                ]}
              >
                👩 Feminino
              </Text>
            </TouchableOpacity>

            {/* Botão Masculino */}
            <TouchableOpacity
              style={[
                styles.sexButton,
                sex === 'Masculino' && styles.sexButtonSelected,
              ]}
              onPress={() => handleSexSelect('Masculino')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sexButtonText,
                  sex === 'Masculino' && styles.sexButtonTextSelected,
                ]}
              >
                👨 Masculino
              </Text>
            </TouchableOpacity>
          </View>
          {sexError && <Text style={styles.errorText}>{sexError}</Text>}
        </View>

        {/* ===== CAMPO EMAIL ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#bbb"
          />
        </View>

        {/* ===== CAMPO SENHA ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.buttonContainer}>
          {renderActionButton('Cadastrar Conta', handleRegister)}
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          {renderActionButton('Voltar', onCancel, 'secondary')}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Estilos responsivos da tela de Registro
 * Utiliza Dimensions para adaptação automática à tela
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef5ef',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.03,
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
    marginBottom: 8,
    fontWeight: '800',
    color: '#1d4728',
  },

  description: {
    textAlign: 'center',
    color: '#5a6d60',
    marginBottom: 25,
    fontSize: 14,
    lineHeight: 20,
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#295c37',
    marginBottom: 6,
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

  inputError: {
    borderColor: '#d32f2f',
  },

  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },

  sexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  sexButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#bdd5bf',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  sexButtonSelected: {
    backgroundColor: '#1f6f43',
    borderColor: '#1f6f43',
  },

  sexButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#295c37',
  },

  sexButtonTextSelected: {
    color: '#fff',
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

export default RegisterUser;
