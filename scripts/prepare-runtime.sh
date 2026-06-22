#!/bin/bash
# prepare-runtime.sh
# Prepare the runtime directory with Node binary and build artifacts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RUNTIME_DIR="$PROJECT_ROOT/runtime"

echo "=== Prepare Runtime ==="

# Check if OpenAlice is built
if [ ! -d "$PROJECT_ROOT/runtime/openalice-dist/dist" ]; then
    echo "OpenAlice not built yet. Running build-openalice.sh..."
    "$SCRIPT_DIR/build-openalice.sh"
fi

# Download Node runtime (for the target architecture)
NODE_ARCH=$(uname -m)
NODE_VERSION="22.14.0"
NODE_DIR="$RUNTIME_DIR/node"

if [ ! -d "$NODE_DIR" ]; then
    echo "Downloading Node.js $NODE_VERSION ($NODE_ARCH)..."
    mkdir -p "$NODE_DIR"
    
    if [ "$NODE_ARCH" = "arm64" ]; then
        NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-arm64.tar.gz"
    elif [ "$NODE_ARCH" = "x86_64" ]; then
        NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-x64.tar.gz"
    else
        echo "ERROR: Unsupported architecture: $NODE_ARCH"
        exit 1
    fi
    
    curl -fsSL "$NODE_URL" -o /tmp/node.tar.gz
    tar -xzf /tmp/node.tar.gz -C /tmp/
    mv /tmp/node-v${NODE_VERSION}-darwin-${NODE_ARCH}/* "$NODE_DIR/"
    rm -rf /tmp/node.tar.gz /tmp/node-v*
    
    echo "Node.js installed: $($NODE_DIR/bin/node --version)"
else
    echo "Node.js runtime already present."
fi

echo "Runtime preparation complete."
