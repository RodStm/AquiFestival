import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// Hook para tamanho responsivo
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
  // ===== ESTADOS DOS CAMPOS =====
  
  // Nome e seu estado de erro
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  
  // Idade e seu estado de erro
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');
  
  // Sexo e seu estado de erro
  const [sex, setSex] = useState('');
  const [sexError, setSexError] = useState('');
  
  // Email
  const [email, setEmail] = useState('');
  
  // Senha
  const [password, setPassword] = useState('');

  /**
   * Handler para mudança de nome
   * Valida em tempo real: apenas letras e espaços
   * @param text - Texto digitado
   */
  const handleNameChange = (text: string) => {
    // Regex permite letras (incluindo acentos) e espaços
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
    // Regex permite apenas 0-2 dígitos
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
    // ===== VALIDAÇÕES =====

    // Valida nome
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      return;
    }

    // Valida idade
    if (!age) {
      setAgeError('Idade é obrigatória');
      return;
    }

    // Valida sexo
    if (!sex) {
      setSexError('Selecione um sexo');
      return;
    }

    // Valida email
    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }

    // Valida senha
    if (!password) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return;
    }

    // Validação final de nome (apenas letras)
    if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(name)) {
      setNameError('Nome só pode conter letras');
      return;
    }

    // Validação final de idade (1-2 dígitos)
    if (!/^\d{1,2}$/.test(age)) {
      setAgeError('Idade deve ser um número de 1 a 2 dígitos');
      return;
    }

    // ===== VERIFICAÇÃO DE EMAIL DUPLICADO =====

    const data = await AsyncStorage.getItem('users');
    const users: User[] = data ? JSON.parse(data) : [];
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existing) {
      Alert.alert('Erro', 'Este e-mail já está cadastrado');
      return;
    }

    // ===== CRIAÇÃO DO NOVO USUÁRIO =====

    const newUser: User = {
      id: Date.now().toString(), // ID único baseado em timestamp
      name,
      age: Number(age),
      sex,
      email,
      city: '', // Campo removido do interface
      password,
      isAdmin: false, // Novo usuário não é admin
    };

    // Salva usuário no banco de dados
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    
    // Faz login automático do novo usuário
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    
    // Notifica sucesso e retorna
    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    onRegister(newUser);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ===== TÍTULO ===== */}
        <Text style={styles.title}>Criar Conta</Text>
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

        {/* ===== BOTÕES DE AÇÃO ===== */}
        
        {/* Botão Cadastrar */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cadastrar Conta"
            onPress={handleRegister}
            color="#4CAF50"
          />
        </View>

        {/* Espaçador */}
        <View style={styles.spacer} />

        {/* Botão Cancelar */}
        <View style={styles.buttonContainer}>
          <Button
            title="Voltar"
            onPress={onCancel}
            color="#999"
          />
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
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
  },

  // Conteúdo dentro do ScrollView
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.08, // 8% da largura
    paddingVertical: height * 0.03, // 3% da altura
  },

  // Título principal
  title: {
    fontSize: width > 400 ? 28 : 24,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
    color: '#2E7D32',
  },

  // Descrição/subtítulo
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
    fontSize: 14,
    lineHeight: 20,
  },

  // Container para cada campo
  fieldGroup: {
    marginBottom: 18,
  },

  // Label dos campos
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 6,
  },

  // Input padrão
  input: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },

  // Input com erro (borda vermelha)
  inputError: {
    borderColor: '#d32f2f',
  },

  // Texto de erro
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },

  // Container dos botões de sexo
  sexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  // Botão de seleção de sexo
  sexButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  // Botão de sexo selecionado (destacado)
  sexButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
  },

  // Texto do botão de sexo
  sexButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },

  // Texto do botão de sexo selecionado
  sexButtonTextSelected: {
    color: '#fff',
  },

  // Container de botão com espaço
  buttonContainer: {
    marginVertical: 10,
  },

  // Espaçador entre botões
  spacer: {
    height: 15,
  },
});

export default RegisterUser;
