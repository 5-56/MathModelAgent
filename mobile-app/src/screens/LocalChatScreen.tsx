import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  IconButton,
  ActivityIndicator,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { LocalAgentService } from '../services/LocalAgentService';
import { Message } from '../types/Message';

const LocalChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string>('coordinator');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const agentService = new LocalAgentService();

  useEffect(() => {
    initializeService();
    addWelcomeMessage();
  }, []);

  const initializeService = async () => {
    try {
      const success = await agentService.initialize();
      if (success) {
        const currentModel = await agentService.getCurrentModel();
        setIsModelLoaded(!!currentModel);
        if (!currentModel) {
          Alert.alert(
            '未加载模型',
            '请先到模型管理页面下载并加载一个模型',
            [
              { text: '取消', onPress: () => navigation.goBack() },
              { text: '去管理', onPress: () => navigation.navigate('ModelManager' as never) },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Failed to initialize service:', error);
      Alert.alert('错误', '初始化本地AI服务失败');
    }
  };

  const addWelcomeMessage = () => {
    setMessages([{
      id: '1',
      content: '您好！我是MathModel Agent，现在运行在您的设备上。\n\n我可以帮助您：\n\n• 分析数学建模问题\n• 建立数学模型\n• 编写Python代码\n• 生成完整论文\n\n请描述您的问题，我将使用本地AI模型为您提供帮助。',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text',
    }]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !isModelLoaded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      if (currentAgent === 'workflow') {
        await runFullWorkflow(inputText);
      } else {
        await runSingleAgent(inputText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      Alert.alert('错误', '处理消息失败，请检查模型是否已加载');
    }
  };

  const runSingleAgent = async (message: string) => {
    try {
      const response = await agentService.runAgent(currentAgent, message);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          agent: response.agent,
          confidence: response.confidence,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullWorkflow = async (message: string) => {
    try {
      setWorkflowProgress(0);
      
      const workflow = await agentService.runWorkflow(message);
      
      // Add coordinator response
      const coordinatorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `**协调器分析：**\n\n${workflow.coordinator.content}`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text',
        metadata: { agent: '协调器' },
      };
      setMessages(prev => [...prev, coordinatorMessage]);
      setWorkflowProgress(25);

      // Add modeler response
      const modelerMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `**建模手方案：**\n\n${workflow.modeler.content}`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text',
        metadata: { agent: '建模手' },
      };
      setMessages(prev => [...prev, modelerMessage]);
      setWorkflowProgress(50);

      // Add coder response
      const coderMessage: Message = {
        id: (Date.now() + 3).toString(),
        content: `**代码手实现：**\n\n${workflow.coder.content}`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'code',
        metadata: { agent: '代码手' },
      };
      setMessages(prev => [...prev, coderMessage]);
      setWorkflowProgress(75);

      // Add writer response
      const writerMessage: Message = {
        id: (Date.now() + 4).toString(),
        content: `**论文手输出：**\n\n${workflow.writer.content}`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text',
        metadata: { agent: '论文手' },
      };
      setMessages(prev => [...prev, writerMessage]);
      setWorkflowProgress(100);
    } finally {
      setIsLoading(false);
      setTimeout(() => setWorkflowProgress(0), 2000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        <Card style={[styles.messageCard, isUser ? styles.userCard : styles.assistantCard]}>
          <Card.Content>
            {item.metadata?.agent && (
              <Chip mode="outlined" compact style={styles.agentChip}>
                {item.metadata.agent}
              </Chip>
            )}
            
            {item.type === 'text' ? (
              <Markdown style={markdownStyles}>
                {item.content}
              </Markdown>
            ) : (
              <Text>{item.content}</Text>
            )}
            
            <Text style={styles.timestamp}>
              {item.timestamp.toLocaleTimeString()}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const agentOptions = [
    { id: 'coordinator', name: '协调器', description: '分析问题' },
    { id: 'modeler', name: '建模手', description: '建立模型' },
    { id: 'coder', name: '代码手', description: '编写代码' },
    { id: 'writer', name: '论文手', description: '撰写论文' },
    { id: 'workflow', name: '完整流程', description: '全流程处理' },
  ];

  const quickActions = [
    { label: '数据分析', action: '请帮我分析这个数据集并建立预测模型' },
    { label: '优化问题', action: '我需要解决一个线性规划优化问题' },
    { label: '统计建模', action: '请帮我建立统计模型分析数据' },
    { label: '机器学习', action: '请帮我设计机器学习解决方案' },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>本地AI对话</Text>
        <Chip 
          mode="outlined" 
          compact
          textStyle={{ fontSize: 12 }}
        >
          {isModelLoaded ? '已加载' : '未加载'}
        </Chip>
      </View>

      <View style={styles.agentSelector}>
        <FlatList
          horizontal
          data={agentOptions}
          renderItem={({ item }) => (
            <Chip
              mode={currentAgent === item.id ? 'flat' : 'outlined'}
              onPress={() => setCurrentAgent(item.id)}
              style={styles.agentChip}
            >
              {item.name}
            </Chip>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>
            {currentAgent === 'workflow' ? 'AI正在处理完整流程...' : 'AI正在思考中...'}
          </Text>
          {workflowProgress > 0 && (
            <ProgressBar
              progress={workflowProgress / 100}
              color="#6366f1"
              style={styles.workflowProgress}
            />
          )}
        </View>
      )}

      <View style={styles.quickActions}>
        <FlatList
          horizontal
          data={quickActions}
          renderItem={({ item }) => (
            <Chip
              mode="outlined"
              onPress={() => setInputText(item.action)}
              style={styles.quickActionChip}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入您的问题..."
          multiline
          maxLength={1000}
          disabled={isLoading || !isModelLoaded}
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading || !isModelLoaded}
          style={styles.sendButton}
        >
          发送
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: '#f1f5f9',
    padding: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    marginVertical: 8,
  },
  strong: {
    fontWeight: 'bold',
  },
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
  agentSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  agentChip: {
    marginRight: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '85%',
  },
  userCard: {
    backgroundColor: '#6366f1',
  },
  assistantCard: {
    backgroundColor: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  loadingText: {
    marginLeft: 8,
    color: '#64748b',
  },
  workflowProgress: {
    width: 100,
    height: 4,
    marginLeft: 8,
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  quickActionChip: {
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
  },
});

export default LocalChatScreen;