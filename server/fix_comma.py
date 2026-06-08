#!/usr/bin/env python3
"""
修复 }, -> }; 错误
"""
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 修复函数调用结束的 }, -> },
    # 匹配模式：多个属性后跟 }, 缺少一个逗号
    # 例如：
    #   body: JSON.stringify(body),
    # };
    # 应该变成：
    #   body: JSON.stringify(body),
    # };

    # 首先，修复 return 语句外的正常对象结束
    # 这些行之前可能是 }, 因为 toNum 包装变成的

    lines = content.split('\n')
    fixed_lines = []
    i = 0
    changes = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # 检查是否是缺少逗号的对象属性结束
        # 模式：...: value\n}; 应该是 ...: value,\n};
        if stripped == '};' or stripped == '};':
            # 检查前后文
            if i > 0:
                prev_line = lines[i-1].strip()
                # 如果前一行是属性定义（包含 : 但不是 -> 或 ::）
                if ':' in prev_line and '=>' not in prev_line and '::' not in prev_line and not prev_line.endswith(','):
                    # 这是缺少逗号的情况
                    # 但我们需要检查是否是方法调用结束
                    # 实际上这种情况很少见，我们需要更精确的判断
                    pass

        fixed_lines.append(line)
        i += 1

    # 更简单的方法：直接查找行末是 }; 但实际应该是 }, 的情况
    content = original

    # 修复类似 "    body: JSON.stringify(body)," 后跟 "    };" 的模式
    # 这是 fetch 调用的配置对象结束
    content = re.sub(r'([A-Za-z_][A-Za-z0-9_]*): ([^{}]+),\s*\n\s*\};', r'\1: \2,\n    },', content)

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
