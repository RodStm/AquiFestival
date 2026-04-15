import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
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
 * refreshTrigger: Trigger para recarregar festivais
 */
interface FestivalListProps {
  user: User;
  onGoHome: () => void;
  onLogout: () => void;
  onSelectFestival: (festival: Festival) => void;
  onAddFestival: () => void;
  refreshTrigger?: number;
}

/**
 * Componente de Lista de Festivais
 * Exibe uma lista de festivais carregados do AsyncStorage
 * Apenas usuários logados podem acessar esta tela
 */
const FestivalList: React.FC<FestivalListProps> = ({ 
  user, 
  onGoHome,
  onLogout, 
  onSelectFestival, 
  onAddFestival,
  refreshTrigger
}) => {
  // Estado da lista de festivais
  const [festivals, setFestivals] = useState<Festival[]>([]);

  /**
   * Efeito que executa ao montar o componente e quando refreshTrigger muda
   * Carrega a lista de festivais do AsyncStorage
   */
  useEffect(() => {
    loadFestivals();
  }, [refreshTrigger]);

  /**
   * Carrega todos os festivais do AsyncStorage
   */
  const loadFestivals = async () => {
    try {
      const data = await AsyncStorage.getItem('festivals');
      if (data) {
        const parsed: Festival[] = JSON.parse(data);
        setFestivals(parsed);
      } else {
        setFestivals([]);
      }
    } catch (error) {
      console.error('Erro ao carregar festivais:', error);
    }
  };

  const toggleFestivalStatus = async (festivalId: string) => {
    if (!user.isAdmin) {
      return;
    }

    try {
      const data = await AsyncStorage.getItem('festivals');
      const storedFestivals: Festival[] = data ? JSON.parse(data) : [];
      const updatedFestivals = storedFestivals.map((festival) =>
        festival.id === festivalId
          ? { ...festival, suspended: !festival.suspended }
          : festival
      );

      await AsyncStorage.setItem('festivals', JSON.stringify(updatedFestivals));
      setFestivals(updatedFestivals);
    } catch (error) {
      console.error('Erro ao atualizar status do festival:', error);
    }
  };

  const renderActionButton = (label: string, onPress: () => void, variant: 'primary' | 'danger' = 'primary') => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === 'danger' ? styles.actionButtonDanger : styles.actionButtonPrimary,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={onGoHome} activeOpacity={0.8} style={styles.logoButton}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Festivais do Tapajós</Text>
            <Text style={styles.userInfo}>
              Logado como: <Text style={styles.userName}>{user.name || user.email}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* ===== BOTÕES DE AÇÃO ===== */}
      <View style={styles.buttonsContainer}>
        {user.isAdmin && <View style={styles.buttonWrapper}>{renderActionButton('Adicionar Festival', onAddFestival)}</View>}
        <View style={styles.buttonWrapper}>{renderActionButton('Logout', onLogout, 'danger')}</View>
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
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <TouchableOpacity
                style={styles.itemMainArea}
                onPress={() => onSelectFestival(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemNumber}>{index + 1}</Text>

                <View style={styles.itemContent}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={[styles.stateBadge, item.suspended ? styles.stateBadgeOff : styles.stateBadgeOn]}>
                      <Text style={[styles.stateBadgeText, item.suspended ? styles.stateBadgeTextOff : styles.stateBadgeTextOn]}>
                        {item.suspended ? 'Suspenso' : 'Ativo'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemDate}>
                    {item.startDate} a {item.endDate}
                  </Text>
                  {item.suspended && (
                    <Text style={styles.suspendedText}>Festival suspenso</Text>
                  )}
                </View>

                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              {user.isAdmin && (
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    item.suspended ? styles.statusButtonOff : styles.statusButtonOn,
                  ]}
                  onPress={() => toggleFestivalStatus(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.statusButtonText}>
                    {item.suspended ? 'OFF' : 'ON'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
  container: {
    flex: 1,
    backgroundColor: '#eef5ef',
  },

  header: {
    backgroundColor: '#1f6f43',
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#185434',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoButton: {
    marginRight: 14,
    borderRadius: 18,
  },

  logo: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
  },

  headerTextBlock: {
    flex: 1,
  },

  title: {
    fontSize: width > 400 ? 26 : 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'left',
    marginBottom: 8,
  },

  userInfo: {
    fontSize: 13,
    color: '#dcedde',
    textAlign: 'left',
  },

  userName: {
    fontWeight: '700',
    color: '#fff',
  },

  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    padding: width * 0.04,
    backgroundColor: 'transparent',
  },

  buttonWrapper: {
    flex: 1,
  },

  actionButton: {
    minHeight: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#183c24',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  actionButtonPrimary: {
    backgroundColor: '#1f6f43',
  },

  actionButtonDanger: {
    backgroundColor: '#c8463c',
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 18,
    color: '#388E3C',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: width * 0.02,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#17321f',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  itemMainArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: width * 0.04,
  },

  itemNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f6f43',
    marginRight: 12,
    minWidth: 34,
    height: 34,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#e5f3e8',
    borderRadius: 17,
    overflow: 'hidden',
    paddingTop: 7,
  },

  itemContent: {
    flex: 1,
  },

  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },

  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#193824',
  },

  itemDate: {
    fontSize: 13,
    color: '#5a6d60',
  },

  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  stateBadgeOn: {
    backgroundColor: '#e5f3e8',
  },

  stateBadgeOff: {
    backgroundColor: '#f1e1df',
  },

  stateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  stateBadgeTextOn: {
    color: '#1f6f43',
  },

  stateBadgeTextOff: {
    color: '#b03d33',
  },
  suspendedText: {
    fontSize: 13,
    color: '#d32f2f',
    fontWeight: '700',
    marginTop: 6,
  },

  statusButton: {
    minWidth: 70,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 999,
  },

  statusButtonOn: {
    backgroundColor: '#2E7D32',
  },

  statusButtonOff: {
    backgroundColor: '#9e9e9e',
  },

  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  chevron: {
    fontSize: 24,
    color: '#8cae94',
    fontWeight: '300',
  },
});

export default FestivalList;