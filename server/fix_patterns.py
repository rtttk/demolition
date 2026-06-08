#!/usr/bin/env python3
"""
修复 service 文件中的多种语法问题
"""
import os
import re

def fix_service_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. 修复 item=> item), -> item => item),
    content = re.sub(r'\(item=> item\),', '(item) => item),', content)
    content = re.sub(r'\(item=> item\);', '(item) => item);', content)
    content = re.sub(r'item=> item\)\)', 'item => item))', content)

    # 2. 修复 }; 在 return { 后面
    # return { list: ..., }; -> return { list: ..., };
    content = re.sub(r'return \{\s*([^}]+)\}\s*;(\s*\n)', r'return {\1}\2);', content)

    # 3. 修复 fetch(..., { ... },; -> fetch(..., { ... });
    content = re.sub(r'(\{[^{}]*\}),(\s*\n\s*\);)', r'\1\2', content)

    # 4. 修复 { xxx }); -> { xxx };
    content = re.sub(r'\{([^}]+)\}\),(\s*\);)', r'{\1}\2', content)

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
            if fix_service_file(filepath):
                print(f"Fixed: {filepath}")
                count += 1

print(f"\nTotal files fixed: {count}")
