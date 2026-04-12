import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Festival, User } from '../types';

// Hook para dimensões responsivas
const { width } = Dimensions.get('window');

/**
 * Props da tela de Lista de Festivais
 * user: Usuário logado
 * onLogout: Callback para deslogar
 * onSelectFestival: Callback quando festival é selecionado
 * onAddFestival: Callback para criar novo festival
 */
interface FestivalListProps {
  user: User;
  onLogout: () => void;
  onSelectFestival: (festival: Festival) => void;
  onAddFestival: () => void;
}

/**
 * Componente de Lista de Festivais
 * Exibe uma lista de festivais carregados do AsyncStorage
 * Apenas usuários logados podem acessar esta tela
 */
const FestivalList: React.FC<FestivalListProps> = ({ 
  user, 
  onLogout, 
  onSelectFestival, 
  onAddFestival 
}) => {
  // Estado da lista de festivais
  const [festivals, setFestivals] = useState<Festival[]>([]);

  /**
   * Efeito que executa ao montar o componente
   * Carrega a lista de festivais do AsyncStorage
   */
  useEffect(() => {
    loadFestivals();
  }, []);

  /**
   * Carrega todos os festivais do AsyncStorage
   */
  const loadFestivals = async () => {
    try {
      const data = await AsyncStorage.getItem('festivals');
      if (data) {
        const parsed: Festival[] = JSON.parse(data);
        setFestivals(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar festivais:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.title}>Festivais do Tapajós</Text>
        <Text style={styles.userInfo}>
          Logado como: <Text style={styles.userName}>{user.name || user.email}</Text>
        </Text>
      </View>

      {/* ===== BOTÕES DE AÇÃO ===== */}
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="Adicionar Festival" 
            onPress={onAddFestival}
            color="#4CAF50"
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button 
            title="Logout" 
            onPress={onLogout}
            color="#d32f2f"
          />
        </View>
      </View>

      {/* ===== LISTA DE FESTIVAIS ===== */}
      {festivals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhum festival cadastrado ainda.
          </Text>
          <Text style={styles.emptySubtext}>
            Use o botão "Adicionar Festival" para criar um novo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={festivals}
          keyExtractor={(item) => item.id}
          // Renderiza cada festival como um item clicável
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={styles.item} 
              onPress={() => onSelectFestival(item)}
              activeOpacity={0.7}
            >
              {/* Número do item (para referência) */}
              <Text style={styles.itemNumber}>{index + 1}</Text>
              
              {/* Nome do festival */}
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>
                  {item.startDate} a {item.endDate}
                </Text>
              </View>
              
              {/* Indica que é clicável */}
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
};

/**
 * Estilos responsivos da tela de Lista
 */
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
  },

  // Header com título
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: width * 0.05,
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#2E7D32',
  },

  // Título
  title: {
    fontSize: width > 400 ? 26 : 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Informação do usuário
  userInfo: {
    fontSize: 12,
    color: '#e8f5e9',
    textAlign: 'center',
  },

  // Nome do usuário em destaque
  userName: {
    fontWeight: '700',
    color: '#fff',
  },

  // Container dos botões de ação
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    padding: width * 0.04,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  // Wrapper para cada botão
  buttonWrapper: {
    flex: 1,
  },

  // Container vazio (quando não há festivais)
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Texto vazio
  emptyText: {
    fontSize: 18,
    color: '#388E3C',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
  },

  // Subtexto vazio
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Item da lista de festivais
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: width * 0.02,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 4,
  },

  // Número do item
  itemNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginRight: 12,
    minWidth: 30,
  },

  // Conteúdo do item (nome e data)
  itemContent: {
    flex: 1,
  },

  // Nome do festival
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  // Data do festival
  itemDate: {
    fontSize: 12,
    color: '#999',
  },

  // Chevron indicativo
  chevron: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: '300',
  },
});

export default FestivalList;