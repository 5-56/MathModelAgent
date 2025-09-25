import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Switch as PaperSwitch,
  List,
  Divider,
  IconButton,
  Chip,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  apiKey: string;
  serverUrl: string;
  autoSave: boolean;
  notifications: boolean;
  darkMode: boolean;
  pythonPath: string;
  termuxEnabled: boolean;
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    serverUrl: 'http://localhost:8000',
    autoSave: true,
    notifications: true,
    darkMode: false,
    pythonPath: '/data/data/com.termux/files/usr/bin/python3',
    termuxEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
      Alert.alert('成功', '设置已保存');
    } catch (error) {
      Alert.alert('错误', '保存设置失败');
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Test API connection
      const response = await fetch(`${settings.serverUrl}/health`);
      if (response.ok) {
        Alert.alert('成功', '服务器连接正常');
      } else {
        Alert.alert('错误', '服务器连接失败');
      }
    } catch (error) {
      Alert.alert('错误', '无法连接到服务器');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    Alert.alert(
      '重置设置',
      '确定要重置所有设置吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: () => {
            setSettings({
              apiKey: '',
              serverUrl: 'http://localhost:8000',
              autoSave: true,
              notifications: true,
              darkMode: false,
              pythonPath: '/data/data/com.termux/files/usr/bin/python3',
              termuxEnabled: true,
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Content>
          <Title>API 配置</Title>
          <TextInput
            label="API Key"
            value={settings.apiKey}
            onChangeText={(text) => updateSetting('apiKey', text)}
            secureTextEntry
            style={styles.input}
            placeholder="输入您的API密钥"
          />
          <TextInput
            label="服务器地址"
            value={settings.serverUrl}
            onChangeText={(text) => updateSetting('serverUrl', text)}
            style={styles.input}
            placeholder="http://localhost:8000"
          />
          <Button
            mode="outlined"
            onPress={testConnection}
            loading={isLoading}
            style={styles.button}
          >
            测试连接
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title>Termux 配置</Title>
          <List.Item
            title="启用 Termux"
            description="启用内置终端环境"
            right={() => (
              <PaperSwitch
                value={settings.termuxEnabled}
                onValueChange={(value) => updateSetting('termuxEnabled', value)}
              />
            )}
          />
          <TextInput
            label="Python 路径"
            value={settings.pythonPath}
            onChangeText={(text) => updateSetting('pythonPath', text)}
            style={styles.input}
            placeholder="/data/data/com.termux/files/usr/bin/python3"
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title>应用设置</Title>
          <List.Item
            title="自动保存"
            description="自动保存任务进度"
            right={() => (
              <PaperSwitch
                value={settings.autoSave}
                onValueChange={(value) => updateSetting('autoSave', value)}
              />
            )}
          />
          <List.Item
            title="通知"
            description="接收任务完成通知"
            right={() => (
              <PaperSwitch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
              />
            )}
          />
          <List.Item
            title="深色模式"
            description="使用深色主题"
            right={() => (
              <PaperSwitch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title>系统信息</Title>
          <View style={styles.infoRow}>
            <Paragraph>应用版本</Paragraph>
            <Chip mode="outlined">1.0.0</Chip>
          </View>
          <View style={styles.infoRow}>
            <Paragraph>Termux 版本</Paragraph>
            <Chip mode="outlined">0.118.0</Chip>
          </View>
          <View style={styles.infoRow}>
            <Paragraph>Python 版本</Paragraph>
            <Chip mode="outlined">3.12.0</Chip>
          </View>
          <View style={styles.infoRow}>
            <Paragraph>存储空间</Paragraph>
            <Chip mode="outlined">2.1 GB 可用</Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title>操作</Title>
          <Button
            mode="contained"
            onPress={saveSettings}
            style={styles.button}
          >
            保存设置
          </Button>
          <Button
            mode="outlined"
            onPress={resetSettings}
            style={styles.button}
          >
            重置设置
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('关于', 'MathModel Agent Mobile v1.0.0\n专为数学建模设计的移动端智能体应用')}
            style={styles.button}
          >
            关于应用
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
});

export default SettingsScreen;