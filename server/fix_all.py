#!/usr/bin/env python3
"""
安全修复 service 文件
1. 修复多余的逗号（interface 属性、变量声明等）
2. BigInt() -> String()
3. 删除 toNum() 函数和调用
"""
import os
import re

def fix_service_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. 修复多余的逗号（interface/type 内属性后的逗号）
    # 匹配：: type;, -> : type;
    content = re.sub(r'([A-Za-z_][A-Za-z0-9_]*):\s*([^;{}\[\](),]+),', r'\1: \2;', content)
    # 匹配：: type, -> : type;  (当没有分号时)
    content = re.sub(r'([A-Za-z_][A-Za-z0-9_]*):\s*([^;{}\[\](),\s]+),(\s*\n)', r'\1: \2;\3', content)

    # 2. 修复 let/const/var 声明后的多余逗号
    # let xxx: Type;, -> let xxx: Type;
    content = re.sub(r'(let|const|var)\s+[A-Za-z_][A-Za-z0-9_]*\s*:\s*[^;,]+,', r'', content)

    # 3. BigInt() -> String()
    content = re.sub(r'BigInt\(', 'String(', content)

    # 4. 删除 toNum 函数定义
    content = re.sub(
        r'/\*\* BigInt 转 number \*/\s*function toNum\(val: any\): any \{[^}]*(?:\{[^}]*\}[^}]*)*\}\n',
        '',
        content
    )

    # 5. 修复 toNum(xxx) -> xxx
    content = re.sub(r'toNum\(([^)]+)\)\)', r'\1)', content)
    content = re.sub(r'return toNum\(([^)]+)\);', r'return \1;', content)

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
