import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  Chip,
  List,
  IconButton,
  Text,
  Divider,
  Switch,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LocalAgentService } from '../services/LocalAgentService';
import { ModelInfo } from '../services/LocalLLMService';

const { width } = Dimensions.get('window');

const ModelManagerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentModel, setCurrentModel] = useState<ModelInfo | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const agentService = new LocalAgentService();

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    setIsLoading(true);
    try {
      const success = await agentService.initialize();
      if (success) {
        await loadModels();
        await loadSystemInfo();
        const current = await agentService.getCurrentModel();
        setCurrentModel(current);
      } else {
        Alert.alert('错误', '无法初始化本地AI服务');
      }
    } catch (error) {
      console.error('Failed to initialize service:', error);
      Alert.alert('错误', '初始化失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const availableModels = await agentService.getAvailableModels();
      setModels(availableModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const info = await agentService.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadModel = async (model: ModelInfo) => {
    if (model.downloaded) return;

    // Check available storage
    if (systemInfo && model.size > systemInfo.storageSpace) {
      Alert.alert('存储空间不足', '请清理存储空间后重试');
      return;
    }

    // Check available memory
    if (systemInfo && model.memoryRequired > systemInfo.availableMemory) {
      Alert.alert('内存不足', '该模型需要更多内存，建议关闭其他应用');
      return;
    }

    setDownloadingModel(model.id);
    setDownloadProgress(0);

    try {
      const success = await agentService.downloadModel(model.id, (progress) => {
        setDownloadProgress(progress);
      });

      if (success) {
        Alert.alert('成功', '模型下载完成');
        await loadModels();
      } else {
        Alert.alert('错误', '模型下载失败');
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('错误', '下载过程中出现错误');
    } finally {
      setDownloadingModel(null);
      setDownloadProgress(0);
    }
  };

  const handleLoadModel = async (model: ModelInfo) => {
    if (!model.downloaded) {
      Alert.alert('错误', '请先下载模型');
      return;
    }

    try {
      const success = await agentService.loadModel(model.id);
      if (success) {
        setCurrentModel(model);
        Alert.alert('成功', `已加载模型: ${model.name}`);
      } else {
        Alert.alert('错误', '模型加载失败');
      }
    } catch (error) {
      console.error('Load model failed:', error);
      Alert.alert('错误', '加载模型时出现错误');
    }
  };

  const handleDeleteModel = (model: ModelInfo) => {
    Alert.alert(
      '删除模型',
      `确定要删除 ${model.name} 吗？这将释放 ${formatFileSize(model.size)} 存储空间。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            // Implement model deletion
            Alert.alert('提示', '模型删除功能待实现');
          },
        },
      ]
    );
  };

  const renderModel = ({ item }: { item: ModelInfo }) => (
    <Card style={styles.modelCard}>
      <Card.Content>
        <View style={styles.modelHeader}>
          <View style={styles.modelInfo}>
            <Title style={styles.modelName}>{item.name}</Title>
            <Paragraph style={styles.modelSize}>
              {formatFileSize(item.size)} • 需要内存: {formatFileSize(item.memoryRequired)}
            </Paragraph>
          </View>
          <View style={styles.modelStatus}>
            {item.downloaded ? (
              <Chip mode="outlined" textStyle={{ color: '#10b981' }}>
                已下载
              </Chip>
            ) : (
              <Chip mode="outlined" textStyle={{ color: '#6b7280' }}>
                未下载
              </Chip>
            )}
            {currentModel?.id === item.id && (
              <Chip mode="outlined" textStyle={{ color: '#6366f1' }}>
                当前使用
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.modelActions}>
          {!item.downloaded ? (
            <Button
              mode="contained"
              onPress={() => handleDownloadModel(item)}
              loading={downloadingModel === item.id}
              disabled={downloadingModel !== null}
              style={styles.actionButton}
            >
              下载
            </Button>
          ) : (
            <View style={styles.downloadedActions}>
              <Button
                mode="outlined"
                onPress={() => handleLoadModel(item)}
                disabled={currentModel?.id === item.id}
                style={styles.actionButton}
              >
                {currentModel?.id === item.id ? '已加载' : '加载'}
              </Button>
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteModel(item)}
                iconColor="#ef4444"
              />
            </View>
          )}
        </View>

        {downloadingModel === item.id && (
          <View style={styles.downloadProgress}>
            <Text style={styles.progressText}>
              下载进度: {downloadProgress}%
            </Text>
            <ProgressBar
              progress={downloadProgress / 100}
              color="#6366f1"
              style={styles.progressBar}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderSystemInfo = () => {
    if (!systemInfo) return null;

    return (
      <Card style={styles.systemCard}>
        <Card.Content>
          <Title>系统信息</Title>
          <View style={styles.systemInfoRow}>
            <Text>总内存: {formatFileSize(systemInfo.totalMemory)}</Text>
            <Text>可用内存: {formatFileSize(systemInfo.availableMemory)}</Text>
          </View>
          <View style={styles.systemInfoRow}>
            <Text>存储空间: {formatFileSize(systemInfo.storageSpace)}</Text>
            <Text>CPU核心: {systemInfo.cpuCores}</Text>
          </View>
          {systemInfo.isLowMemory && (
            <Chip mode="outlined" textStyle={{ color: '#ef4444' }}>
              内存不足
            </Chip>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton
        icon="robot"
        size={64}
        iconColor="#9ca3af"
      />
      <Title style={styles.emptyTitle}>暂无可用模型</Title>
      <Paragraph style={styles.emptyDescription}>
        请检查网络连接或稍后重试
      </Paragraph>
      <Button
        mode="contained"
        onPress={loadModels}
        style={styles.emptyButton}
      >
        刷新
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
        />
        <Title style={styles.headerTitle}>模型管理</Title>
        <IconButton
          icon="refresh"
          onPress={loadModels}
          loading={isLoading}
        />
      </View>

      {renderSystemInfo()}

      <FlatList
        data={models}
        renderItem={renderModel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={isLoading}
        onRefresh={loadModels}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  systemCard: {
    margin: 16,
    elevation: 2,
  },
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  modelCard: {
    marginBottom: 16,
    elevation: 2,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modelInfo: {
    flex: 1,
    marginRight: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modelSize: {
    fontSize: 12,
    color: '#64748b',
  },
  modelStatus: {
    alignItems: 'flex-end',
  },
  modelActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 20,
  },
  downloadedActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadProgress: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#6b7280',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 20,
  },
});

export default ModelManagerScreen;