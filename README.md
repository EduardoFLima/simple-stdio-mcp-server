# Simple stdio MCP server

## Table of contents

- [About this project](#about-this-project)
- [Prerequisites](#prerequisites)
- [Run the project with npm](#run-the-project-with-npm)
- [Test the project with npm](#test-the-project-with-npm)
- [Docker Compose](#docker-compose)
- [SOPS reference](#sops-reference)

## About this project

This repository is a small local **MCP server** (stdio transport) used for learning and testing.
It exposes a `sops_decrypt` tool that decrypts a SOPS-encrypted file and writes the plaintext output to disk.

## Prerequisites

- Node.js + npm
- SOPS CLI installed and available in your `PATH` (needed for real decrypt operations)

## Run the project with npm

1. Install dependencies:
   - `npm install`
2. Start the server:
   - `npm start`
3. Optional: open MCP inspector:
   - `npm run mcp:inspect`

## Test the project with npm

- Run tests:
  - `npm test`


## SOPS reference

[SOPS](https://github.com/getsops/sops) (Secrets OPerationS) is a tool for encrypting and decrypting structured config/secrets files (for example YAML, JSON, and `.env` files).
