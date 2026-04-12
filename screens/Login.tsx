import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// Hook para tamanho responsivo
const { width, height } = Dimensions.get('window');

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
  // Estado do email
  const [email, setEmail] = useState('');
  
  // Estado da senha
  const [password, setPassword] = useState('');

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

    // Verifica se é login de admin
    if (email.toLowerCase() === 'admin@tapajos.com' && password === 'admin') {
      const adminUser: User = {
        id: 'admin',
        name: 'Administrador',
        age: 0,
        sex: 'N/A',
        email,
        city: '', // Campo retirado mas mantido por compatibilidade
        password: 'admin',
        isAdmin: true,
      };
      // Salva admin na sessão
      await AsyncStorage.setItem('user', JSON.stringify(adminUser));
      onLogin(adminUser);
      return;
    }

    // Busca usuário no AsyncStorage
    const data = await AsyncStorage.getItem('users');
    const users: User[] = data ? JSON.parse(data) : [];
    
    // Procura usuário com email e senha correspondentes
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (existing) {
      // Usuário encontrado - salva na sessão
      await AsyncStorage.setItem('user', JSON.stringify(existing));
      onLogin(existing);
    } else {
      // Credenciais inválidas
      Alert.alert('Erro', 'Usuário não encontrado ou senha incorreta.\nFaça cadastro para criar uma conta nova.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Título da tela */}
        <Text style={styles.title}>Acesso à Conta</Text>
        
        {/* Descrição */}
        <Text style={styles.description}>
          Digite suas credenciais para acessar sua conta
        </Text>

        {/* Campo Email */}
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

        {/* Campo Senha */}
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

        {/* Dica para conta admin */}
        <Text style={styles.hint}>
          💡 Dica: Teste com admin@tapajos.com / admin
        </Text>

        {/* Botão de Login */}
        <View style={styles.buttonContainer}>
          <Button 
            title="Entrar" 
            onPress={handleLogin}
            color="#4CAF50"
          />
        </View>

        {/* Espaçador */}
        <View style={styles.spacer} />

        {/* Botão de Cancelar */}
        <View style={styles.buttonContainer}>
          <Button 
            title="Voltar" 
            onPress={onCancel}
            color="#999"
          />
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
  // Container principal com fundo verde claro
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
  },

  // Container interno com centralização
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.08, // 8% da largura
    paddingVertical: height * 0.05, // 5% da altura
  },

  // Título da tela
  title: {
    fontSize: width > 400 ? 28 : 24,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },

  // Descrição/subtítulo
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    fontSize: 14,
    lineHeight: 20,
  },

  // Grupo para cada campo de entrada
  inputGroup: {
    marginBottom: 20,
  },

  // Label dos inputs
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 8,
  },

  // Input field com border e padding responsivo
  input: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },

  // Dica de login para teste
  hint: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginBottom: 25,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },

  // Container de botão com espaço consistente
  buttonContainer: {
    marginVertical: 10,
  },

  // Espaçador entre botões
  spacer: {
    height: 15,
  },
});

export default Login;