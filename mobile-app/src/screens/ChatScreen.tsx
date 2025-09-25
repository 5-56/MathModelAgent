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
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { WebSocketService } from '../services/WebSocketService';
import { Message } from '../types/Message';

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const wsService = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsService.current = new WebSocketService();
    wsService.current.connect();
    
    wsService.current.onMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      setIsLoading(false);
    };

    wsService.current.onStatusChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    // Add welcome message
    setMessages([{
      id: '1',
      content: '您好！我是MathModel Agent，专为数学建模设计的智能助手。我可以帮助您：\n\n• 分析数学建模问题\n• 生成解决方案\n• 编写Python代码\n• 生成完整论文\n\n请描述您的问题，我将为您提供专业的建模建议。',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text',
    }]);

    return () => {
      wsService.current?.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

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
      // Send message to backend
      await wsService.current?.sendMessage({
        type: 'problem',
        content: inputText,
        task_id: `task_${Date.now()}`,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      Alert.alert('错误', '发送消息失败，请检查网络连接');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        <Card style={[styles.messageCard, isUser ? styles.userCard : styles.assistantCard]}>
          <Card.Content>
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

  const quickActions = [
    { label: '数据分析', action: '请帮我分析这个数据集' },
    { label: '数学建模', action: '我需要建立一个数学模型' },
    { label: '代码生成', action: '请生成Python代码' },
    { label: '论文写作', action: '帮我写建模论文' },
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
        <Text style={styles.headerTitle}>智能对话</Text>
        <Chip 
          mode="outlined" 
          compact
          textStyle={{ fontSize: 12 }}
        >
          {isConnected ? '已连接' : '连接中...'}
        </Chip>
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
          <Text style={styles.loadingText}>AI正在思考中...</Text>
        </View>
      )}

      <View style={styles.quickActions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickActions.map((action, index) => (
            <Chip
              key={index}
              mode="outlined"
              onPress={() => setInputText(action.action)}
              style={styles.quickActionChip}
            >
              {action.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入您的问题..."
          multiline
          maxLength={1000}
          disabled={isLoading}
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
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
    maxWidth: '80%',
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
  },
  loadingText: {
    marginLeft: 8,
    color: '#64748b',
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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

export default ChatScreen;