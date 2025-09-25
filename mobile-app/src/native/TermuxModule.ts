import { NativeModules, Platform } from 'react-native';

interface TermuxModuleInterface {
  executeCommand(command: string): Promise<string>;
  isTermuxInstalled(): Promise<boolean>;
  installTermux(): Promise<boolean>;
  getPythonVersion(): Promise<string>;
  getInstalledPackages(): Promise<string[]>;
  installPackage(packageName: string): Promise<boolean>;
  createWorkDirectory(path: string): Promise<boolean>;
  runPythonScript(scriptPath: string): Promise<string>;
  startJupyterNotebook(port: number): Promise<string>;
  stopJupyterNotebook(): Promise<boolean>;
}

const { TermuxModule } = NativeModules;

export default TermuxModule as TermuxModuleInterface;

// Fallback implementation for development/testing
export class MockTermuxModule implements TermuxModuleInterface {
  async executeCommand(command: string): Promise<string> {
    console.log(`Mock Termux: Executing command: ${command}`);
    
    // Simulate command execution
    if (command.includes('python3 --version')) {
      return 'Python 3.12.0';
    }
    
    if (command.includes('pip list')) {
      return `Package    Version
---------- -------
numpy      1.24.3
pandas     2.0.3
matplotlib 3.7.1
scipy      1.10.1
jupyter    1.0.0
requests   2.31.0`;
    }
    
    if (command.includes('jupyter notebook')) {
      return `[I 10:30:00.000 NotebookApp] Serving notebooks from local directory: /data/data/com.termux/files/home
[I 10:30:00.000 NotebookApp] Jupyter Notebook 6.5.4 is running at:
[I 10:30:00.000 NotebookApp] http://localhost:8888/?token=abc123def456
[I 10:30:00.000 NotebookApp] Use Control-C to stop this server`;
    }
    
    return `Command executed: ${command}`;
  }

  async isTermuxInstalled(): Promise<boolean> {
    return Platform.OS === 'android';
  }

  async installTermux(): Promise<boolean> {
    console.log('Mock Termux: Installing Termux...');
    return true;
  }

  async getPythonVersion(): Promise<string> {
    return 'Python 3.12.0';
  }

  async getInstalledPackages(): Promise<string[]> {
    return ['numpy', 'pandas', 'matplotlib', 'scipy', 'jupyter', 'requests'];
  }

  async installPackage(packageName: string): Promise<boolean> {
    console.log(`Mock Termux: Installing package: ${packageName}`);
    return true;
  }

  async createWorkDirectory(path: string): Promise<boolean> {
    console.log(`Mock Termux: Creating directory: ${path}`);
    return true;
  }

  async runPythonScript(scriptPath: string): Promise<string> {
    console.log(`Mock Termux: Running Python script: ${scriptPath}`);
    return 'Script executed successfully';
  }

  async startJupyterNotebook(port: number): Promise<string> {
    console.log(`Mock Termux: Starting Jupyter notebook on port ${port}`);
    return `http://localhost:${port}/?token=abc123def456`;
  }

  async stopJupyterNotebook(): Promise<boolean> {
    console.log('Mock Termux: Stopping Jupyter notebook');
    return true;
  }
}

// Export the appropriate module based on platform
export const TermuxService = Platform.OS === 'android' && TermuxModule 
  ? TermuxModule 
  : new MockTermuxModule();