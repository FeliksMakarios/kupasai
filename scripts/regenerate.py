"""Reproduce every generated dataset from the repository root."""
from pathlib import Path
import os
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1]
env=dict(os.environ, OMP_NUM_THREADS="2", OPENBLAS_NUM_THREADS="2")
paths=sorted(p for course in ["ml","nlp","kecerdasan-komputasional"] for p in (ROOT/course).glob("*/generate*.py"))
paths += [ROOT/"scripts/generate_advanced.py",ROOT/"scripts/build_lessons.py"]
for path in paths:
    print(f"Rebuilding {path.relative_to(ROOT)}",flush=True)
    subprocess.run([sys.executable,str(path)],cwd=path.parent,env=env,check=True)
print(f"Completed {len(paths)} scripts")
