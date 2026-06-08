#!/usr/bin/env python3
import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    fixed_lines = []
    changes = 0

    for i, line in enumerate(lines):
        stripped = line.strip()
        # 修复单独一行的 }; -> });
        if stripped == '};':
            # 检查是否是真正需要修复的情况（前后文判断）
            prev_line = lines[i-1].strip() if i > 0 else ''
            next_line = lines[i+1].strip() if i < len(lines)-1 else ''

            # 如果前一行是 } 开头的内容，很可能是函数/对象结尾
            if prev_line.endswith('{') or prev_line.endswith('({') or '{' in prev_line:
                fixed_lines.append('\t};')
                changes += 1
            else:
                fixed_lines.append(line)
        else:
            fixed_lines.append(line)

    if changes > 0:
        with open(filepath, 'w') as f:
            f.write('\n'.join(fixed_lines))
        print(f"Fixed {changes} issues in {filepath}")

# 处理所有 service 文件
base_dir = '/sessions/6a26376bcd58eebbbd633da6/workspace/server/src/modules'
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.service.ts'):
            fix_file(os.path.join(root, file))
