import RNFS from 'react-native-fs';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modified: Date;
  path: string;
  extension?: string;
}

export class FileService {
  private basePath = '/data/data/com.termux/files/home';

  async getFiles(path: string): Promise<FileItem[]> {
    try {
      // In a real implementation, this would interface with Termux
      // For demo purposes, return mock data
      return this.getMockFiles(path);
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      // In a real implementation, this would read from Termux filesystem
      // For demo purposes, return mock content
      return this.getMockFileContent(filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // In a real implementation, this would write to Termux filesystem
      console.log(`Writing to ${filePath}:`, content);
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // In a real implementation, this would delete from Termux filesystem
      console.log(`Deleting file: ${filePath}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async createFolder(folderPath: string): Promise<void> {
    try {
      // In a real implementation, this would create folder in Termux filesystem
      console.log(`Creating folder: ${folderPath}`);
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      // In a real implementation, this would copy file in Termux filesystem
      console.log(`Copying from ${sourcePath} to ${destPath}`);
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      // In a real implementation, this would move file in Termux filesystem
      console.log(`Moving from ${sourcePath} to ${destPath}`);
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  private getMockFiles(path: string): FileItem[] {
    const mockFiles: FileItem[] = [
      {
        id: '1',
        name: 'projects',
        type: 'folder',
        size: 4096,
        modified: new Date(Date.now() - 86400000),
        path: `${path}/projects`,
      },
      {
        id: '2',
        name: 'data_analysis.py',
        type: 'file',
        size: 2048,
        modified: new Date(Date.now() - 3600000),
        path: `${path}/data_analysis.py`,
        extension: '.py',
      },
      {
        id: '3',
        name: 'model_notebook.ipynb',
        type: 'file',
        size: 15360,
        modified: new Date(Date.now() - 7200000),
        path: `${path}/model_notebook.ipynb`,
        extension: '.ipynb',
      },
      {
        id: '4',
        name: 'results.csv',
        type: 'file',
        size: 8192,
        modified: new Date(Date.now() - 1800000),
        path: `${path}/results.csv`,
        extension: '.csv',
      },
      {
        id: '5',
        name: 'README.md',
        type: 'file',
        size: 1024,
        modified: new Date(Date.now() - 172800000),
        path: `${path}/README.md`,
        extension: '.md',
      },
      {
        id: '6',
        name: 'config.json',
        type: 'file',
        size: 512,
        modified: new Date(Date.now() - 259200000),
        path: `${path}/config.json`,
        extension: '.json',
      },
    ];

    // Filter files based on current path
    if (path === this.basePath) {
      return mockFiles;
    } else if (path.includes('projects')) {
      return [
        {
          id: '7',
          name: 'math_modeling',
          type: 'folder',
          size: 8192,
          modified: new Date(Date.now() - 43200000),
          path: `${path}/math_modeling`,
        },
        {
          id: '8',
          name: 'data_science',
          type: 'folder',
          size: 12288,
          modified: new Date(Date.now() - 86400000),
          path: `${path}/data_science`,
        },
      ];
    }

    return [];
  }

  private getMockFileContent(filePath: string): string {
    const fileName = filePath.split('/').pop()?.toLowerCase();
    
    switch (fileName) {
      case 'data_analysis.py':
        return `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 数据加载
data = pd.read_csv('data.csv')

# 数据探索
print(data.head())
print(data.describe())

# 可视化
plt.figure(figsize=(10, 6))
sns.histplot(data['value'])
plt.title('数据分布')
plt.show()

# 统计分析
correlation = data.corr()
print(correlation)`;

      case 'model_notebook.ipynb':
        return `{
  "cells": [
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "# 数学建模分析\\n",
        "\\n",
        "本notebook包含完整的数学建模分析过程"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": 1,
      "metadata": {},
      "outputs": [],
      "source": [
        "import numpy as np\\n",
        "import pandas as pd\\n",
        "import matplotlib.pyplot as plt"
      ]
    }
  ],
  "metadata": {
    "kernelspec": {
      "display_name": "Python 3",
      "language": "python",
      "name": "python3"
    }
  }
}`;

      case 'results.csv':
        return `id,value,prediction,actual
1,10.5,11.2,11.0
2,15.3,14.8,15.1
3,8.7,9.1,8.9
4,22.1,21.5,22.3
5,18.9,19.2,19.0`;

      case 'readme.md':
        return `# MathModel Agent 项目

这是一个使用 MathModel Agent 创建的数学建模项目。

## 文件说明

- \`data_analysis.py\`: 数据分析脚本
- \`model_notebook.ipynb\`: Jupyter notebook 文件
- \`results.csv\`: 分析结果数据
- \`config.json\`: 配置文件

## 使用方法

1. 运行数据分析脚本
2. 查看 Jupyter notebook
3. 分析结果数据`;

      case 'config.json':
        return `{
  "model": {
    "type": "regression",
    "algorithm": "random_forest",
    "parameters": {
      "n_estimators": 100,
      "max_depth": 10
    }
  },
  "data": {
    "train_split": 0.8,
    "test_split": 0.2
  },
  "output": {
    "format": "pdf",
    "include_plots": true
  }
}`;

      default:
        return `文件内容: ${filePath}\n\n这是一个示例文件，实际应用中会显示真实文件内容。`;
    }
  }
}