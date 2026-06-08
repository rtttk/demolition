#!/usr/bin/env python3
"""
从 git 恢复原始文件（如果可用），否则需要用户手动提供
"""
import os
import subprocess

# 这个脚本假设 workspace 中的文件已被之前的错误修改破坏
# 需要用户从 git 或备份恢复原始文件

# 检查是否有 git 仓库
workspace_dir = '/sessions/6a26376bcd58eebbbd633da6/workspace/server/src/modules'
result = subprocess.run(['git', 'status'], cwd=workspace_dir, capture_output=True, text=True)

if 'not a git repository' not in result.stderr.lower():
    print("Found git repository, attempting to restore...")
    subprocess.run(['git', 'checkout', '--', '.'], cwd=workspace_dir)
    print("Files restored from git")
else:
    print("No git repository found")
    print("Please manually restore the original files from:")
    print("  /Users/yournyk/work/workspaces/chaichu/server/src/modules/")
