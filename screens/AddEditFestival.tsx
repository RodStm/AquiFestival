import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Button, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Festival, User } from '../types';

// Hook para dimensões responsivas
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
  // ===== ESTADOS DOS CAMPOS =====
  
  // Nome do festival
  const [name, setName] = useState(festival?.name || '');
  
  // URI da imagem selecionada
  const [poster, setPoster] = useState(festival?.poster || '');
  
  // Localização do festival
  const [location, setLocation] = useState(festival?.location || '');
  
  // História/descrição do festival
  const [history, setHistory] = useState(festival?.history || '');
  
  // Data de início (formato: DD/MM/YYYY)
  const [startDate, setStartDate] = useState(festival?.startDate || '');
  
  // Data de término (formato: DD/MM/YYYY)
  const [endDate, setEndDate] = useState(festival?.endDate || '');

  /**
   * Handler para selecionar imagem da galeria
   * Usa ImagePicker do expo
   */
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3], // Proporção 4:3
        quality: 1, // Qualidade máxima
      });
      
      // Se usuário não cancelou
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
    // ===== VALIDAÇÕES =====

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

    // Verifica se usuário está logado
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para criar um festival');
      return;
    }

    // ===== SALVAR FESTIVAL =====

    const data = await AsyncStorage.getItem('festivals');
    const festivals: Festival[] = data ? JSON.parse(data) : [];
    
    // Cria novo festival ou usa dados existentes
    const newFestival: Festival = {
      id: festival?.id || Date.now().toString(), // ID único
      name,
      poster,
      location,
      history,
      startDate,
      endDate,
      createdBy: festival?.createdBy || user.id, // Mantém criador original se editando
    };

    if (festival) {
      // Modo edição: atualiza festival existente
      const index = festivals.findIndex(f => f.id === festival.id);
      if (index !== -1) {
        festivals[index] = newFestival;
      }
    } else {
      // Modo criação: adiciona novo festival
      festivals.push(newFestival);
    }

    // Salva no AsyncStorage
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
        {/* ===== AVISO QUANDO NÃO ESTÁ LOGADO ===== */}
        {!user && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Você precisa estar logado para criar ou editar festivais
            </Text>
          </View>
        )}

        {/* ===== TÍTULO ===== */}
        <Text style={styles.title}>
          {festival ? 'Editar Festival' : 'Criar Novo Festival'}
        </Text>

        {/* ===== CAMPO: NOME ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nome do festival *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={!!user}
            placeholderTextColor="#bbb"
          />
        </View>

        {/* ===== CAMPO: IMAGEM ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Imagem do festival *</Text>
          <Button
            title="Selecionar imagem da galeria"
            onPress={pickImage}
            color="#4CAF50"
            disabled={!user}
          />
          {poster ? (
            <Text style={styles.selectedText}>✓ Imagem selecionada</Text>
          ) : (
            <Text style={styles.selectedText}>○ Nenhuma imagem selecionada</Text>
          )}
        </View>

        {/* ===== CAMPO: LOCALIZAÇÃO ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Localização *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Santarém, PA"
            editable={!!user}
            placeholderTextColor="#bbb"
          />
        </View>

        {/* ===== CAMPO: HISTÓRIA ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>História/Descrição *</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={history}
            onChangeText={setHistory}
            placeholder="Descreva a história e características do festival..."
            multiline={true}
            numberOfLines={5}
            editable={!!user}
            placeholderTextColor="#bbb"
          />
        </View>

        {/* ===== CAMPO: DATA DE INÍCIO ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Data de início *</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="DD/MM/YYYY"
            editable={!!user}
            placeholderTextColor="#bbb"
          />
        </View>

        {/* ===== CAMPO: DATA DE FIM ===== */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Data de término *</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="DD/MM/YYYY"
            editable={!!user}
            placeholderTextColor="#bbb"
          />
        </View>

        {/* ===== BOTÕES DE AÇÃO ===== */}

        {/* Botão Salvar */}
        <View style={styles.buttonContainer}>
          <Button
            title={festival ? 'Atualizar festival' : 'Criar festival'}
            onPress={saveFestival}
            color="#4CAF50"
            disabled={!user}
          />
        </View>

        {/* Espaçador */}
        <View style={styles.spacer} />

        {/* Botão Cancelar */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancelar"
            onPress={onCancel}
            color="#999"
          />
        </View>

        {/* Espaço no final para scroll confortável */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Estilos responsivos da tela de Adicionar/Editar Festival
 */
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
  },

  // Conteúdo dentro do ScrollView
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.08, // 8% da largura
    paddingVertical: 20,
  },

  // Container do aviso
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },

  // Texto do aviso
  warningText: {
    color: '#856404',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Título da tela
  title: {
    fontSize: width > 400 ? 26 : 22,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '700',
    color: '#2E7D32',
  },

  // Container para cada campo
  fieldGroup: {
    marginBottom: 18,
  },

  // Label dos campos
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 8,
  },

  // Input padrão
  input: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#333',
    marginBottom: 8,
  },

  // Input multiline para histórico
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top', // Alinha texto ao topo no Android
  },

  // Texto de status da seleção de imagem
  selectedText: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#388E3C',
    fontSize: 13,
  },

  // Container de botão com espaço
  buttonContainer: {
    marginVertical: 10,
  },

  // Espaçador entre botões
  spacer: {
    height: 15,
  },

  // Espaço no fundo
  bottomSpacer: {
    height: 20,
  },
});

export default AddEditFestival;