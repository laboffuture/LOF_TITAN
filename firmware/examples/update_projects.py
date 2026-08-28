import re

with open('aqua_nova.py', 'r') as f:
    new_code = f.read()

if not new_code.endswith('\n'):
    new_code += '\n'

with open('webapp/src/projects.js', 'r') as f:
    js = f.read()

pattern = re.compile(r"(id:\s*'aquanova',.*?code:\s*\`)(.*?)(^\`\n\s*\})", re.MULTILINE | re.DOTALL)

def replacer(m):
    return m.group(1) + new_code + m.group(3)

js_new = pattern.sub(replacer, js)

with open('webapp/src/projects.js', 'w') as f:
    f.write(js_new)

print("Updated projects.js")
