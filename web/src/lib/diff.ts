// Diff utility functions for code comparison

export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
  lineNumber?: number;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffResult {
  oldCode: string;
  newCode: string;
  fileName: string;
  summary: string;
  lines: DiffLine[];
  additions: number;
  deletions: number;
}

// Simple line-by-line diff implementation
export function generateDiff(oldCode: string, newCode: string, fileName: string): DiffResult {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  
  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  
  let oldIndex = 0;
  let newIndex = 0;
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];
    
    if (oldIndex >= oldLines.length) {
      // Only new lines remain
      lines.push({
        type: 'added',
        content: newLine,
        newLineNumber: newIndex + 1
      });
      additions++;
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Only old lines remain
      lines.push({
        type: 'removed',
        content: oldLine,
        oldLineNumber: oldIndex + 1
      });
      deletions++;
      oldIndex++;
    } else if (oldLine === newLine) {
      // Lines are the same
      lines.push({
        type: 'unchanged',
        content: oldLine,
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1
      });
      oldIndex++;
      newIndex++;
    } else {
      // Lines are different - simple approach: mark as removed and added
      lines.push({
        type: 'removed',
        content: oldLine,
        oldLineNumber: oldIndex + 1
      });
      lines.push({
        type: 'added',
        content: newLine,
        newLineNumber: newIndex + 1
      });
      deletions++;
      additions++;
      oldIndex++;
      newIndex++;
    }
  }
  
  // Generate summary
  const summary = generateSummary(lines, additions, deletions);
  
  return {
    oldCode,
    newCode,
    fileName,
    summary,
    lines,
    additions,
    deletions
  };
}

function generateSummary(lines: DiffLine[], additions: number, deletions: number): string {
  const changedFiles = 1; // Always 1 for single file diff
  
  if (additions === 0 && deletions === 0) {
    return 'No changes detected';
  }
  
  const parts = [];
  if (changedFiles > 0) {
    parts.push(`${changedFiles} file${changedFiles > 1 ? 's' : ''} changed`);
  }
  
  if (additions > 0) {
    parts.push(`${additions} addition${additions > 1 ? 's' : ''}`);
  }
  
  if (deletions > 0) {
    parts.push(`${deletions} deletion${deletions > 1 ? 's' : ''}`);
  }
  
  return parts.join(' • ');
}

// Get line numbers for display
export function getLineNumbers(lines: DiffLine[]): { old: number[], new: number[] } {
  const oldNumbers: number[] = [];
  const newNumbers: number[] = [];
  
  lines.forEach(line => {
    if (line.oldLineNumber) {
      oldNumbers.push(line.oldLineNumber);
    } else {
      oldNumbers.push(-1);
    }
    
    if (line.newLineNumber) {
      newNumbers.push(line.newLineNumber);
    } else {
      newNumbers.push(-1);
    }
  });
  
  return { old: oldNumbers, new: newNumbers };
}