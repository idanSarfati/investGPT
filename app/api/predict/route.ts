import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

// Helper to call the Python script and get the result
async function callPythonGenerate(prompt: string): Promise<{ result?: string; error?: string }> {
  return new Promise((resolve) => {
    try {
      const py = spawn('python', ['generate.py']);
      let output = '';
      let errorOutput = '';

      py.stdout.on('data', (data) => {
        output += data.toString();
      });
      py.stderr.on('data', (data) => {
        // Optionally log stderr for debugging
        errorOutput += data.toString();
      });
      py.on('close', () => {
        try {
          // The Python script may output multiple lines; parse the last valid JSON
          const lines = output.trim().split(/\r?\n/);
          for (let i = lines.length - 1; i >= 0; i--) {
            try {
              const parsed = JSON.parse(lines[i]);
              resolve(parsed);
              return;
            } catch {}
          }
          resolve({ error: 'No valid JSON output from Python script.' });
        } catch (e: any) {
          resolve({ error: e.message || 'Failed to parse Python output.' });
        }
      });
      py.on('error', (err) => {
        resolve({ error: err.message });
      });
      // Send prompt as JSON to Python script via stdin
      py.stdin.write(JSON.stringify({ prompt }) + '\n');
      py.stdin.end();
    } catch (e: any) {
      resolve({ error: e.message });
    }
  });
}

// POST /api/predict
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }
    const result = await callPythonGenerate(prompt);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ result: result.result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * This API route proxies prompt requests to a local Python script (generate.py).
 * The Python script loads a Hugging Face model on CPU and generates text.
 *
 * To install dependencies for the Python script:
 *   pip install transformers torch
 *
 * To run the API, ensure generate.py is in the project root and accessible.
 * The API will call the script for each request and return the generated text.
 */
