import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import TaskScreen from './src/screens/TaskScreen';
import TerminalScreen from './src/screens/TerminalScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FileManagerScreen from './src/screens/FileManagerScreen';

// Theme
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#ffffff',
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: '#000000',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'MathModel Agent' }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen} 
              options={{ title: '智能对话' }}
            />
            <Stack.Screen 
              name="Task" 
              component={TaskScreen} 
              options={{ title: '任务管理' }}
            />
            <Stack.Screen 
              name="Terminal" 
              component={TerminalScreen} 
              options={{ title: 'Termux终端' }}
            />
            <Stack.Screen 
              name="FileManager" 
              component={FileManagerScreen} 
              options={{ title: '文件管理' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: '设置' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;