#!/usr/bin/env python3
"""
修复被 sed 破坏的 service 文件
问题：sed 把 }); 替换成了 };
"""
import os
import re

def fix_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    fixed_lines = []
    changes = 0

    for i, line in enumerate(lines):
        stripped = line.strip()

        # 只修复单独一行的 };
        if stripped == '};':
            # 检查缩进级别来判断是否需要修复
            indent = len(line) - len(line.lstrip())

            # 获取前后行的上下文
            prev_stripped = lines[i-1].strip() if i > 0 else ''
            next_stripped = lines[i+1].strip() if i < len(lines)-1 else ''

            # 如果前一行是 { 开头的内容，很可能是函数/方法/对象结尾
            # 例如：async create() { 或 select: {
            # 这种情况下 }; 需要改回 });
            if any(prev_stripped.endswith(x) for x in ['{', '({', '})', '},']) or '{' in prev_stripped:
                fixed_lines.append('\t' * (indent // 4) + '});\n')
                changes += 1
                continue

        fixed_lines.append(line)

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(fixed_lines)
        return changes
    return 0

# 处理所有 service 文件
base_dir = '/sessions/6a26376bcd58eebbbd633da6/workspace/server/src/modules'
total_changes = 0
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.service.ts'):
            filepath = os.path.join(root, file)
            changes = fix_braces(filepath)
            if changes > 0:
                print(f"Fixed {changes} issues in {filepath}")
                total_changes += changes

print(f"\nTotal changes: {total_changes}")
