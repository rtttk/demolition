#!/usr/bin/env python3
"""
逐行修复 service 文件中的括号问题
"""
import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    fixed_lines = []
    changes = 0

    for i, line in enumerate(lines):
        original_line = line
        stripped = line.strip()

        # 情况1: }; 单独一行，后面跟着 }
        if stripped == '};' and i + 1 < len(lines):
            next_stripped = lines[i + 1].strip()
            if next_stripped == '}':
                # 这是错误的，应该删除 );
                line = line.replace('};', '}')
                changes += 1

        # 情况2: 行末是 }; 而不是 });
        elif stripped.endswith('};') and not stripped.endswith('});'):
            # 检查是否在函数/方法调用中
            if not any(x in stripped for x in ['async', 'const', 'let', 'var', 'return']):
                line = line.replace('};', '}')
                changes += 1

        # 情况3: { where: { id } }; 缺少 )
        if '{ where: { id' in line and '};' in line and '});' not in line:
            line = line.replace('};', '});')
            changes += 1

        # 情况4: Promise.all 结束缺少 )
        # 检查当前行是否是方法调用的结束
        if '],' in line and '})' in line and '});' not in line:
            line = line.replace('})', '});')
            changes += 1

        fixed_lines.append(line)

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(fixed_lines)
        return changes
    return 0

# 处理所有 service 文件
base_dir = '/sessions/6a26376bcd58eebbbd633da6/workspace/server/src/modules'
total = 0
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.service.ts'):
            filepath = os.path.join(root, file)
            changes = fix_file(filepath)
            if changes > 0:
                print(f"{filepath}: {changes} fixes")
                total += changes

print(f"\nTotal: {total} changes")
