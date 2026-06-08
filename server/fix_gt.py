#!/usr/bin/env python3
"""
修复 }> = 缺少换行符的问题
"""
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 修复 }> = 模式（缺少换行）
    content = re.sub(r'\}\s*>\s*=', '}>\n=', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# 处理所有 service 文件
base_dir = '/sessions/6a26376bcd58eebbbd633da6/workspace/server/src/modules'
count = 0
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.service.ts'):
            filepath = os.path.join(root, file)
            if fix_file(filepath):
                print(f"Fixed: {filepath}")
                count += 1

print(f"\nTotal files fixed: {count}")
