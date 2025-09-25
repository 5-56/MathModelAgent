import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  Chip,
  FAB,
  ProgressBar,
  Text,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Task } from '../types/Message';
import { TaskService } from '../services/TaskService';

const TaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const taskService = new TaskService();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const loadedTasks = await taskService.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('错误', '加载任务失败');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const createNewTask = () => {
    navigation.navigate('Chat' as never);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in_progress':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <Card style={styles.taskCard}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <Title style={styles.taskTitle}>{item.title}</Title>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={{ borderColor: getStatusColor(item.status) }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        
        <Paragraph style={styles.taskDescription}>
          {item.description}
        </Paragraph>

        {item.status === 'in_progress' && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              进度: {item.progress}%
            </Text>
            <ProgressBar
              progress={item.progress / 100}
              color="#f59e0b"
              style={styles.progressBar}
            />
          </View>
        )}

        <View style={styles.taskFooter}>
          <Text style={styles.taskDate}>
            {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString()}
          </Text>
          
          <View style={styles.taskActions}>
            {item.status === 'completed' && item.result && (
              <Button
                mode="outlined"
                compact
                onPress={() => handleViewResult(item)}
                style={styles.actionButton}
              >
                查看结果
              </Button>
            )}
            
            {item.status === 'failed' && (
              <Button
                mode="outlined"
                compact
                onPress={() => handleRetryTask(item)}
                style={styles.actionButton}
              >
                重试
              </Button>
            )}
            
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteTask(item.id)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const handleViewResult = (task: Task) => {
    if (task.result) {
      if (task.result.type === 'file') {
        // Open file viewer
        navigation.navigate('FileManager' as never);
      } else {
        // Show result in modal or new screen
        Alert.alert('任务结果', task.result.content);
      }
    }
  };

  const handleRetryTask = async (task: Task) => {
    try {
      await taskService.retryTask(task.id);
      await loadTasks();
    } catch (error) {
      Alert.alert('错误', '重试任务失败');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      '删除任务',
      '确定要删除这个任务吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(taskId);
              await loadTasks();
            } catch (error) {
              Alert.alert('错误', '删除任务失败');
            }
          },
        },
      ]
    );
  };

  const emptyState = () => (
    <View style={styles.emptyState}>
      <IconButton
        icon="clipboard-list-outline"
        size={64}
        iconColor="#9ca3af"
      />
      <Title style={styles.emptyTitle}>暂无任务</Title>
      <Paragraph style={styles.emptyDescription}>
        开始一个新的数学建模任务吧！
      </Paragraph>
      <Button
        mode="contained"
        onPress={createNewTask}
        style={styles.emptyButton}
      >
        创建任务
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
          />
        }
        ListEmptyComponent={emptyState}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={createNewTask}
        label="新建任务"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  taskCard: {
    marginBottom: 16,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
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
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#9ca3af',
    flex: 1,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 8,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TaskScreen;