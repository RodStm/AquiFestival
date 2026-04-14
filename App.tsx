import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddEditFestival from './screens/AddEditFestival';
import FestivalDetail from './screens/FestivalDetail';
import FestivalList from './screens/FestivalList';
import Home from './screens/Home';
import Login from './screens/Login';
import RegisterUser from './screens/RegisterUser';
import { Festival, User } from './types';

type Screen = 'home' | 'login' | 'register' | 'festivalRegister' | 'list' | 'detail';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data) {
      setUser(JSON.parse(data));
    }
  };

  const goHome = () => {
    setScreen('home');
  };

  const refreshAndGoHome = () => {
    setRefreshCount((current) => current + 1);
    setScreen('home');
  };

  const handleLogin = (nextUser: User) => {
    setUser(nextUser);
    setScreen('list');
  };

  const handleRegisterUser = (nextUser: User) => {
    setUser(nextUser);
    setScreen('list');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setScreen('home');
  };

  const handleSelectFestival = (festival: Festival) => {
    setSelectedFestival(festival);
    setScreen('detail');
  };

  const handleAddFestival = () => {
    if (!user?.isAdmin) {
      Alert.alert('Acesso negado', 'Apenas o administrador pode criar festivais.');
      return;
    }

    setSelectedFestival(null);
    setScreen('festivalRegister');
  };

  const handleEdit = () => {
    if (!user?.isAdmin) {
      Alert.alert('Acesso negado', 'Apenas o administrador pode editar festivais.');
      return;
    }

    setScreen('festivalRegister');
  };

  const handleDeleteFestival = () => {
    refreshAndGoHome();
  };

  const handleSuspendFestival = () => {
    refreshAndGoHome();
  };

  const handleSaveToHome = () => {
    refreshAndGoHome();
  };

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

  if (screen === 'login') {
    return <Login onLogin={handleLogin} onCancel={goHome} />;
  }

  if (screen === 'register') {
    return <RegisterUser onRegister={handleRegisterUser} onCancel={goHome} />;
  }

  if (screen === 'list') {
    return (
      <FestivalList
        user={user!}
        onLogout={handleLogout}
        onSelectFestival={handleSelectFestival}
        onAddFestival={handleAddFestival}
        refreshTrigger={refreshCount}
      />
    );
  }

  if (screen === 'detail') {
    if (!selectedFestival) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f8f0' }}>
          <Text style={{ fontSize: 18, color: '#d32f2f', marginBottom: 20 }}>Erro ao carregar festival</Text>
          <Button title="Voltar" onPress={goHome} />
        </View>
      );
    }

    return (
      <FestivalDetail
        festival={selectedFestival}
        user={user}
        onBack={goHome}
        onEdit={handleEdit}
        onDelete={handleDeleteFestival}
        onSuspend={handleSuspendFestival}
      />
    );
  }

  if (screen === 'festivalRegister') {
    return (
      <AddEditFestival
        user={user}
        festival={selectedFestival || undefined}
        onSave={handleSaveToHome}
        onCancel={goHome}
      />
    );
  }

  return null;
}
