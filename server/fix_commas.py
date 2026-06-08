#!/usr/bin/env python3
"""
批量修复逗号问题
原始问题：sed 把对象属性后的逗号 , 替换成了分号 ;
"""
import os
import re

def fix_commas(content):
    # 修复 interface/type 定义内的属性
    # 模式: 属性: 类型; -> 属性: 类型,
    lines = content.split('\n')
    fixed = []
    in_interface = False
    brace_count = 0

    for i, line in enumerate(lines):
        stripped = line.strip()

        # 检测 interface/type 开始
        if re.match(r'(interface|type)\s+\w+', stripped):
            in_interface = True
            brace_count = 0

        # 检测 interface/type 结束（通过缩进或空行等）
        if in_interface and stripped == '}' and brace_count == 0:
            in_interface = False

        # 修复 interface/type 内的属性定义
        # 属性: 类型; -> 属性: 类型,
        if in_interface:
            # 检查是否是属性定义行
            if ':' in line and '=>' not in line and '<' not in line:
                # 如果行末是 ; 但不是 ( 或 {
                if line.rstrip().endswith(';'):
                    # 替换末尾的 ; 为 ,
                    line = line.rstrip()[:-1] + ','

        fixed.append(line)

    return '\n'.join(fixed)

# 应用到所有 service 文件
base_dir = '/sessions/6a26376bcd58eebbbd633da6/workspace/server/src/modules'

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.service.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            fixed = fix_commas(content)

            if fixed != content:
                with open(filepath, 'w') as f:
                    f.write(fixed)
                print(f"Fixed: {filepath}")

print("Done")
