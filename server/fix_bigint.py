#!/usr/bin/env python3
"""
修复 service 文件中的 BigInt 问题
1. BigInt() -> String()
2. 删除 toNum 函数定义
3. toNum(xxx) -> xxx（去掉函数调用）
"""
import os
import re

def process_service_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. BigInt() -> String()
    content = re.sub(r'BigInt\(', 'String(', content)

    # 2. 删除 toNum 函数定义（从 /** BigInt 转 number */ 到函数结束的 }）
    # 匹配模式：
    # /** BigInt 转 number */
    # function toNum(val: any): any {
    #   ...函数体
    # }
    pattern = r'/\*\* BigInt 转 number \*/\s*function toNum\(val: any\): any \{[^}]*(?:\{[^}]*\}[^}]*)*\}\n'
    content = re.sub(pattern, '', content)

    # 3. 修复 toNum(xxx) 为 xxx
    # 注意：toNum(item)) 这种是因为原本代码有嵌套括号，我们需要保留一层括号
    # 原始模式：toNum(item)) -> item)
    # 原始模式：toNum(transformedList.map(...)) -> transformedList.map(...)
    content = re.sub(r'toNum\(([^)]+)\)\)', r'\1)', content)

    # 4. 修复单独的 toNum(xxx) 结尾（如果没有多余的括号）
    # 例如：return toNum(xxx); -> return xxx;
    content = re.sub(r'return toNum\(([^)]+)\);', r'return \1;', content)

    # 5. 删除不再需要的 import { throwError } 如果不再使用（可选）

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
            if process_service_file(filepath):
                print(f"Fixed: {filepath}")
                count += 1

print(f"\nTotal files fixed: {count}")
