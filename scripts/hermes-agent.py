#!/usr/bin/env python3
import os
import subprocess
import sys


def main() -> int:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    hermes = os.path.join(root, ".venv-hermes", "bin", "hermes")
    if not os.path.exists(hermes):
        sys.stderr.write(
            "Hermes not installed. Create .venv-hermes and install vendor/hermes-agent first.\n"
        )
        return 1
    proc = subprocess.run([hermes, *sys.argv[1:]], cwd=root)
    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
