import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def get_font(size, bold=False):
    font_path = 'C:/Windows/Fonts/georgiab.ttf' if bold else 'C:/Windows/Fonts/georgia.ttf'
    if not os.path.exists(font_path):
        font_path = 'C:/Windows/Fonts/timesbd.ttf' if bold else 'C:/Windows/Fonts/times.ttf'
    return ImageFont.truetype(font_path, size)

def get_sans(size, bold=False):
    font_path = 'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf'
    if not os.path.exists(font_path):
        font_path = 'C:/Windows/Fonts/calibri.ttf'
    return ImageFont.truetype(font_path, size)

OUT_DIR = os.path.abspath("frontend/public/covers")
os.makedirs(OUT_DIR, exist_ok=True)

def draw_header_and_borders(draw, width, height, bg_color, frame_color, gold_color):
    # Outer academic double border
    pad = 40
    draw.rectangle([pad, pad, width - pad, height - pad], outline=frame_color, width=3)
    draw.rectangle([pad + 8, pad + 8, width - pad - 8, height - pad - 8], outline=gold_color, width=1)
    
    # Corner flourishes
    c_len = 24
    for cx, cy in [(pad+8, pad+8), (width-pad-8, pad+8), (pad+8, height-pad-8), (width-pad-8, height-pad-8)]:
        draw.rectangle([cx - 4, cy - 4, cx + 4, cy + 4], fill=gold_color)

    # Top imprint header
    font_top = get_sans(16, bold=True)
    font_sub = get_sans(12, bold=False)
    draw.text((width // 2, 65), "DOTCOM ACADEMIC PRESS", fill=gold_color, font=font_top, anchor="mm")
    draw.text((width // 2, 88), "FACULTY MONOGRAPH SERIES • PEER-REVIEWED MONOGRAPH", fill=(210, 200, 190), font=font_sub, anchor="mm")
    draw.line([(width // 2 - 180, 102), (width // 2 + 180, 102)], fill=gold_color, width=1)

def draw_bottom_bar(draw, width, height, author_name, author_title, gold_color, text_color):
    # Bottom dividing line
    draw.line([(width // 2 - 240, height - 165), (width // 2 + 240, height - 165)], fill=gold_color, width=1)
    
    # Author
    font_auth = get_font(26, bold=True)
    font_cred = get_sans(14, bold=False)
    draw.text((width // 2, height - 135), author_name, fill=text_color, font=font_auth, anchor="mm")
    draw.text((width // 2, height - 105), author_title, fill=gold_color, font=font_cred, anchor="mm")
    
    # Imprint footer
    font_foot = get_sans(11, bold=False)
    draw.text((width // 2, height - 70), "FIRST UNIVERSITY MONOGRAPH EDITION • NATIONAL CURRICULUM ACCREDITED", fill=(180, 170, 160), font=font_foot, anchor="mm")

# ==============================================================================
# COVER 1: Modern Deep Learning
# ==============================================================================
def create_deep_learning_cover():
    width, height = 1024, 1024
    # Deep midnight burgundy background
    im = Image.new("RGB", (width, height), (38, 12, 22))
    draw = ImageDraw.Draw(im)
    
    # Subtle background gradient vignette
    for r in range(width // 2, 0, -5):
        alpha = int(25 * (1 - r / (width // 2)))
        draw.ellipse([width//2 - r, height//2 - r, width//2 + r, height//2 + r], outline=(55 + alpha, 16 + alpha, 30 + alpha))

    # Header and borders
    draw_header_and_borders(draw, width, height, (38, 12, 22), (101, 28, 50), (246, 231, 168))
    
    # Book Title
    font_title = get_font(42, bold=True)
    font_sub = get_font(20, bold=False)
    draw.text((width // 2, 165), "Principles of Modern", fill=(255, 246, 217), font=font_title, anchor="mm")
    draw.text((width // 2, 220), "DEEP LEARNING", fill=(246, 231, 168), font=get_font(46, bold=True), anchor="mm")
    draw.text((width // 2, 275), "From Perceptrons to Transformers & Diffusion Models", fill=(225, 215, 205), font=font_sub, anchor="mm")
    
    # Central Illustration: Multilayer Transformer Attention Network Graph
    center_x, center_y = width // 2, 530
    
    # Concentric mathematical coordinate circles
    for rad in [190, 140, 90]:
        draw.ellipse([center_x - rad, center_y - rad, center_x + rad, center_y + rad], outline=(101, 28, 50), width=1)
    
    # Network layers
    layers = [
        [(-160, -110), (-160, -35), (-160, 40), (-160, 115)],      # Input layer
        [(-60, -140), (-60, -70), (-60, 0), (-60, 70), (-60, 140)], # Hidden layer 1
        [(60, -140), (60, -70), (60, 0), (60, 70), (60, 140)],       # Hidden layer 2
        [(160, -110), (160, -35), (160, 40), (160, 115)],           # Output layer
    ]
    
    # Interconnecting weight lines
    for l_idx in range(len(layers) - 1):
        for p1 in layers[l_idx]:
            for p2 in layers[l_idx + 1]:
                x1, y1 = center_x + p1[0], center_y + p1[1]
                x2, y2 = center_x + p2[0], center_y + p2[1]
                draw.line([(x1, y1), (x2, y2)], fill=(85, 24, 42), width=1)
    
    # Attention vectors / highlight lines
    for p1, p2 in [((-60, -70), (60, 70)), ((-60, 70), (60, -70)), ((-160, -35), (-60, 0)), ((60, 0), (160, 40))]:
        x1, y1 = center_x + p1[0], center_y + p1[1]
        x2, y2 = center_x + p2[0], center_y + p2[1]
        draw.line([(x1, y1), (x2, y2)], fill=(246, 231, 168), width=2)
        
    # Draw Nodes
    for layer in layers:
        for p in layer:
            x, y = center_x + p[0], center_y + p[1]
            draw.ellipse([x - 7, y - 7, x + 7, y + 7], fill=(101, 28, 50), outline=(246, 231, 168), width=2)
            draw.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(246, 231, 168))

    # Mathematical glyphs in illustration
    font_math = get_font(18, bold=True)
    draw.text((center_x - 175, center_y + 155), "x in R^d", fill=(246, 231, 168), font=font_math, anchor="mm")
    draw.text((center_x, center_y - 170), "Softmax(QK^T / sqrt(d_k))V", fill=(255, 246, 217), font=get_sans(15, bold=True), anchor="mm")
    draw.text((center_x + 175, center_y + 155), "y_hat = f_theta(x)", fill=(246, 231, 168), font=font_math, anchor="mm")

    # Bottom Author Bar
    draw_bottom_bar(draw, width, height, "Dr. Marcus Vance", "Professor of Computer Science & Artificial Intelligence", (246, 231, 168), (255, 246, 217))
    
    out_path = os.path.join(OUT_DIR, "modern-deep-learning.jpg")
    im.save(out_path, "JPEG", quality=95)
    print(f"[OK] Generated {out_path}")

# ==============================================================================
# COVER 2: Macroeconomic Modeling
# ==============================================================================
def create_macroeconomic_cover():
    width, height = 1024, 1024
    # Deep regal charcoal-burgundy background
    im = Image.new("RGB", (width, height), (32, 24, 28))
    draw = ImageDraw.Draw(im)
    
    draw_header_and_borders(draw, width, height, (32, 24, 28), (101, 28, 50), (246, 231, 168))
    
    # Book Title
    font_title = get_font(40, bold=True)
    font_sub = get_font(20, bold=False)
    draw.text((width // 2, 165), "Macroeconomic Modeling in", fill=(255, 246, 217), font=font_title, anchor="mm")
    draw.text((width // 2, 220), "DEVELOPING ECONOMIES", fill=(246, 231, 168), font=get_font(42, bold=True), anchor="mm")
    draw.text((width // 2, 275), "Fiscal Dominance, Exchange Regimes, and Monetary Policy", fill=(225, 215, 205), font=font_sub, anchor="mm")
    
    # Central Illustration: Dynamic Stochastic Equilibrium Surface & Curves
    center_x, center_y = width // 2, 530
    
    # Frame for chart
    chart_w, chart_h = 420, 260
    draw.rectangle([center_x - chart_w//2, center_y - chart_h//2, center_x + chart_w//2, center_y + chart_h//2], outline=(101, 28, 50), width=1)
    
    # Coordinate grid lines
    for gx in range(-chart_w//2 + 35, chart_w//2, 35):
        draw.line([(center_x + gx, center_y - chart_h//2), (center_x + gx, center_y + chart_h//2)], fill=(48, 36, 42), width=1)
    for gy in range(-chart_h//2 + 35, chart_h//2, 35):
        draw.line([(center_x - chart_w//2, center_y + gy), (center_x + chart_w//2, center_y + gy)], fill=(48, 36, 42), width=1)

    # Equilibrium curves (IS-LM / DSGE policy curves)
    # IS curve (downward sloping)
    points_is = []
    for t in range(0, 360, 4):
        x = center_x - 180 + t
        y = center_y - 90 + int(180 / (1 + math.exp(-0.015 * (t - 180))))
        points_is.append((x, y))
    for i in range(len(points_is) - 1):
        draw.line([points_is[i], points_is[i+1]], fill=(184, 101, 123), width=3)

    # LM / Monetary curve (upward sloping)
    points_lm = []
    for t in range(0, 360, 4):
        x = center_x - 180 + t
        y = center_y + 90 - int(180 / (1 + math.exp(-0.015 * (t - 180))))
        points_lm.append((x, y))
    for i in range(len(points_lm) - 1):
        draw.line([points_lm[i], points_lm[i+1]], fill=(246, 231, 168), width=3)

    # Equilibrium intersection point
    draw.ellipse([center_x - 8, center_y - 8, center_x + 8, center_y + 8], fill=(246, 231, 168), outline=(101, 28, 50), width=2)
    
    # Mathematical labels
    font_eq = get_font(16, bold=True)
    draw.text((center_x + 195, center_y + 85), "IS: Y = C + I + G + NX", fill=(184, 101, 123), font=font_eq, anchor="lm")
    draw.text((center_x + 195, center_y - 85), "MP: r = r_bar + lambda(pi - pi_target)", fill=(246, 231, 168), font=font_eq, anchor="lm")
    draw.text((center_x, center_y + chart_h//2 + 25), "E* = Stochastic Steady-State Equilibrium", fill=(255, 246, 217), font=get_sans(14, bold=True), anchor="mm")

    # Bottom Author Bar
    draw_bottom_bar(draw, width, height, "Prof. Elena Rostova", "Senior Fellow, Department of Applied Economics & Policy", (246, 231, 168), (255, 246, 217))
    
    out_path = os.path.join(OUT_DIR, "macroeconomic-modeling.jpg")
    im.save(out_path, "JPEG", quality=95)
    print(f"[OK] Generated {out_path}")

# ==============================================================================
# COVER 3: Clinical Neuroanatomy & Translational Diagnostics
# ==============================================================================
def create_neuroanatomy_cover():
    width, height = 1024, 1024
    # Deep imperial burgundy background
    im = Image.new("RGB", (width, height), (48, 14, 25))
    draw = ImageDraw.Draw(im)
    
    draw_header_and_borders(draw, width, height, (48, 14, 25), (101, 28, 50), (246, 231, 168))
    
    # Book Title
    font_title = get_font(38, bold=True)
    font_sub = get_font(20, bold=False)
    draw.text((width // 2, 165), "Clinical Neuroanatomy &", fill=(255, 246, 217), font=font_title, anchor="mm")
    draw.text((width // 2, 220), "TRANSLATIONAL DIAGNOSTICS", fill=(246, 231, 168), font=get_font(38, bold=True), anchor="mm")
    draw.text((width // 2, 275), "Pathological Correlations, Functional Systems & Neuroimaging", fill=(225, 215, 205), font=font_sub, anchor="mm")
    
    # Central Illustration: Geometric Sagittal Brain Connectome Map
    center_x, center_y = width // 2, 530
    
    # Stylized brain hemisphere nodes & connectome pathways
    node_coords = [
        # Frontal cortex
        (-140, -60), (-120, -110), (-70, -140), (-20, -150),
        # Parietal & Occipital
        (40, -145), (100, -120), (145, -70), (160, -20), (145, 40),
        # Temporal cortex
        (90, 80), (30, 95), (-40, 90), (-100, 60), (-140, 10),
        # Subcortical / Thalamus / Brainstem
        (0, -20), (15, 20), (10, 80), (0, 140)
    ]
    
    # Connect cortical periphery
    for i in range(len(node_coords) - 5):
        p1 = node_coords[i]
        p2 = node_coords[(i + 1) % (len(node_coords) - 4)]
        draw.line([(center_x + p1[0], center_y + p1[1]), (center_x + p2[0], center_y + p2[1])], fill=(139, 64, 85), width=2)
    
    # Cross-connect synaptic pathways
    for p1 in node_coords:
        for p2 in node_coords:
            dist = math.hypot(p1[0] - p2[0], p1[1] - p2[1])
            if 60 < dist < 160 and random.random() > 0.45:
                draw.line([(center_x + p1[0], center_y + p1[1]), (center_x + p2[0], center_y + p2[1])], fill=(85, 24, 42), width=1)

    # Highlight major tract bundles (e.g. Corpus Callosum / Pyramidal tract)
    for p1, p2 in [((-70, -140), (0, -20)), ((40, -145), (0, -20)), ((0, -20), (15, 20)), ((15, 20), (0, 140))]:
        draw.line([(center_x + p1[0], center_y + p1[1]), (center_x + p2[0], center_y + p2[1])], fill=(246, 231, 168), width=3)

    # Draw Nodes
    for p in node_coords:
        x, y = center_x + p[0], center_y + p[1]
        draw.ellipse([x - 6, y - 6, x + 6, y + 6], fill=(101, 28, 50), outline=(246, 231, 168), width=2)
        draw.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(246, 231, 168))

    # Connectome labels
    font_diag = get_sans(14, bold=True)
    draw.text((center_x, center_y + 175), "Diffusion Tensor Tractography Mapping System (DTI)", fill=(255, 246, 217), font=font_diag, anchor="mm")

    # Bottom Author Bar
    draw_bottom_bar(draw, width, height, "Dr. Suniti Mukherjee", "Professor of Clinical Neurology & Translational Sciences", (246, 231, 168), (255, 246, 217))
    
    out_path = os.path.join(OUT_DIR, "clinical-neuroanatomy.jpg")
    im.save(out_path, "JPEG", quality=95)
    print(f"[OK] Generated {out_path}")

if __name__ == "__main__":
    random.seed(42)
    create_deep_learning_cover()
    create_macroeconomic_cover()
    create_neuroanatomy_cover()
    print("\n[SUCCESS] All 3 academic covers created successfully.")
