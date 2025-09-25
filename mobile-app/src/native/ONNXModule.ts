import { NativeModules, Platform } from 'react-native';

interface ONNXModuleInterface {
  initialize(): Promise<boolean>;
  loadModel(modelPath: string): Promise<boolean>;
  generateText(prompt: string, config: any): Promise<string>;
  unloadModel(): Promise<boolean>;
  getModelInfo(): Promise<any>;
  isModelLoaded(): Promise<boolean>;
}

const { ONNXModule } = NativeModules;

export default ONNXModule as ONNXModuleInterface;

// Fallback implementation for development/testing
export class MockONNXModule implements ONNXModuleInterface {
  private isInitialized = false;
  private modelLoaded = false;
  private currentModel: string | null = null;

  async initialize(): Promise<boolean> {
    console.log('Mock ONNX: Initializing ONNX Runtime...');
    this.isInitialized = true;
    return true;
  }

  async loadModel(modelPath: string): Promise<boolean> {
    console.log(`Mock ONNX: Loading model from ${modelPath}`);
    this.currentModel = modelPath;
    this.modelLoaded = true;
    return true;
  }

  async generateText(prompt: string, config: any): Promise<string> {
    console.log(`Mock ONNX: Generating text with prompt: ${prompt.substring(0, 50)}...`);
    
    // Simulate text generation with realistic responses
    const responses = [
      "基于您提供的数学建模问题，我将为您分析并生成解决方案。首先，让我理解问题的核心要求...",
      "这是一个典型的优化问题，我们可以采用以下建模方法：\n\n1. 建立目标函数\n2. 确定约束条件\n3. 选择求解算法",
      "让我为您编写Python代码来实现这个数学模型：\n\n```python\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# 数据加载和分析\n# ...\n```",
      "根据分析结果，我建议采用以下策略来解决这个数学建模问题...",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return randomResponse;
  }

  async unloadModel(): Promise<boolean> {
    console.log('Mock ONNX: Unloading model');
    this.currentModel = null;
    this.modelLoaded = false;
    return true;
  }

  async getModelInfo(): Promise<any> {
    return {
      modelPath: this.currentModel,
      isLoaded: this.modelLoaded,
      parameters: '7B',
      quantization: 'Q4_K_M',
      memoryUsage: '2.1GB',
    };
  }

  async isModelLoaded(): Promise<boolean> {
    return this.modelLoaded;
  }
}

// Export the appropriate module based on platform
export const ONNXService = Platform.OS === 'android' && ONNXModule 
  ? ONNXModule 
  : new MockONNXModule();