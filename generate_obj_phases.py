# generate_obj_phases.py

import os
import math

# Create output in current folder (not Desktop)
output_dir = os.path.join(os.getcwd(), "stonehenge_phases_obj")
os.makedirs(output_dir, exist_ok=True)

def write_obj(filepath, vertices, faces, name, description):
    with open(filepath, 'w') as f:
        f.write(f"# Stonehenge - {name}\n")
        f.write(f"# {description}\n\n")
        
        for v in vertices:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        
        f.write("\n")
        for face in faces:
            f.write(f"f {face[0]+1} {face[1]+1} {face[2]+1} {face[3]+1}\n")
    
    size = os.path.getsize(filepath) / 1024
    print(f"   Created: {os.path.basename(filepath)} ({size:.1f} KB)")

def create_stone(x, z, w, h, d):
    h2 = h / 2
    w2 = w / 2
    d2 = d / 2
    y_base = -0.5
    
    verts = [
        [x - w2, y_base, z - d2],
        [x + w2, y_base, z - d2],
        [x + w2, y_base, z + d2],
        [x - w2, y_base, z + d2],
        [x - w2, y_base + h, z - d2],
        [x + w2, y_base + h, z - d2],
        [x + w2, y_base + h, z + d2],
        [x - w2, y_base + h, z + d2],
    ]
    
    faces = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 1, 5, 4],
        [1, 2, 6, 5],
        [2, 3, 7, 6],
        [3, 0, 4, 7],
    ]
    
    return verts, faces

def generate_phase(phase_num, name, show_bluestones, show_sarsen, show_fallen, description):
    all_verts = []
    all_faces = []
    vertex_offset = 0
    
    # Ground
    ground_verts = [
        [-25, -0.6, -25],
        [25, -0.6, -25],
        [25, -0.6, 25],
        [-25, -0.6, 25],
    ]
    ground_faces = [[0, 1, 2, 3]]
    
    all_verts.extend(ground_verts)
    for f in ground_faces:
        all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
    vertex_offset += len(ground_verts)
    
    # Ditch ring
    for i in range(36):
        angle1 = 2 * math.pi * i / 36
        angle2 = 2 * math.pi * (i + 1) / 36
        r_inner = 11
        r_outer = 13
        
        x1i = math.cos(angle1) * r_inner
        z1i = math.sin(angle1) * r_inner
        x1o = math.cos(angle1) * r_outer
        z1o = math.sin(angle1) * r_outer
        x2i = math.cos(angle2) * r_inner
        z2i = math.sin(angle2) * r_inner
        x2o = math.cos(angle2) * r_outer
        z2o = math.sin(angle2) * r_outer
        
        verts = [
            [x1i, -0.55, z1i], [x1o, -0.55, z1o],
            [x2o, -0.55, z2o], [x2i, -0.55, z2i],
            [x1i, -0.35, z1i], [x1o, -0.35, z1o],
            [x2o, -0.35, z2o], [x2i, -0.35, z2i],
        ]
        faces = [
            [0,1,2,3], [4,5,6,7],
            [0,1,5,4], [1,2,6,5],
            [2,3,7,6], [3,0,4,7],
        ]
        
        all_verts.extend(verts)
        for f in faces:
            all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
        vertex_offset += len(verts)
    
    # Bluestones
    if show_bluestones:
        for i in range(28):
            angle = 2 * math.pi * i / 28
            r = 6.8
            x = math.cos(angle) * r
            z = math.sin(angle) * r
            verts, faces = create_stone(x, z, 0.65, 2.0, 0.65)
            all_verts.extend(verts)
            for f in faces:
                all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
            vertex_offset += len(verts)
    
    # Sarsen circle
    if show_sarsen:
        for i in range(30):
            angle = 2 * math.pi * i / 30
            r = 9.8
            x = math.cos(angle) * r
            z = math.sin(angle) * r
            verts, faces = create_stone(x, z, 1.15, 3.8, 0.95)
            all_verts.extend(verts)
            for f in faces:
                all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
            vertex_offset += len(verts)
        
        # Trilithons
        for ang in [0, 45, 90, 135, 180]:
            rad = ang * math.pi / 180
            r = 6.2
            x = math.cos(rad) * r
            z = math.sin(rad) * r
            
            verts, faces = create_stone(x - 1.4, z, 0.85, 5.0, 1.05)
            all_verts.extend(verts)
            for f in faces:
                all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
            vertex_offset += len(verts)
            
            verts, faces = create_stone(x + 1.4, z, 0.85, 5.0, 1.05)
            all_verts.extend(verts)
            for f in faces:
                all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
            vertex_offset += len(verts)
            
            verts, faces = create_stone(x, z, 2.8, 0.55, 1.35)
            for v in verts:
                v[1] += 4.6
            all_verts.extend(verts)
            for f in faces:
                all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
            vertex_offset += len(verts)
    
    # Fallen stones
    if show_fallen:
        fallen_verts = [
            [1.8, -0.2, 2.5], [3.2, -0.2, 2.8], [3.0, -0.2, 3.6], [1.6, -0.2, 3.3],
            [1.8, 0.2, 2.5], [3.2, 0.2, 2.8], [3.0, 0.2, 3.6], [1.6, 0.2, 3.3],
        ]
        fallen_faces = [
            [0,1,2,3], [4,5,6,7],
            [0,1,5,4], [1,2,6,5],
            [2,3,7,6], [3,0,4,7],
        ]
        all_verts.extend(fallen_verts)
        for f in fallen_faces:
            all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
        vertex_offset += len(fallen_verts)
        
        fallen_verts2 = [
            [-3.5, -0.2, -2.2], [-2.2, -0.2, -2.8], [-1.8, -0.2, -2.0], [-3.0, -0.2, -1.4],
            [-3.5, 0.2, -2.2], [-2.2, 0.2, -2.8], [-1.8, 0.2, -2.0], [-3.0, 0.2, -1.4],
        ]
        all_verts.extend(fallen_verts2)
        for f in fallen_faces:
            all_faces.append([f[0]+vertex_offset, f[1]+vertex_offset, f[2]+vertex_offset, f[3]+vertex_offset])
    
    return all_verts, all_faces

# Phase configurations
phases = [
    (1, "origins", False, False, False, "Circular ditch and bank - no stones yet"),
    (2, "bluestones", True, False, False, "First bluestones arrive from Wales"),
    (3, "sarsen", True, True, False, "Massive sarsen circle with trilithons"),
    (4, "modifications", True, True, False, "Reorganization and Avenue construction"),
    (5, "present", True, True, True, "Fallen stones, conservation, tourism"),
]

print("=" * 60)
print("Stonehenge 5-Phase OBJ Generator")
print("=" * 60)
print(f"\nOutput folder: {output_dir}\n")

for num, name, bluestones, sarsen, fallen, desc in phases:
    print(f"Generating Phase {num}: {name}...")
    verts, faces = generate_phase(num, name, bluestones, sarsen, fallen, desc)
    
    output_file = os.path.join(output_dir, f"phase{num}_{name}.obj")
    write_obj(output_file, verts, faces, f"Phase {num}: {name.title()}", desc)

print("\n" + "=" * 60)
print(f"Complete. 5 OBJ files saved to:")
print(f"   {output_dir}")
print("=" * 60)

for f in os.listdir(output_dir):
    if f.endswith('.obj'):
        size = os.path.getsize(os.path.join(output_dir, f)) / 1024
        print(f"   {f} ({size:.1f} KB)")