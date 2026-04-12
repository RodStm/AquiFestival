import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Festival } from '../types';

// Obtém as dimensões da tela para criar layouts responsivos
const { width, height } = Dimensions.get('window');

/**
 * Props da tela Home
 * user: Usuário logado ou null
 * onLogin: Callback para navegar para login
 * onRegisterUser: Callback para navegar para registro
 * onRegisterFestival: Callback para criar novo festival
 * onViewFestivals: Callback para ver lista completa de festivais
 * onSelectFestival: Callback quando festival é selecionado
 * refreshTrigger: Trigger para recarregar festivais
 */
interface HomeProps {
  user: User | null;
  onLogin: () => void;
  onRegisterUser: () => void;
  onRegisterFestival: () => void;
  onViewFestivals: () => void;
  onSelectFestival: (festival: Festival) => void;
  refreshTrigger?: number;
}

/**
 * Componente Home
 * Exibe o histórico de festivais com filtro por data de início
 * Permite navegação para login, registro e criação de festivais
 */
const Home: React.FC<HomeProps> = ({ 
  user, 
  onLogin, 
  onRegisterUser, 
  onRegisterFestival, 
  onViewFestivals, 
  onSelectFestival, 
  refreshTrigger 
}) => {
  // Estado dos festivais carregados
  const [festivals, setFestivals] = useState<Festival[]>([]);

  /**
   * Efeito que executa quando o componente monta ou refreshTrigger muda
   * Isso permite atualizar a lista quando um novo festival é criado
   */
  useEffect(() => {
    loadFestivals();
  }, [refreshTrigger]);

  /**
   * Carrega os festivais do AsyncStorage
   * Ordena por data de início em ordem cronológica
   */
  const loadFestivals = async () => {
    try {
      const data = await AsyncStorage.getItem('festivals');
      if (data) {
        const parsed: Festival[] = JSON.parse(data);
        // Ordena festivais por data de início (mais próximos primeiro)
        const sorted = parsed.sort(
          (a: Festival, b: Festival) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        setFestivals(sorted);
      }
    } catch (error) {
      console.error('Erro ao carregar festivais:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ===== HEADER COM LOGO E MENU ===== */}
      <View style={styles.header}>
        {/* Logo da aplicação */}
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        
        {/* Menu de navegação responsivo */}
        <View style={styles.menu}>
          <View style={styles.buttonContainer}>
            <Button title="Login" onPress={onLogin} color="#4CAF50" />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Cadastrar Usuário" onPress={onRegisterUser} color="#4CAF50" />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Cadastrar Festival" onPress={onRegisterFestival} color="#4CAF50" />
          </View>
          {/* Botão de Ver Festivais apenas para usuários logados */}
          {user && (
            <View style={styles.buttonContainer}>
              <Button title="Ver Festivais" onPress={onViewFestivals} color="#4CAF50" />
            </View>
          )}
        </View>

        {/* Status de login do usuário */}
        {user ? (
          <Text style={styles.loggedIn}>
            ✓ Logado como {user.name || user.email}
          </Text>
        ) : (
          <Text style={styles.loggedOut}>
            ○ Ainda não logado
          </Text>
        )}
      </View>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <View style={styles.content}>
        <Text style={styles.title}>Histórico de Festivais</Text>
        
        {/* Exibe mensagem vazia ou lista de festivais */}
        {festivals.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum festival cadastrado ainda.
          </Text>
        ) : (
          <FlatList
            data={festivals}
            keyExtractor={(item) => item.id}
            // Renderiza cada festival como um card clicável
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.item} 
                onPress={() => onSelectFestival(item)}
                activeOpacity={0.7} // Feedback visual ao pressionar
              >
                {/* Imagem do festival */}
                <Image source={{ uri: item.poster }} style={styles.festivalImage} />
                {/* Título do festival */}
                <Text style={styles.itemTitle}>{item.name}</Text>
              </TouchableOpacity>
            )}
            // Adiciona padding entre itens
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
          />
        )}
      </View>
    </View>
  );
};

/**
 * Estilos responsivos da tela Home
 * Utiliza Dimensions para adaptar tamanhos à tela do dispositivo
 */
const styles = StyleSheet.create({
  // Container principal com background verde claro
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
  },

  // Header com logo e menu de navegação
  header: {
    padding: width * 0.05, // 5% da largura para padding responsivo
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    backgroundColor: '#fff',
  },

  // Logo da aplicação (responsivo)
  logo: {
    width: width * 0.25, // 25% da largura da tela
    height: width * 0.25, // Mantém proporção quadrada
    marginBottom: 15,
    resizeMode: 'contain',
  },

  // Container do menu de botões com wrap responsivo
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
    flexWrap: 'wrap', // Quebra para próxima linha em telas pequenas
    gap: 10, // Espaço entre botões
  },

  // Wrapper para cada botão (torna responsivo)
  buttonContainer: {
    minWidth: width > 400 ? 'auto' : '48%', // 48% em telas pequenas
    marginVertical: 5,
  },

  // Texto quando usuário está logado (verde)
  loggedIn: {
    textAlign: 'center',
    color: '#388E3C',
    fontSize: 14,
    fontWeight: '600',
  },

  // Texto quando usuário não está logado (cinza)
  loggedOut: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },

  // Área de conteúdo principal
  content: {
    flex: 1,
    padding: width * 0.05,
  },

  // Título "Histórico de Festivais"
  title: {
    fontSize: width > 400 ? 24 : 20, // Responsivo ao tamanho da tela
    textAlign: 'center',
    marginBottom: 20,
    color: '#4CAF50',
    fontWeight: '700',
  },

  // Texto vazio quando não há festivais
  emptyText: {
    textAlign: 'center',
    marginTop: height * 0.1,
    fontStyle: 'italic',
    color: '#388E3C',
    fontSize: 16,
  },

  // Card do festival
  item: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    overflow: 'hidden',
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Imagem do festival (responsiva)
  festivalImage: {
    width: '100%',
    height: width * 0.6, // 60% da largura mantém proporção
    resizeMode: 'cover',
  },

  // Título do festival dentro do card
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    padding: 12,
    backgroundColor: '#4CAF50',
    textAlignVertical: 'center',
  },
});

export default Home;
