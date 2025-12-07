import { spawn, ChildProcess } from 'child_process';
import { platform } from 'os';

export interface CLIResult {
    output: string;
    exitCode: number | null;
}

export class CLIAdapter {
    private process: ChildProcess | null = null;
    private onOutputCallback?: (data: string) => void;

    constructor() { }

    execute(command: string, args: string[] = [], cwd: string = process.cwd()): void {
        const isWindows = platform() === 'win32';
        const shell = isWindows ? 'powershell.exe' : '/bin/bash';
        const shellArgs = isWindows ? ['-c', `${command} ${args.join(' ')}`] : ['-c', `${command} ${args.join(' ')}`];

        console.log(`[CLI] Executing: ${command} ${args.join(' ')}`);

        try {
            this.process = spawn(shell, shellArgs, {
                cwd,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: process.env
            });

            this.process.stdout?.on('data', (data) => {
                const output = data.toString();
                if (this.onOutputCallback) {
                    this.onOutputCallback(output);
                }
            });

            this.process.stderr?.on('data', (data) => {
                const output = data.toString();
                if (this.onOutputCallback) {
                    this.onOutputCallback(output);
                }
            });

            this.process.on('error', (error) => {
                if (this.onOutputCallback) {
                    this.onOutputCallback(`Error: ${error.message}\n`);
                }
            });

            this.process.on('close', (code) => {
                if (this.onOutputCallback) {
                    this.onOutputCallback(`\n[Process exited with code ${code}]`);
                }
                this.process = null;
            });

        } catch (error: any) {
            if (this.onOutputCallback) {
                this.onOutputCallback(`Failed to start process: ${error.message}\n`);
            }
        }
    }

    onOutput(callback: (data: string) => void): void {
        this.onOutputCallback = callback;
    }

    kill(): void {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
}
