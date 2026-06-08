#!/usr/bin/env python3
"""
修复 sed 破坏的 service 文件
问题模式：
1. }\n);\n} -> }\n}
2. { where: { id } }; -> { where: { id } });
"""
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. 修复 }\n);\n} 模式
    # 匹配 }); 后面直接跟 } 的情况
    content = re.sub(r'}\);\s*\n\}', '}\n}', content)

    # 2. 修复缺少的括号
    # { where: { id } }; -> { where: { id } });
    content = re.sub(r'\{ where: \{ id \} \};', '{ where: { id } });', content)
    content = re.sub(r'\{ where: \{ id: (\w+) \} \};', r'{ where: { id: \1 } });', content)

    # 3. 修复缺少的括号在其他位置
    # { where: { id: xxx } }; -> { where: { id: xxx } });
    content = re.sub(r'\{ where: \{ id: ([^}]+) \} \};', r'{ where: { id: \1 } });', content)

    # 4. 修复 Promise.all 等调用的缺少括号
    # Promise.all([...], (...)); -> Promise.all([...], (...));
    content = re.sub(r'(\]\),)\s*\}', r'\1', content)

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
