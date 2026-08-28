import json
import re

with open('C:/Users/TRG-LOF-112-106/Downloads/micro python/micro python/ESP32S3_3UV_Rover_MicroPython.py', 'r', encoding='utf-8') as f:
    python_code = f.read()

with open('src/projects.js', 'r', encoding='utf-8') as f:
    projects_js = f.read()

python_code = python_code.replace('`', '\\`')

new_invisible_line = '''{
    id: 'invisible-line',
    name: 'Invisible Line Patrol Rover',
    description: 'Detect a UV light signal and follow it autonomously.',
    lesson: {
      title: 'Mission: Invisible Line Patrol',
      intro: 'In the Invisible Line Patrol Rover, you will upgrade your walking rover so it can detect a UV light signal and follow it autonomously.\\nBy the end of this mission, your rover will:',
      bullets: [
        'Read UV intensity using two UV sensors',
        'Compare left vs right signal strength',
        'Move forward when the signal is centred',
        'Turn toward the stronger signal',
        'Enter search mode when no UV is detected'
      ],
      conclusion: 'This mission shows how robots sense, decide, and correct their movement in real time.',
      images: [
        '/assets/invisible-line/image (12).png',
        '/assets/invisible-line/image (13).png',
        '/assets/invisible-line/image (14).png'
      ]
    },
    code: `''' + python_code + '''`
  }'''

projects_js = re.sub(r'\{\s*id:\s*\'invisible-line\'[\s\S]*?\}(?=\s*,\s*\{|\s*\])', new_invisible_line, projects_js)

with open('src/projects.js', 'w', encoding='utf-8') as f:
    f.write(projects_js)

print('projects.js updated successfully!')
