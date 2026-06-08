#!/usr/bin/env python3
"""
全面修复被 sed 破坏的 TypeScript 文件
问题：
1. interface/type 内属性后的逗号被替换成了分号
2. 对象字面量内缺少逗号
3. 缺少必要的逗号
"""
import os
import re

def fix_typescript_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. 修复 interface/type 内的属性定义
    # 匹配模式: "属性名: 类型," 被错误替换成了 "属性名: 类型;"
    # 但要排除函数返回类型、方法参数等

    lines = content.split('\n')
    fixed_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        original_line = line

        # 跳过注释行
        if line.strip().startswith('//') or line.strip().startswith('/*') or line.strip().startswith('*'):
            fixed_lines.append(line)
            i += 1
            continue

        # 跳过空行
        if not line.strip():
            fixed_lines.append(line)
            i += 1
            continue

        # 检查是否是属性定义行（包含 : 类型）
        # 但排除函数定义、方法调用、return 语句等

        stripped = line.strip()

        # 修复模式1: 属性: 类型; -> 属性: 类型,
        # 在 interface/type 内
        if ':' in line and '=>' not in line and '::' not in line:
            # 检查是否在 interface/type 块内
            # 通过检查前后文来判断

            # 排除函数参数
            if '(' in line and ')' in line and ('=>' in line or 'function' in line):
                fixed_lines.append(line)
                i += 1
                continue

            # 排除 return 语句
            if stripped.startswith('return'):
                fixed_lines.append(line)
                i += 1
                continue

            # 排除 throw 语句
            if stripped.startswith('throw'):
                fixed_lines.append(line)
                i += 1
                continue

            # 排除 import/export
            if stripped.startswith('import') or stripped.startswith('export'):
                fixed_lines.append(line)
                i += 1
                continue

            # 排除 await 语句
            if 'await' in line:
                fixed_lines.append(line)
                i += 1
                continue

            # 修复: 属性: 类型; -> 属性: 类型,
            # 但只在 interface/type 块内
            if line.rstrip().endswith(';') and not line.rstrip().endswith('();'):
                # 检查这行是否是属性定义
                # 简单判断：如果有 : 但没有 ( 或 => 或 { 
                if ':' in line and '(' not in line and '=>' not in line and '{' not in line and '}' not in line:
                    # 检查缩进级别（interface/type 内的属性通常有缩进）
                    indent = len(line) - len(line.lstrip())
                    if indent > 0:
                        line = re.sub(r'(\w+)\s*:\s*([^;{]+);(\s*(?:,?\s*\n|\s*$))', r'\1: \2,\3', line)

        # 2. 修复 fetch 调用等缺少的逗号
        # 在方法调用参数列表中

        fixed_lines.append(line)
        i += 1

    content = '\n'.join(fixed_lines)

    # 3. 修复对象字面量中缺少逗号的情况
    # 模式: 属性: 值\n 下一行开始新属性
    lines = content.split('\n')
    fixed_lines = []
    for i, line in enumerate(lines):
        # 检查是否是对象属性结束（以 , 或 { 或 } 结尾）
        stripped = line.strip()

        # 跳过特定模式
        if stripped.startswith('//') or stripped.startswith('return') or stripped.startswith('throw'):
            fixed_lines.append(line)
            continue

        # 如果当前行是属性定义，以分号结尾，下一行是另一个属性
        if i + 1 < len(lines):
            next_stripped = lines[i + 1].strip()
            if (':' in line and
                not line.rstrip().endswith(',') and
                not line.rstrip().endswith('{') and
                not line.rstrip().endswith('(') and
                not line.rstrip().endswith('=>') and
                next_stripped and
                not next_stripped.startswith('}') and
                not next_stripped.startswith('//') and
                not next_stripped.startswith('*') and
                ':' in lines[i + 1]):
                line = line.rstrip()
                if line.endswith(';'):
                    line = line[:-1] + ','
                elif not line.endswith(','):
                    line = line + ','

        fixed_lines.append(line)

    content = '\n'.join(fixed_lines)

    # 4. 修复特定模式: }); -> });
    # 在方法调用结束

    # 修复 import 语句
    content = re.sub(r'from ([^;]+);', r'from \1;', content)

    # 修复 @Inject 等装饰器参数
    content = re.sub(r'@Inject\(([^)]+)\)(;)', r'@Inject(\1)\2', content)

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
            if fix_typescript_file(filepath):
                print(f"Fixed: {filepath}")
                count += 1

print(f"\nTotal files fixed: {count}")
