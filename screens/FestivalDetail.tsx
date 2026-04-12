import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert, Linking, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Festival, User, Attendance } from '../types';

// Hook para dimensões responsivas
const { width, height } = Dimensions.get('window');

/**
 * Props da tela de Detalhes do Festival
 * festival: Festival a ser exibido
 * user: Usuário atual (pode ser null)
 * onBack: Callback para voltar
 * onEdit: Callback para editar festival
 */
interface FestivalDetailProps {
  festival: Festival;
  user: User | null;
  onBack: () => void;
  onEdit: () => void;
}

/**
 * Componente de Detalhes do Festival
 * Exibe todas as informações do festival com opções de:
 * - Ver mapa de localização
 * - Confirmar presença (se logado)
 * - Editar/deletar/suspender (se criador)
 */
const FestivalDetail: React.FC<FestivalDetailProps> = ({ 
  festival, 
  user, 
  onBack, 
  onEdit 
}) => {
  // Estado se usuário confirmou presença
  const [attending, setAttending] = useState(false);
  
  // Estado do menu drop-down
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Estado se imagem falhou ao carregar
  const [imageError, setImageError] = useState(false);

  // Validação: festival não encontrado
  if (!festival) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Festival não encontrado</Text>
        <Button title="Voltar" onPress={onBack} />
      </View>
    );
  }

  /**
   * Abre o mapa com a localização do festival
   * Usa Google Maps
   */
  const openMapLink = async () => {
    try {
      const query = encodeURIComponent(festival.location);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o mapa');
    }
  };

  /**
   * Deleta o festival com confirmação
   * Apenas criador pode deletar
   */
  const deleteFestival = async () => {
    Alert.alert(
      'Excluir Festival',
      'Tem certeza que deseja excluir este festival? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Excluir',
          onPress: async () => {
            const data = await AsyncStorage.getItem('festivals');
            const festivals: Festival[] = data ? JSON.parse(data) : [];
            // Remove festival do array
            const filtered = festivals.filter((f) => f.id !== festival.id);
            await AsyncStorage.setItem('festivals', JSON.stringify(filtered));
            Alert.alert('Sucesso', 'Festival excluído com sucesso!');
            onBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Suspende o festival (placeholder para funcionalidade futura)
   * Apenas criador pode suspender
   */
  const suspendFestival = async () => {
    Alert.alert(
      'Suspender Festival',
      'Tem certeza que deseja suspender este festival?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Suspender',
          onPress: () => {
            Alert.alert('Sucesso', 'Festival suspenso com sucesso!');
          },
        },
      ]
    );
  };

  /**
   * Efeito para verificar presença ao montar o componente
   */
  useEffect(() => {
    if (user) {
      checkAttendance();
    }
  }, [festival.id, user?.id]);

  /**
   * Verifica se usuário já confirmou presença neste festival
   */
  const checkAttendance = async () => {
    try {
      const data = await AsyncStorage.getItem('attendances');
      const attendances: Attendance[] = data ? JSON.parse(data) : [];
      if (user) {
        // Verifica se há registro de presença
        setAttending(
          attendances.some(
            (a) => a.userId === user.id && a.festivalId === festival.id
          )
        );
      }
    } catch (error) {
      console.error('Erro ao verificar presença:', error);
    }
  };

  /**
   * Confirma presença do usuário no festival
   */
  const confirmAttendance = async () => {
    if (!user) {
      Alert.alert(
        'Atenção',
        'É necessário estar logado para confirmar presença'
      );
      return;
    }
    
    const data = await AsyncStorage.getItem('attendances');
    const attendances: Attendance[] = data ? JSON.parse(data) : [];
    
    if (!attending) {
      // Adiciona presença
      attendances.push({ userId: user.id, festivalId: festival.id });
      await AsyncStorage.setItem('attendances', JSON.stringify(attendances));
      setAttending(true);
      Alert.alert('Sucesso', 'Presença confirmada!');
    }
  };

  return (
    <View style={styles.container}>
      {/* ===== HEADER COM MENU ===== */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setMenuOpen(!menuOpen)} 
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {festival.name}
        </Text>
      </View>

      {/* ===== MENU DROP-DOWN ===== */}
      {menuOpen && (
       <View style={styles.menu}>
          {/* Botão Voltar (sempre disponível) */}
          <TouchableOpacity 
            onPress={() => { setMenuOpen(false); onBack(); }} 
            style={styles.menuItem}
          >
            <Text style={styles.menuItemText}>← Voltar</Text>
          </TouchableOpacity>
          
          {/* Opções de edição (apenas para criador) */}
          {user && user.id === festival.createdBy && (
            <>
              {/* Editar */}
              <TouchableOpacity 
                onPress={() => { setMenuOpen(false); onEdit(); }} 
                style={styles.menuItem}
              >
                <Text style={styles.menuItemText}>✎ Editar</Text>
              </TouchableOpacity>
              
              {/* Suspender */}
              <TouchableOpacity 
                onPress={() => { setMenuOpen(false); suspendFestival(); }} 
                style={styles.menuItem}
              >
                <Text style={styles.menuItemText}>⊘ Suspender</Text>
              </TouchableOpacity>
              
              {/* Excluir (destaque em vermelho) */}
              <TouchableOpacity 
                onPress={() => { setMenuOpen(false); deleteFestival(); }} 
                style={styles.menuItemDanger}
              >
                <Text style={styles.menuItemTextDanger}>✕ Excluir</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {/* Imagem do festival */}
        {imageError ? (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>Imagem não disponível</Text>
          </View>
        ) : (
          <Image
            source={{ uri: festival.poster }}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        )}

        {/* ===== SEÇÃO: PERÍODO ===== */}
        <Text style={styles.sectionTitle}>Período</Text>
        <Text style={styles.text}>
          📅 {festival.startDate} até {festival.endDate}
        </Text>

        {/* ===== SEÇÃO: LOCALIZAÇÃO ===== */}
        <Text style={styles.sectionTitle}>Localização</Text>
        <Text style={styles.text}>📍 {festival.location}</Text>
        <View style={styles.mapButtonContainer}>
          <Button 
            title="Ver no mapa" 
            onPress={openMapLink}
            color="#4CAF50"
          />
        </View>

        {/* ===== SEÇÃO: HISTÓRIA ===== */}
        <Text style={styles.sectionTitle}>História</Text>
        <Text style={styles.text}>{festival.history}</Text>

        {/* ===== BOTÃO: CONFIRMAR PRESENÇA ===== */}
        <View style={styles.attendanceButtonContainer}>
          {user && !user.isAdmin && (
            <Button
              title={attending ? '✓ Presença Confirmada' : 'Confirmar Presença'}
              onPress={confirmAttendance}
              disabled={attending}
              color={attending ? '#4CAF50' : '#4CAF50'}
            />
          )}
          {!user && (
            <Button
              title="📱 Confirmar Presença (faça login)"
              onPress={confirmAttendance}
              color="#FFC107"
            />
          )}
        </View>

        {/* Espaços para scroll confortável */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

/**
 * Estilos responsivos da tela de Detalhes
 */
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
  },

  // Header com título e menu
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#4CAF50',
    borderBottomWidth: 3,
    borderBottomColor: '#2E7D32',
  },

  // Botão do menu (hamburger)
  menuButton: {
    paddingRight: 15,
    paddingVertical: 5,
  },

  // Ícone do menu
  menuIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Título no header
  headerTitle: {
    fontSize: width > 400 ? 18 : 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },

  // Menu drop-down
  menu: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
  },

  // Item do menu
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  // Texto do menu
  menuItemText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '500',
  },

  // Item do menu com destaque (perigo)
  menuItemDanger: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#ffebee',
  },

  // Texto do menu (perigo)
  menuItemTextDanger: {
    fontSize: 15,
    color: '#d32f2f',
    fontWeight: '600',
  },

  // Conteúdo principal (scrollável)
  content: {
    flex: 1,
    paddingVertical: 2,
  },

  // Imagem do festival
  image: {
    width: '100%',
    height: width * 0.6, // Responsivo
    marginBottom: 20,
    borderRadius: 8,
    resizeMode: 'cover',
  },

  // Placeholder quando imagem não carrega
  imagePlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Texto do placeholder
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },

  // Título de seção
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    color: '#2E7D32',
  },

  // Texto de conteúdo
  text: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    marginHorizontal: 20,
    lineHeight: 24,
  },

  // Container do botão do mapa
  mapButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  // Container do botão de presença
  attendanceButtonContainer: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 20,
  },

  // Texto de erro
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: height * 0.2,
    fontWeight: '600',
  },

  // Espaço no fundo para scroll confortável
  bottomSpacer: {
    height: 20,
  },
});

export default FestivalDetail;