import os
import re
import json

root = os.getcwd()
route_dir = os.path.join(root, 'src', 'routes')
ctrl_dir = os.path.join(root, 'src', 'controllers')
controllers = {}

for fname in os.listdir(ctrl_dir):
    if not fname.endswith('.js'):
        continue
    with open(os.path.join(ctrl_dir, fname), 'r', encoding='utf-8') as f:
        text = f.read()

    m = re.search(r'module\.exports\s*=\s*\{([\s\S]*?)\};', text)
    if not m:
        continue

    block = m.group(1)
    keys = re.findall(r"([A-Za-z_][A-Za-z0-9_]*)\s*(?=\s*[:\},]|$)", block)

    controllers[os.path.splitext(fname)[0]] = set(keys)

missing = []
for fname in os.listdir(route_dir):
    if not fname.endswith('.js'):
        continue
    with open(os.path.join(route_dir, fname), 'r', encoding='utf-8') as f:
        content = f.read()

    imports = re.findall(r"const\s+(\w+)\s*=\s*require(?:Controller)?\(\s*['\"]\.\.\/controllers\/(\w+)['\"]\s*\)", content)
    destructured = re.findall(r"const\s*\{\s*([^\}]+)\s*\}\s*=\s*require(?:Controller)?\(\s*['\"]\.\.\/controllers\/(\w+)['\"]\s*\)", content)

    for destruct_names, ctrlName in destructured:
        named_props = [name.strip() for name in destruct_names.split(',') if name.strip()]
        exports = controllers.get(ctrlName, set())
        for prop in named_props:
            if prop not in exports:
                missing.append({'route': fname, 'controller': ctrlName, 'prop': prop})

    handlers = re.findall(r"\b(\w+)\.(\w+)\b", content)
    handlers = [h for h in handlers if h[0] not in {'express', 'router', 'sanitize', 'schemas', 'module', 'requireController', 'require'}]
    for obj, prop in handlers:
        if any(obj == imp[0] for imp in imports):
            ctrlName = next(imp[1] for imp in imports if imp[0] == obj)
            exports = controllers.get(ctrlName, set())
            if prop not in exports:
                missing.append({'route': fname, 'controller': ctrlName, 'prop': prop})

print(json.dumps({'missing': missing}, indent=2))
