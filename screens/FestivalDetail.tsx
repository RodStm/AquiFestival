import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert, Linking, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
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
 * onDelete: Callback para deletar festival
 */
interface FestivalDetailProps {
  festival: Festival;
  user: User | null;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSuspend: () => void;
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
  onEdit,
  onDelete,
  onSuspend
}) => {
  // Estado se usuário confirmou presença
  const [attending, setAttending] = useState(false);
  
  // Estado do menu drop-down
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Estado se imagem falhou ao carregar
  const [imageError, setImageError] = useState(false);

  // Estado para feedback e confirmação de exclusão
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

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
   * Deleta o festival com confirmação (usando Modal customizado)
   */
  const deleteFestival = () => {
    if (!user?.isAdmin) {
      setFeedbackMessage('Apenas o administrador pode excluir festivais.');
      setFeedbackModalVisible(true);
      return;
    }

    setDeleteConfirmVisible(true);
  };

  const confirmDeleteFestival = async () => {
    setDeleteConfirmVisible(false);

    if (!user?.isAdmin) {
      setFeedbackMessage('Apenas o administrador pode excluir festivais.');
      setFeedbackModalVisible(true);
      return;
    }

    try {
      const data = await AsyncStorage.getItem('festivals');
      const festivals: Festival[] = data ? JSON.parse(data) : [];
      const filtered = festivals.filter((f) => f.id !== festival.id);
      await AsyncStorage.setItem('festivals', JSON.stringify(filtered));
      onDelete();
    } catch (error) {
      setFeedbackMessage('Nao foi possivel excluir o festival.');
      setFeedbackModalVisible(true);
    }
  };

  const suspendFestival = async () => {
    setDeleteConfirmVisible(false);

    if (!user?.isAdmin) {
      setFeedbackMessage('Apenas o administrador pode suspender festivais.');
      setFeedbackModalVisible(true);
      return;
    }

    try {
      const data = await AsyncStorage.getItem('festivals');
      const festivals: Festival[] = data ? JSON.parse(data) : [];
      const updatedFestivals = festivals.map((item) =>
        item.id === festival.id ? { ...item, suspended: true } : item
      );
      await AsyncStorage.setItem('festivals', JSON.stringify(updatedFestivals));
      onSuspend();
    } catch (error) {
      setFeedbackMessage('Nao foi possivel suspender o festival.');
      setFeedbackModalVisible(true);
    }
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

  const renderPrimaryAction = (
    label: string,
    onPress: () => void,
    variant: 'primary' | 'secondary' | 'warning' = 'primary',
    disabled = false
  ) => (
    <TouchableOpacity
      style={[
        styles.primaryAction,
        variant === 'secondary' && styles.primaryActionSecondary,
        variant === 'warning' && styles.primaryActionWarning,
        disabled && styles.primaryActionDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.primaryActionText,
          variant === 'secondary' && styles.primaryActionTextSecondary,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ===== HEADER COM MENU ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.8}
          style={styles.logoButton}
        >
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={2}>
          {festival.name}
        </Text>

        <TouchableOpacity 
          onPress={() => setMenuOpen(!menuOpen)} 
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>
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
          
          {/* Opções administrativas */}
          {user?.isAdmin && (
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagem do festival */}
        {!festival.poster || imageError ? (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>Imagem não disponível</Text>
          </View>
        ) : (
          <Image
            source={{ uri: festival.poster }}
            style={styles.image}
            onError={() => {
              console.log('Erro ao carregar imagem:', festival.poster);
              setImageError(true);
            }}
          />
        )}

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Periodo</Text>
          <Text style={styles.text}>📅 {festival.startDate} ate {festival.endDate}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Localizacao</Text>
          <Text style={styles.text}>📍 {festival.location}</Text>
          <View style={styles.mapButtonContainer}>
            {renderPrimaryAction('Ver no mapa', openMapLink, 'secondary')}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Historia</Text>
          <Text style={styles.text}>{festival.history}</Text>
        </View>

        <View style={styles.attendanceButtonContainer}>
          {user && !user.isAdmin && (
            renderPrimaryAction(
              attending ? 'Presenca confirmada' : 'Confirmar presenca',
              confirmAttendance,
              'primary',
              attending
            )
          )}
          {!user && (
            renderPrimaryAction('Confirmar presenca (faca login)', confirmAttendance, 'warning')
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        transparent={true}
        visible={feedbackModalVisible}
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Erro</Text>
            <Text style={styles.modalMessage}>{feedbackMessage}</Text>
            <TouchableOpacity 
              onPress={() => setFeedbackModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={deleteConfirmVisible}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Festival</Text>
            <Text style={styles.modalMessage}>Tem certeza que deseja excluir este festival?</Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setDeleteConfirmVisible(false)}
                style={[styles.modalButton, { backgroundColor: '#888', marginRight: 10 }]}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteFestival}
                style={[styles.modalButton, { backgroundColor: '#d32f2f' }]}
              >
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * Estilos responsivos da tela de Detalhes
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef5ef',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#1f6f43',
    borderBottomWidth: 1,
    borderBottomColor: '#185434',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  logoButton: {
    marginRight: 14,
    borderRadius: 18,
  },

  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  menuButton: {
    paddingLeft: 15,
    paddingVertical: 8,
  },

  menuIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },

  headerTitle: {
    fontSize: width > 400 ? 18 : 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },

  menu: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#17321f',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  menuItemText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '500',
  },

  menuItemDanger: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#ffebee',
  },

  menuItemTextDanger: {
    fontSize: 15,
    color: '#d32f2f',
    fontWeight: '600',
  },

  content: {
    flex: 1,
    paddingVertical: 16,
  },

  image: {
    width: width - 32,
    height: 250,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 24,
    resizeMode: 'cover',
  },

  imagePlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },

  placeholderText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    color: '#1f6f43',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  text: {
    fontSize: 15,
    color: '#33463a',
    marginBottom: 4,
    lineHeight: 24,
  },

  infoCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#17321f',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  mapButtonContainer: {
    marginTop: 14,
  },

  attendanceButtonContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },

  primaryAction: {
    minHeight: 50,
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f6f43',
  },

  primaryActionSecondary: {
    backgroundColor: '#e4f1e6',
  },

  primaryActionWarning: {
    backgroundColor: '#d49a1f',
  },

  primaryActionDisabled: {
    backgroundColor: '#9eb2a2',
  },

  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  primaryActionTextSecondary: {
    color: '#1f6f43',
  },

  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: height * 0.2,
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },

  modalMessage: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },

  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },

  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
export default FestivalDetail;