import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, IconButton, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const features = [
    {
      title: '智能对话',
      description: '与AI智能体进行数学建模对话',
      icon: 'chat',
      color: '#6366f1',
      onPress: () => navigation.navigate('Chat' as never),
    },
    {
      title: '任务管理',
      description: '查看和管理建模任务进度',
      icon: 'clipboard-list',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('Task' as never),
    },
    {
      title: 'Termux终端',
      description: '内置终端环境，执行Python代码',
      icon: 'terminal',
      color: '#06b6d4',
      onPress: () => navigation.navigate('Terminal' as never),
    },
    {
      title: '文件管理',
      description: '管理项目文件和结果',
      icon: 'folder',
      color: '#10b981',
      onPress: () => navigation.navigate('FileManager' as never),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>欢迎使用 MathModel Agent</Title>
            <Paragraph style={styles.welcomeText}>
              专为数学建模设计的移动端智能体应用，集成Termux终端环境，
              让您随时随地完成数学建模任务。
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Card 
              key={index} 
              style={[styles.featureCard, { width: (width - 48) / 2 }]}
              onPress={feature.onPress}
            >
              <Card.Content style={styles.featureContent}>
                <IconButton
                  icon={feature.icon}
                  size={32}
                  iconColor={feature.color}
                  style={styles.featureIcon}
                />
                <Title style={[styles.featureTitle, { color: feature.color }]}>
                  {feature.title}
                </Title>
                <Paragraph style={styles.featureDescription}>
                  {feature.description}
                </Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Card style={styles.statusCard}>
          <Card.Content>
            <Title>系统状态</Title>
            <View style={styles.statusRow}>
              <Paragraph>Termux环境: </Paragraph>
              <Button mode="outlined" compact>
                已连接
              </Button>
            </View>
            <View style={styles.statusRow}>
              <Paragraph>Python版本: </Paragraph>
              <Button mode="outlined" compact>
                Python 3.12
              </Button>
            </View>
            <View style={styles.statusRow}>
              <Paragraph>后端服务: </Paragraph>
              <Button mode="outlined" compact>
                在线
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Chat' as never)}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  welcomeCard: {
    marginBottom: 20,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#64748b',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    marginBottom: 16,
    elevation: 2,
  },
  featureContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  featureIcon: {
    margin: 0,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#64748b',
    lineHeight: 16,
  },
  statusCard: {
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;