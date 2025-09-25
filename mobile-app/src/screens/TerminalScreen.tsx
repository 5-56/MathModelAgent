import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  IconButton,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { TerminalService } from '../services/TerminalService';

const { height } = Dimensions.get('window');

const TerminalScreen: React.FC = () => {
  const navigation = useNavigation();
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [inputCommand, setInputCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPath, setCurrentPath] = useState('/data/data/com.termux/files/home');
  const [pythonVersion, setPythonVersion] = useState('Python 3.12.0');
  const scrollViewRef = useRef<ScrollView>(null);
  const terminalService = useRef<TerminalService | null>(null);

  useEffect(() => {
    // Initialize Terminal service
    terminalService.current = new TerminalService();
    
    // Add welcome message
    setTerminalOutput([
      'MathModel Agent Terminal v1.0.0',
      'Termux环境已就绪',
      'Python环境已配置',
      '输入 "help" 查看可用命令',
      '',
      `${currentPath} $ `,
    ]);

    return () => {
      terminalService.current?.cleanup();
    };
  }, []);

  const executeCommand = async () => {
    if (!inputCommand.trim() || isExecuting) return;

    const command = inputCommand.trim();
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    setInputCommand('');
    setIsExecuting(true);

    try {
      const result = await terminalService.current?.executeCommand(command);
      
      if (result) {
        setTerminalOutput(prev => [...prev, result.output]);
        if (result.error) {
          setTerminalOutput(prev => [...prev, `Error: ${result.error}`]);
        }
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, `Error: ${error}`]);
    } finally {
      setIsExecuting(false);
      setTerminalOutput(prev => [...prev, '', `${currentPath} $ `]);
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const quickCommands = [
    { label: 'Python', command: 'python3' },
    { label: 'Pip', command: 'pip list' },
    { label: 'Pwd', command: 'pwd' },
    { label: 'Ls', command: 'ls -la' },
    { label: 'Clear', command: 'clear' },
  ];

  const pythonCommands = [
    { label: '导入库', command: 'import numpy as np; import pandas as pd; import matplotlib.pyplot as plt' },
    { label: '查看版本', command: 'python3 --version' },
    { label: '启动Jupyter', command: 'jupyter notebook --ip=0.0.0.0 --port=8888' },
    { label: '安装包', command: 'pip install package_name' },
  ];

  const renderOutput = () => {
    return terminalOutput.map((line, index) => {
      const isCommand = line.startsWith('$ ');
      const isError = line.startsWith('Error:');
      const isPrompt = line.endsWith('$ ');
      
      return (
        <Text
          key={index}
          style={[
            styles.outputLine,
            isCommand && styles.commandLine,
            isError && styles.errorLine,
            isPrompt && styles.promptLine,
          ]}
        >
          {line}
        </Text>
      );
    });
  };

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
        <Text style={styles.headerTitle}>Termux终端</Text>
        <Chip 
          mode="outlined" 
          compact
          textStyle={{ fontSize: 12 }}
        >
          {isExecuting ? '执行中' : '就绪'}
        </Chip>
      </View>

      <Card style={styles.terminalCard}>
        <Card.Content style={styles.terminalContent}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.terminalOutput}
            contentContainerStyle={styles.terminalOutputContent}
          >
            {renderOutput()}
            {isExecuting && (
              <View style={styles.executingIndicator}>
                <ActivityIndicator size="small" />
                <Text style={styles.executingText}>执行中...</Text>
              </View>
            )}
          </ScrollView>
        </Card.Content>
      </Card>

      <View style={styles.quickCommands}>
        <Text style={styles.quickCommandsTitle}>快速命令</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickCommands.map((cmd, index) => (
            <Chip
              key={index}
              mode="outlined"
              onPress={() => setInputCommand(cmd.command)}
              style={styles.quickCommandChip}
            >
              {cmd.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.pythonCommands}>
        <Text style={styles.pythonCommandsTitle}>Python命令</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pythonCommands.map((cmd, index) => (
            <Chip
              key={index}
              mode="outlined"
              onPress={() => setInputCommand(cmd.command)}
              style={styles.pythonCommandChip}
            >
              {cmd.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.commandInput}
          value={inputCommand}
          onChangeText={setInputCommand}
          placeholder="输入命令..."
          multiline
          maxLength={500}
          disabled={isExecuting}
          onSubmitEditing={executeCommand}
        />
        <Button
          mode="contained"
          onPress={executeCommand}
          disabled={!inputCommand.trim() || isExecuting}
          style={styles.executeButton}
        >
          执行
        </Button>
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>路径: {currentPath}</Text>
        <Text style={styles.statusText}>Python: {pythonVersion}</Text>
      </View>
    </KeyboardAvoidingView>
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
  terminalCard: {
    flex: 1,
    margin: 16,
    elevation: 2,
  },
  terminalContent: {
    flex: 1,
    padding: 0,
  },
  terminalOutput: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 12,
  },
  terminalOutputContent: {
    paddingBottom: 20,
  },
  outputLine: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  commandLine: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  errorLine: {
    color: '#ef4444',
  },
  promptLine: {
    color: '#f59e0b',
  },
  executingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  executingText: {
    marginLeft: 8,
    color: '#e2e8f0',
    fontFamily: 'monospace',
  },
  quickCommands: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickCommandsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  quickCommandChip: {
    marginRight: 8,
  },
  pythonCommands: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pythonCommandsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  pythonCommandChip: {
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  commandInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
    fontFamily: 'monospace',
  },
  executeButton: {
    borderRadius: 20,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
});

export default TerminalScreen;