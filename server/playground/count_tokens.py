#!/usr/bin/env python3
"""
count_gemini_tokens.py

Script to count tokens for Gemini using tiktoken.
Input: path to a text file.
"""
import sys
import os
import tiktoken


def count_tokens_in_file(file_path: str, encoding_name: str = "cl100k_base") -> int:
    """
    Reads the file at file_path and returns the number of tokens
    according to the specified encoding.
    """
    # Verify file exists
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # Load the encoding
    try:
        enc = tiktoken.get_encoding(encoding_name)
    except Exception:
        # Fallback to cl100k_base
        enc = tiktoken.get_encoding("cl100k_base")
        print(
            f"Warning: Could not load encoding '{encoding_name}', using 'cl100k_base' instead."
        )

    # Read file content
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Encode and count tokens
    tokens = enc.encode(content)
    return len(tokens)


def main():
    file_path = r"E:\SIU\DACS\token_count.txt"
    num_tokens = count_tokens_in_file(file_path)
    print(f"Token count: {num_tokens}")


if __name__ == "__main__":
    main()
