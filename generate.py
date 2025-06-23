#!/usr/bin/env python3
"""
generate.py - Simple text generation script for InvestGPT backend

Usage:
    echo '{"prompt": "Your prompt here"}' | python generate.py

Dependencies:
    pip install transformers torch

- Loads the model once at startup (CPU only)
- Accepts a JSON object with a 'prompt' key via stdin
- Outputs a JSON object with a 'result' key to stdout
"""
import sys
import json
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer

MODEL_NAME = "EleutherAI/gpt-neo-125M"  # or "distilgpt2"

def main():
    try:
        # Load model and tokenizer once
        print("Loading model...", file=sys.stderr)
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
        generator = pipeline("text-generation", model=model, tokenizer=tokenizer, device=-1)
        print("Model loaded.", file=sys.stderr)

        # Read input from stdin
        for line in sys.stdin:
            try:
                data = json.loads(line)
                prompt = data.get("prompt", "").strip()
                if not prompt:
                    print(json.dumps({"error": "Prompt is required."}))
                    continue
                # Generate text
                output = generator(prompt, max_length=128, num_return_sequences=1)
                result = output[0]["generated_text"] if output else ""
                print(json.dumps({"result": result}))
            except Exception as e:
                print(json.dumps({"error": str(e)}))
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model: {e}"}))
        sys.exit(1)

if __name__ == "__main__":
    main() 