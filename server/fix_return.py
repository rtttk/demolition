#!/usr/bin/env python3
"""
修复 return { ... } 缺少分号的问题
"""
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. 修复 return { ... } 后面跟着 );} 的问题
    # 这种情况：return { ... }\n);  }\n
    # 应该变成：return { ... };\n  }\n

    # 修复 return { ... }\n} 模式
    # 在 return 语句中，} 后面应该是 ;
    content = re.sub(
        r'(return \{[^}]+)\}\s*\n\);(\s*\})',
        r'\1};\n\2',
        content
    )

    # 2. 修复 return { ... \n} 模式
    # 找 return { 后面的内容，确保结尾是 };
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]

        # 检查是否是 return { ... } 块的开始
        if 'return {' in line and not line.strip().endswith('};'):
            # 收集整个 return 块
            brace_count = line.count('{') - line.count('}')
            block_start = i
            block_lines = [line]

            j = i + 1
            while j < len(lines) and brace_count > 0:
                next_line = lines[j]
                block_lines.append(next_line)
                brace_count += next_line.count('{') - next_line.count('}')

                # 检查是否找到 return 块的结束
                if brace_count == 0:
                    # 检查最后一行
                    last_line = block_lines[-1].strip()
                    if last_line == '}' or last_line == '});':
                        # 修复：确保有分号
                        if last_line == '}':
                            block_lines[-1] = block_lines[-1].replace('}', '};')
                    break
                j += 1

            # 合并块
            fixed_lines.extend(block_lines)
            i = j + 1
            continue

        fixed_lines.append(line)
        i += 1

    result = '\n'.join(fixed_lines)

    if result != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(result)
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
