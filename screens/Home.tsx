import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Festival } from '../types';

// Obtém as dimensões da tela para criar layouts responsivos
const { width, height } = Dimensions.get('window');

const heroBannerImage = {
  uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Rio_Tapaj%C3%B3s,_visto_da_base_do_PN_da_Amaz%C3%B4nia.jpg/1280px-Rio_Tapaj%C3%B3s,_visto_da_base_do_PN_da_Amaz%C3%B4nia.jpg',
};

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
  onGoHome: () => void;
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
  onGoHome,
  onLogin, 
  onRegisterUser, 
  onRegisterFestival, 
  onViewFestivals, 
  onSelectFestival, 
  refreshTrigger 
}) => {
  // Estado dos festivais carregados
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [bannerImageError, setBannerImageError] = useState(false);

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
        const activeFestivals = parsed.filter((festival) => !festival.suspended);
        // Ordena festivais por data de início (mais próximos primeiro)
        const sorted = activeFestivals.sort(
          (a: Festival, b: Festival) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        setFestivals(sorted);
      } else {
        setFestivals([]);
      }
    } catch (error) {
      console.error('Erro ao carregar festivais:', error);
    }
  };

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
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.pageContent}>
      {/* ===== HEADER COM LOGO E MENU ===== */}
      <View style={styles.header}>
        {/* Linha superior com Logo e Menu lado a lado */}
        <View style={styles.topRow}>
          {/* Logo da aplicação - Lado esquerdo */}
          <TouchableOpacity onPress={onGoHome} activeOpacity={0.8} style={styles.logoButton}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
          </TouchableOpacity>
          
          {/* Menu de navegação responsivo - Expandido */}
          <View style={styles.menu}>
            <View style={styles.buttonContainer}>
              {renderActionButton('Login', onLogin, 'primary')}
            </View>
            <View style={styles.buttonContainer}>
              {renderActionButton('Cadastrar Usuario', onRegisterUser, 'secondary')}
            </View>
            {user?.isAdmin && (
              <View style={styles.buttonContainer}>
                {renderActionButton('Cadastrar Festival', onRegisterFestival, 'primary')}
              </View>
            )}
            {/* Botão de Ver Festivais apenas para usuários logados */}
            {user && (
              <View style={styles.buttonContainer}>
                {renderActionButton('Ver Festivais', onViewFestivals, 'secondary')}
              </View>
            )}
          </View>
        </View>

        {bannerImageError ? (
          <View style={[styles.heroBanner, styles.heroBannerFallback]}>
            <View style={styles.heroBannerOverlay}>
              <Text style={styles.heroBannerEyebrow}>O Tapajos em festa</Text>
              <Text style={styles.heroBannerQuote}>
                Os festivais do Tapajos celebram a memoria, a fe e a forca das comunidades que mantem viva a cultura da regiao.
              </Text>
            </View>
          </View>
        ) : (
          <ImageBackground
            source={heroBannerImage}
            style={styles.heroBanner}
            imageStyle={styles.heroBannerImage}
            onError={() => setBannerImageError(true)}
          >
            <View style={styles.heroBannerOverlay}>
              <Text style={styles.heroBannerEyebrow}>O Tapajos em festa</Text>
              <Text style={styles.heroBannerQuote}>
                Os festivais do Tapajos celebram a memoria, a fe e a forca das comunidades que mantem viva a cultura da regiao.
              </Text>
            </View>
          </ImageBackground>
        )}


        {/* Status de login do usuário - Abaixo */}
        {user ? (
          <Text style={styles.loggedIn}>Logado como {user.name || user.email}</Text>
        ) : (
          <Text style={styles.loggedOut}>
            Ainda nao logado
          </Text>
        )}      
      </View>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Histórico de Festivais</Text>
      </View>

      {festivals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nenhum festival cadastrado ainda.
          </Text>
        </View>
      ) : (
        <View style={styles.listContent}>
          {festivals.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.item}
              onPress={() => onSelectFestival(item)}
              activeOpacity={0.7}
            >
              {/* Imagem do festival com tratamento de erro */}
              {imageErrors[item.id] || !item.poster ? (
                <View style={[styles.festivalImage, styles.festivalImagePlaceholder]}>
                  <Text style={styles.festivalImagePlaceholderText}>📸</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: item.poster }}
                  style={styles.festivalImage}
                  onError={() => {
                    setImageErrors(prev => ({ ...prev, [item.id]: true }));
                  }}
                />
              )}
              <View style={styles.itemContent}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Ativo</Text>
                  </View>
                </View>
                <Text style={styles.itemMeta}>📅 {item.startDate} ate {item.endDate}</Text>
                <Text style={styles.itemMeta}>📍 {item.location}</Text>
                <Text style={styles.itemLink}>Toque para ver detalhes</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

/**
 * Estilos responsivos da tela Home
 * Utiliza Dimensions para adaptar tamanhos à tela do dispositivo
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef5ef',
  },

  pageContent: {
    paddingBottom: 24,
  },

  header: {
    padding: width * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#d7e6d8',
    backgroundColor: '#f8fbf8',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  logoButton: {
    marginRight: 15,
    borderRadius: 18,
  },

  menu: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },

  buttonContainer: {
    minWidth: width > 400 ? 'auto' : '48%',
    marginVertical: 5,
  },

  actionButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 999,
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
    fontSize: 13,
    fontWeight: '700',
  },

  actionButtonTextPrimary: {
    color: '#ffffff',
  },

  actionButtonTextSecondary: {
    color: '#295c37',
  },

  heroPanel: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#dcecdc',
  },

  heroBanner: {
    marginTop: 16,
    height: width > 400 ? 380 : 300,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#355845',
  },

  heroBannerImage: {
    borderRadius: 24,
  },

  heroBannerFallback: {
    justifyContent: 'center',
  },

  heroBannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(14, 31, 21, 0.42)',
  },

  heroBannerEyebrow: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(240, 248, 238, 0.24)',
    color: '#f3f8f0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  heroBannerQuote: {
    maxWidth: 320,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: width > 400 ? 24 : 20,
    lineHeight: width > 400 ? 32 : 28,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.28)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  heroTitle: {
    fontSize: width > 400 ? 22 : 18,
    fontWeight: '800',
    color: '#183c24',
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#476451',
  },

  loggedIn: {
    textAlign: 'center',
    color: '#1f6f43',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },

  loggedOut: {
    textAlign: 'center',
    color: '#6e7f73',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },

  sectionHeader: {
    paddingHorizontal: width * 0.05,
    paddingTop: 24,
    paddingBottom: 8,
  },

  listContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 24,
  },

  emptyState: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },

  title: {
    fontSize: width > 400 ? 24 : 20,
    textAlign: 'left',
    marginBottom: 20,
    color: '#1d4728',
    fontWeight: '800',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: height * 0.1,
    color: '#56705d',
    fontSize: 16,
    lineHeight: 24,
  },

  item: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    elevation: 5,
    shadowColor: '#17321f',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },

  festivalImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },

  festivalImagePlaceholder: {
    backgroundColor: '#dbe7db',
    justifyContent: 'center',
    alignItems: 'center',
  },

  festivalImagePlaceholderText: {
    fontSize: 48,
  },

  itemContent: {
    padding: 16,
    backgroundColor: '#ffffff',
  },

  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },

  itemTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#193824',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e4f4e6',
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1f6f43',
  },

  itemMeta: {
    fontSize: 13,
    color: '#5a6d60',
    marginBottom: 4,
  },

  itemLink: {
    marginTop: 10,
    fontSize: 12,
    color: '#1f6f43',
    fontWeight: '700',
  },
});

export default Home;
