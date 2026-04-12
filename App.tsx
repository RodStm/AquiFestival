import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importação de todas as telas da aplicação
import Home from './screens/Home';
import Login from './screens/Login';
import RegisterUser from './screens/RegisterUser';
import FestivalList from './screens/FestivalList';
import FestivalDetail from './screens/FestivalDetail';
import AddEditFestival from './screens/AddEditFestival';
import { User, Festival } from './types';

// Define os tipos de telas disponíveis na navegação
type Screen = 'home' | 'login' | 'register' | 'festivalRegister' | 'list' | 'detail';

/**
 * Componente principal da aplicação
 * Gerencia a navegação entre telas e o estado global de usuário e festivais
 */
export default function App() {
  // Estado que controla qual tela está sendo exibida
  const [screen, setScreen] = useState<Screen>('home');
  
  // Estado do usuário logado (null se não estiver autenticado)
  const [user, setUser] = useState<User | null>(null);
  
  // Estado do festival selecionado para visualizar/editar
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  
  // Contador para recarregar a lista de festivais quando um novo é criado
  const [refreshCount, setRefreshCount] = useState(0);

  // Executa ao carregar o componente - verifica se há usuário logado
  useEffect(() => {
    checkLogin();
  }, []);

  /**
   * Verifica se existe usuário logado no AsyncStorage
   * Se sim, restaura a sessão do usuário
   */
  const checkLogin = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const u = JSON.parse(data);
      setUser(u);
    }
  };

  /**
   * Handler para quando usuário faz login
   * @param u - Objeto do usuário autenticado
   */
  const handleLogin = (u: User) => {
    setUser(u);
    setScreen('list');
  };

  /**
   * Handler para quando usuário se registra
   * @param u - Novo usuário registrado
   */
  const handleRegisterUser = (u: User) => {
    setUser(u);
    setScreen('list');
  };

  /**
   * Handler para logout
   * Remove dados do usuário do AsyncStorage
   */
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setScreen('home');
  };

  /**
   * Handler para seleção de um festival
   * @param f - Festival selecionado
   */
  const handleSelectFestival = (f: Festival) => {
    setSelectedFestival(f);
    setScreen('detail');
  };

  /**
   * Retorna para a tela inicial
   */
  const handleBackToHome = () => {
    setScreen('home');
  };

  /**
   * Retorna para casa (home page)
   */
  const handleBack = () => {
    setScreen('home');
  };

  /**
   * Handler para abrir tela de criar novo festival
   */
  const handleAddFestival = () => {
    setSelectedFestival(null);
    setScreen('festivalRegister');
  };

  /**
   * Handler para editar festival selecionado
   */
  const handleEdit = () => {
    setScreen('festivalRegister');
  };

  /**
   * Handler para salvar festival e retornar à home
   * Incrementa refreshCount para recarregar lista de festivais
   */
  const handleSaveToHome = () => {
    setRefreshCount(prev => prev + 1);
    setScreen('home');
  };

  /**
   * Handler para salvar e retornar à lista
   */
  const handleSave = () => {
    setScreen('list');
  };

  // ============ RENDERIZAÇÃO CONDICIONAL DAS TELAS ============

  // Tela inicial - Exibe histórico de festivais
  if (screen === 'home') {
    return (
      <Home
        user={user}
        onLogin={() => setScreen('login')}
        onRegisterUser={() => setScreen('register')}
        onRegisterFestival={handleAddFestival}
        onViewFestivals={() => setScreen('list')}
        onSelectFestival={handleSelectFestival}
        refreshTrigger={refreshCount}
      />
    );
  }

  // Tela de login
  if (screen === 'login') {
    return <Login onLogin={handleLogin} onCancel={handleBackToHome} />;
  }

  // Tela de registro de novo usuário
  if (screen === 'register') {
    return <RegisterUser onRegister={handleRegisterUser} onCancel={handleBackToHome} />;
  }

  // Tela de lista de festivais (apenas para usuários logados)
  if (screen === 'list') {
    return <FestivalList user={user!} onLogout={handleLogout} onSelectFestival={handleSelectFestival} onAddFestival={handleAddFestival} />;
  }

  // Tela de detalhes de um festival específico
  if (screen === 'detail') {
    if (!selectedFestival) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f8f0' }}>
          <Text style={{ fontSize: 18, color: '#d32f2f', marginBottom: 20 }}>Erro ao carregar festival</Text>
          <Button title="Voltar" onPress={handleBack} />
        </View>
      );
    }
    return <FestivalDetail festival={selectedFestival} user={user!} onBack={handleBack} onEdit={handleEdit} />;
  }

  // Tela de criar ou editar festival
  if (screen === 'festivalRegister') {
    return <AddEditFestival user={user} festival={selectedFestival || undefined} onSave={handleSaveToHome} onCancel={handleBackToHome} />;
  }

  return null;
}
