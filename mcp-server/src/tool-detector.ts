import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface DetectedTool {
    id: string;
    name: string;
    version: string;
    path: string;
    isInstalled: boolean;
}

export class ToolDetector {
    async detectAll(): Promise<DetectedTool[]> {
        const tools = [
            this.checkClaude(),
            this.checkGemini(),
            this.checkQoder(),
            this.checkKiro(),
            this.checkAider(),
            this.checkCursor()
        ];

        const results = await Promise.all(tools);
        return results.filter(t => t.isInstalled);
    }

    private async checkCommand(command: string): Promise<string | null> {
        try {
            const { stdout } = await execAsync(`${command} --version`);
            return stdout.trim();
        } catch {
            return null;
        }
    }

    private async checkClaude(): Promise<DetectedTool> {
        const version = await this.checkCommand('claude');
        return {
            id: 'claude',
            name: 'Claude Code',
            version: version || '',
            path: '',
            isInstalled: !!version
        };
    }

    private async checkGemini(): Promise<DetectedTool> {
        const version = await this.checkCommand('gemini');
        return {
            id: 'gemini',
            name: 'Gemini CLI',
            version: version || '',
            path: '',
            isInstalled: !!version
        };
    }

    private async checkQoder(): Promise<DetectedTool> {
        const version = await this.checkCommand('qoder');
        return {
            id: 'qoder',
            name: 'Qoder',
            version: version || '',
            path: '',
            isInstalled: !!version
        };
    }

    private async checkKiro(): Promise<DetectedTool> {
        const version = await this.checkCommand('kiro');
        return {
            id: 'kiro',
            name: 'Kiro',
            version: version || '',
            path: '',
            isInstalled: !!version
        };
    }

    private async checkAider(): Promise<DetectedTool> {
        const version = await this.checkCommand('aider');
        return {
            id: 'aider',
            name: 'Aider',
            version: version || '',
            path: '',
            isInstalled: !!version
        };
    }

    private async checkCursor(): Promise<DetectedTool> {
        // Cursor is an app, not typically a CLI command for version checking in the same way
        // We check for config file existence as a proxy for "installed/configured"
        const configPath = path.join(os.homedir(), '.cursor', 'mcp.json');
        const isInstalled = fs.existsSync(configPath);

        return {
            id: 'mcp', // Maps to 'mcp' in ToolSelector
            name: 'Cursor',
            version: 'App',
            path: configPath,
            isInstalled
        };
    }
}
