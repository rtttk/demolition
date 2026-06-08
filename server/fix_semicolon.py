#!/usr/bin/env python3
"""
修复 };<newline>}<newline> 这样的模式
应该是 };<newline>
"""
import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    fixed_lines = []
    i = 0
    changes = 0

    while i < len(lines):
        current = lines[i].rstrip('\n\r')

        # 检查当前行是 }; 后面跟着 }
        if current.strip() == '};' and i + 1 < len(lines):
            next_line = lines[i + 1].strip()

            # 如果下一行是 }，说明 }; 是多余的括号结束符
            # 但我们需要检查这是正常的 Promise.all 结束还是方法结束
            # 通常 Promise.all([...]) 结束后是 ; 而不是 };

            # 检查这一行的缩进级别
            indent = len(lines[i]) - len(lines[i].lstrip())

            # 如果缩进 > 0 (在函数内)，且是 }; 结尾，很可能是方法调用的结束
            if indent > 0 and not lines[i].strip().endswith(');'):
                # 这种情况比较复杂，我们需要更好的判断
                pass

        fixed_lines.append(lines[i])
        i += 1

    content = ''.join(fixed_lines)

    # 更简单的方法：直接把 };} 替换为 });}
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 匹配 ); 后面跟着 } 的情况
    import re
    # pattern: });<newline>}
    content = re.sub(r'}\);\s*\n\}', '});\n}', content)
    # pattern: };<newline>}
    content = re.sub(r'\};\s*\n\}', '});\n}', content)

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
