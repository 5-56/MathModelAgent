import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  Chip,
  FAB,
  Text,
  List,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FileService } from '../services/FileService';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modified: Date;
  path: string;
  extension?: string;
}

const FileManagerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/data/data/com.termux/files/home');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const fileService = new FileService();

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const loadedFiles = await fileService.getFiles(currentPath);
      setFiles(loadedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert('错误', '加载文件失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return 'folder';
    }
    
    const ext = file.extension?.toLowerCase();
    switch (ext) {
      case '.py':
        return 'language-python';
      case '.ipynb':
        return 'notebook';
      case '.md':
        return 'markdown';
      case '.txt':
        return 'text';
      case '.json':
        return 'code-json';
      case '.csv':
        return 'file-delimited';
      case '.png':
      case '.jpg':
      case '.jpeg':
        return 'image';
      case '.pdf':
        return 'file-pdf';
      default:
        return 'file';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFilePress = async (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
    } else {
      // Open file
      try {
        const content = await fileService.readFile(file.path);
        Alert.alert(
          file.name,
          content.length > 500 ? content.substring(0, 500) + '...' : content,
          [
            { text: '关闭' },
            { text: '分享', onPress: () => handleShareFile(file) },
          ]
        );
      } catch (error) {
        Alert.alert('错误', '无法读取文件');
      }
    }
  };

  const handleShareFile = async (file: FileItem) => {
    try {
      const content = await fileService.readFile(file.path);
      await Share.share({
        message: content,
        title: file.name,
      });
    } catch (error) {
      Alert.alert('错误', '分享文件失败');
    }
  };

  const handleDeleteFile = (file: FileItem) => {
    Alert.alert(
      '删除文件',
      `确定要删除 ${file.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await fileService.deleteFile(file.path);
              await loadFiles();
            } catch (error) {
              Alert.alert('错误', '删除文件失败');
            }
          },
        },
      ]
    );
  };

  const handleCreateFolder = () => {
    Alert.prompt(
      '新建文件夹',
      '请输入文件夹名称',
      async (folderName) => {
        if (folderName) {
          try {
            await fileService.createFolder(`${currentPath}/${folderName}`);
            await loadFiles();
          } catch (error) {
            Alert.alert('错误', '创建文件夹失败');
          }
        }
      }
    );
  };

  const navigateUp = () => {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    if (parentPath) {
      setCurrentPath(parentPath);
    }
  };

  const renderFile = ({ item }: { item: FileItem }) => (
    <List.Item
      title={item.name}
      description={`${item.type === 'folder' ? '文件夹' : formatFileSize(item.size)} • ${item.modified.toLocaleString()}`}
      left={(props) => (
        <List.Icon
          {...props}
          icon={getFileIcon(item)}
          color={item.type === 'folder' ? '#f59e0b' : '#6b7280'}
        />
      )}
      right={(props) => (
        <View style={styles.fileActions}>
          <IconButton
            icon="share"
            size={20}
            onPress={() => handleShareFile(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDeleteFile(item)}
          />
        </View>
      )}
      onPress={() => handleFilePress(item)}
      style={styles.fileItem}
    />
  );

  const breadcrumb = currentPath.split('/').filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.breadcrumb}>
          <Button
            mode="text"
            onPress={() => setCurrentPath('/data/data/com.termux/files/home')}
            style={styles.breadcrumbItem}
          >
            首页
          </Button>
          {breadcrumb.map((segment, index) => (
            <View key={index} style={styles.breadcrumbSegment}>
              <Text style={styles.breadcrumbSeparator}>/</Text>
              <Button
                mode="text"
                onPress={() => {
                  const path = '/data/data/com.termux/files/home/' + 
                    breadcrumb.slice(0, index + 1).join('/');
                  setCurrentPath(path);
                }}
                style={styles.breadcrumbItem}
              >
                {segment}
              </Button>
            </View>
          ))}
        </View>
        
        <View style={styles.headerActions}>
          <IconButton
            icon="arrow-up"
            onPress={navigateUp}
            disabled={currentPath === '/data/data/com.termux/files/home'}
          />
          <IconButton
            icon="refresh"
            onPress={loadFiles}
          />
        </View>
      </View>

      <FlatList
        data={files}
        renderItem={renderFile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <Divider />}
      />

      <View style={styles.fabContainer}>
        <FAB
          icon="folder-plus"
          style={styles.fab}
          onPress={handleCreateFolder}
          label="新建文件夹"
        />
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  breadcrumb: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbSeparator: {
    marginHorizontal: 4,
    color: '#6b7280',
  },
  breadcrumbItem: {
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
  },
  listContent: {
    paddingBottom: 100,
  },
  fileItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    elevation: 1,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    borderRadius: 28,
  },
});

export default FileManagerScreen;