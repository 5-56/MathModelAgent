import { Task } from '../types/Message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class TaskService {
  private storageKey = 'tasks';

  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(this.storageKey);
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson);
        return tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));
      }
      return this.getDefaultTasks();
    } catch (error) {
      console.error('Error loading tasks:', error);
      return this.getDefaultTasks();
    }
  }

  async saveTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = task;
      } else {
        tasks.push(task);
      }
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(filteredTasks));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async retryTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        task.status = 'pending';
        task.progress = 0;
        task.updatedAt = new Date();
        await this.saveTask(task);
      }
    } catch (error) {
      console.error('Error retrying task:', error);
      throw error;
    }
  }

  async createTask(title: string, description: string): Promise<Task> {
    const task: Task = {
      id: `task_${Date.now()}`,
      title,
      description,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveTask(task);
    return task;
  }

  async updateTaskStatus(taskId: string, status: Task['status'], progress?: number): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        task.status = status;
        if (progress !== undefined) {
          task.progress = progress;
        }
        task.updatedAt = new Date();
        await this.saveTask(task);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  private getDefaultTasks(): Task[] {
    return [
      {
        id: 'task_1',
        title: '数学建模示例任务',
        description: '分析销售数据并建立预测模型',
        status: 'completed',
        progress: 100,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
        result: {
          type: 'file',
          content: '建模结果已生成',
          fileName: 'model_result.pdf',
        },
      },
      {
        id: 'task_2',
        title: '数据可视化任务',
        description: '创建交互式图表展示用户行为数据',
        status: 'in_progress',
        progress: 65,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        updatedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      },
      {
        id: 'task_3',
        title: '机器学习分类',
        description: '使用随机森林对客户进行分类',
        status: 'failed',
        progress: 30,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];
  }
}