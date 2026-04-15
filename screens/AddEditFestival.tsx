import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Festival, User } from '../types';

const { width } = Dimensions.get('window');

/**
 * Props da tela de Adicionar/Editar Festival
 * festival?: Festival opcional para edição
 * user: Usuário logado (necessário para criar/editar)
 * onSave: Callback após salvar
 * onCancel: Callback para cancelar
 */
interface AddEditFestivalProps {
  festival?: Festival;
  user: User | null;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Componente de Adicionar/Editar Festival
 * Permite criação ou edição de festivais com os seguintes campos:
 * - Nome do festival
 * - Imagem de poster
 * - Localização
 * - História/descrição
 * - Data de início
 * - Data de término
 */
const AddEditFestival: React.FC<AddEditFestivalProps> = ({ 
  festival, 
  user, 
  onSave, 
  onCancel 
}) => {
  const [name, setName] = useState(festival?.name || '');
  const [poster, setPoster] = useState(festival?.poster || '');
  const [location, setLocation] = useState(festival?.location || '');
  const [history, setHistory] = useState(festival?.history || '');
  const [startDate, setStartDate] = useState(festival?.startDate || '');
  const [endDate, setEndDate] = useState(festival?.endDate || '');

  const renderActionButton = (label: string, onPress: () => void, variant: 'primary' | 'secondary' = 'primary', disabled = false) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === 'secondary' ? styles.actionButtonSecondary : styles.actionButtonPrimary,
        disabled && styles.actionButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
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

  /**
   * Handler para selecionar imagem da galeria
   * Usa ImagePicker do expo
   */
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPoster(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao selecionar imagem');
    }
  };

  /**
   * Handler para salvar o festival
   * Valida todos os campos antes de salvar
   * Suporta tanto criação quanto edição
   */
  const saveFestival = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do festival é obrigatório');
      return;
    }

    if (!poster) {
      Alert.alert('Erro', 'Selecione uma imagem para o festival');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Erro', 'Localização do festival é obrigatória');
      return;
    }

    if (!history.trim()) {
      Alert.alert('Erro', 'História/descrição do festival é obrigatória');
      return;
    }

    if (!startDate.trim()) {
      Alert.alert('Erro', 'Data de início é obrigatória');
      return;
    }

    if (!endDate.trim()) {
      Alert.alert('Erro', 'Data de término é obrigatória');
      return;
    }

    if (!user?.isAdmin) {
      Alert.alert('Erro', 'Apenas o administrador pode criar ou editar festivais');
      return;
    }

    const data = await AsyncStorage.getItem('festivals');
    const festivals: Festival[] = data ? JSON.parse(data) : [];

    const newFestival: Festival = {
      id: festival?.id || Date.now().toString(),
      name,
      poster,
      location,
      history,
      startDate,
      endDate,
      createdBy: festival?.createdBy || user.id,
      suspended: festival?.suspended ?? false,
    };

    if (festival) {
      const index = festivals.findIndex(f => f.id === festival.id);
      if (index !== -1) {
        festivals[index] = newFestival;
      }
    } else {
      festivals.push(newFestival);
    }

    await AsyncStorage.setItem('festivals', JSON.stringify(festivals));
    Alert.alert('Sucesso', `Festival ${festival ? 'atualizado' : 'criado'} com sucesso!`);
    onSave();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={onCancel} activeOpacity={0.8} style={styles.logoButton}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </TouchableOpacity>

        {!user?.isAdmin && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Apenas o administrador pode criar ou editar festivais
            </Text>
          </View>
        )}

        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>Painel administrativo</Text>
          <Text style={styles.title}>
            {festival ? 'Editar Festival' : 'Criar Novo Festival'}
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nome do festival *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={!!user?.isAdmin}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Imagem do festival *</Text>
          {renderActionButton('Selecionar imagem da galeria', pickImage, 'secondary', !user?.isAdmin)}
          {poster ? (
            <Text style={styles.selectedText}>✓ Imagem selecionada</Text>
          ) : (
            <Text style={styles.selectedText}>○ Nenhuma imagem selecionada</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Localização *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Santarém, PA"
            editable={!!user?.isAdmin}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>História/Descrição *</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={history}
            onChangeText={setHistory}
            placeholder="Descreva a história e características do festival..."
            multiline={true}
            numberOfLines={5}
            editable={!!user?.isAdmin}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Data de início *</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="DD/MM/YYYY"
            editable={!!user?.isAdmin}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Data de término *</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="DD/MM/YYYY"
            editable={!!user?.isAdmin}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.buttonContainer}>
          {renderActionButton(festival ? 'Atualizar festival' : 'Criar festival', saveFestival, 'primary', !user?.isAdmin)}
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          {renderActionButton('Cancelar', onCancel, 'secondary')}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Estilos responsivos da tela de Adicionar/Editar Festival
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef5ef',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.08,
    paddingVertical: 20,
  },

  logoButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    borderRadius: 18,
  },

  logo: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
  },

  headerBlock: {
    marginBottom: 10,
  },

  eyebrow: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#5a6d60',
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },

  warningText: {
    color: '#856404',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  title: {
    fontSize: width > 400 ? 26 : 22,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '800',
    color: '#1d4728',
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#295c37',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#bdd5bf',
    padding: 14,
    borderRadius: 16,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#333',
    marginBottom: 8,
  },

  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  selectedText: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#476451',
    fontSize: 13,
  },

  buttonContainer: {
    marginVertical: 10,
  },

  spacer: {
    height: 15,
  },

  bottomSpacer: {
    height: 20,
  },

  actionButton: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 16,
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

  actionButtonDisabled: {
    backgroundColor: '#d9e4db',
    borderColor: '#d9e4db',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },

  actionButtonTextPrimary: {
    color: '#ffffff',
  },

  actionButtonTextSecondary: {
    color: '#295c37',
  },
});

export default AddEditFestival;