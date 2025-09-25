import { LocalLLMService, ModelInfo, ModelConfig } from './LocalLLMService';
import { Message } from '../types/Message';

export interface AgentRole {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface AgentResponse {
  content: string;
  agent: string;
  confidence: number;
  metadata?: any;
}

export class LocalAgentService {
  private llmService: LocalLLMService;
  private agents: Map<string, AgentRole> = new Map();
  private isInitialized = false;

  constructor() {
    this.llmService = LocalLLMService.getInstance();
    this.initializeAgents();
  }

  async initialize(): Promise<boolean> {
    try {
      const success = await this.llmService.initialize();
      if (success) {
        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize LocalAgentService:', error);
      return false;
    }
  }

  private initializeAgents(): void {
    // 协调器智能体
    this.agents.set('coordinator', {
      id: 'coordinator',
      name: '协调器',
      description: '识别用户意图和拆解问题',
      systemPrompt: `你是一个数学建模协调器，负责分析用户的问题并拆解为具体的子任务。

你的职责：
1. 理解用户的数学建模需求
2. 将复杂问题拆解为可执行的子任务
3. 确定问题类型（优化、预测、分类等）
4. 规划解决方案的步骤

请用中文回复，保持专业和清晰的表达。`,
      temperature: 0.3,
      maxTokens: 1024,
    });

    // 建模手智能体
    this.agents.set('modeler', {
      id: 'modeler',
      name: '建模手',
      description: '负责数学建模和方案设计',
      systemPrompt: `你是一个数学建模专家，专门负责建立数学模型和设计解决方案。

你的职责：
1. 分析问题背景和约束条件
2. 选择合适的数学方法（线性规划、非线性规划、统计方法等）
3. 建立数学模型
4. 设计求解算法
5. 进行模型验证和敏感性分析

请提供详细的建模思路和数学公式，用中文回复。`,
      temperature: 0.5,
      maxTokens: 2048,
    });

    // 代码手智能体
    this.agents.set('coder', {
      id: 'coder',
      name: '代码手',
      description: '执行Python代码和数据分析',
      systemPrompt: `你是一个Python编程专家，专门负责编写和执行数学建模相关的代码。

你的职责：
1. 编写Python代码实现数学模型
2. 进行数据分析和可视化
3. 使用科学计算库（numpy, pandas, matplotlib, scipy等）
4. 调试和优化代码
5. 生成可执行的Jupyter notebook

请提供完整、可运行的Python代码，并添加详细注释。`,
      temperature: 0.4,
      maxTokens: 3072,
    });

    // 论文手智能体
    this.agents.set('writer', {
      id: 'writer',
      name: '论文手',
      description: '生成完整的数学建模论文',
      systemPrompt: `你是一个学术写作专家，专门负责撰写数学建模论文。

你的职责：
1. 撰写论文的各个部分（摘要、引言、模型建立、求解、结果分析等）
2. 整理和总结建模结果
3. 生成图表说明和数学公式
4. 确保论文结构完整、逻辑清晰
5. 使用规范的学术写作格式

请用中文撰写，保持学术性和专业性。`,
      temperature: 0.6,
      maxTokens: 4096,
    });
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    return this.llmService.getAvailableModels();
  }

  async downloadModel(modelId: string, onProgress?: (progress: number) => void): Promise<boolean> {
    return this.llmService.downloadModel(modelId, onProgress);
  }

  async loadModel(modelId: string): Promise<boolean> {
    return this.llmService.loadModel(modelId);
  }

  async getCurrentModel(): Promise<ModelInfo | null> {
    return this.llmService.getCurrentModel();
  }

  async updateModelConfig(config: Partial<ModelConfig>): Promise<void> {
    return this.llmService.updateConfig(config);
  }

  async getSystemInfo() {
    return this.llmService.getSystemInfo();
  }

  async runAgent(agentId: string, userMessage: string, context?: string): Promise<AgentResponse> {
    if (!this.isInitialized) {
      throw new Error('Agent service not initialized');
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      const fullPrompt = context ? `${context}\n\n${userMessage}` : userMessage;
      const result = await this.llmService.generateWithSystemPrompt(
        agent.systemPrompt,
        fullPrompt
      );

      return {
        content: result.text,
        agent: agent.name,
        confidence: this.calculateConfidence(result.text),
        metadata: {
          tokens: result.tokens,
          time: result.time,
          model: result.model,
        },
      };
    } catch (error) {
      console.error(`Agent ${agentId} execution failed:`, error);
      throw error;
    }
  }

  async runWorkflow(problem: string): Promise<{
    coordinator: AgentResponse;
    modeler: AgentResponse;
    coder: AgentResponse;
    writer: AgentResponse;
  }> {
    if (!this.isInitialized) {
      throw new Error('Agent service not initialized');
    }

    try {
      // 1. 协调器分析问题
      const coordinatorResponse = await this.runAgent('coordinator', problem);
      
      // 2. 建模手建立模型
      const modelerContext = `问题：${problem}\n\n协调器分析：${coordinatorResponse.content}`;
      const modelerResponse = await this.runAgent('modeler', '请基于以上分析建立数学模型', modelerContext);
      
      // 3. 代码手编写代码
      const coderContext = `问题：${problem}\n\n建模方案：${modelerResponse.content}`;
      const coderResponse = await this.runAgent('coder', '请编写Python代码实现上述模型', coderContext);
      
      // 4. 论文手撰写论文
      const writerContext = `问题：${problem}\n\n建模方案：${modelerResponse.content}\n\n代码实现：${coderResponse.content}`;
      const writerResponse = await this.runAgent('writer', '请撰写完整的数学建模论文', writerContext);

      return {
        coordinator: coordinatorResponse,
        modeler: modelerResponse,
        coder: coderResponse,
        writer: writerResponse,
      };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      throw error;
    }
  }

  async getAgentInfo(agentId: string): Promise<AgentRole | null> {
    return this.agents.get(agentId) || null;
  }

  async getAllAgents(): Promise<AgentRole[]> {
    return Array.from(this.agents.values());
  }

  private calculateConfidence(text: string): number {
    // Simple confidence calculation based on text length and content
    const length = text.length;
    const hasMath = /[+\-*/=<>]/.test(text);
    const hasCode = /```|def |import |class /.test(text);
    const hasStructure = /##|###|1\.|2\.|3\./.test(text);
    
    let confidence = 0.5; // Base confidence
    
    if (length > 100) confidence += 0.1;
    if (length > 500) confidence += 0.1;
    if (hasMath) confidence += 0.1;
    if (hasCode) confidence += 0.1;
    if (hasStructure) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}