"""
Face Shape Prediction Microservice
Loads the trained PyTorch model and serves predictions via HTTP.

Architecture:
  5 feature blocks (conv+bn+relu pairs with MaxPool between blocks),
  followed by AdaptiveAvgPool(7,7), then a classifier with:
    Linear(25088, 1024) -> BN -> ReLU -> Dropout -> Linear(1024, 256)
    -> ReLU -> Dropout -> Linear(256, 5)

5 output classes: Heart, Oblong, Oval, Round, Square
"""

import io, os, sys, json, base64, traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image

# ── Model Definition ────────────────────────────────────────────────────────

class FaceShapeModel(nn.Module):
    def __init__(self, num_classes=5):
        super().__init__()

        def make_block(in_ch, out_ch):
            return nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 3, padding=1), nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
                nn.Conv2d(out_ch, out_ch, 3, padding=1), nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2)
            )

        self.features = nn.Sequential(
            make_block(3, 32),
            make_block(32, 64),
            make_block(64, 128),
            make_block(128, 256),
            make_block(256, 512),
        )

        self.pool = nn.AdaptiveAvgPool2d((7, 7))

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512 * 7 * 7, 1024),
            nn.BatchNorm1d(1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(1024, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.pool(x)
        x = self.classifier(x)
        return x


# ── Constants ────────────────────────────────────────────────────────────────

CLASS_NAMES = ['Heart', 'Oblong', 'Oval', 'Round', 'Square']

HAIRCUT_RECOMMENDATIONS = {
    'Oval': {
        'description': 'Oval faces are the most versatile — almost any hairstyle works beautifully.',
        'tip': 'Lucky you! You can pull off virtually any cut.',
        'styles': [
            {
                'name': 'Classic Pompadour',
                'reason': 'Adds height and works perfectly with your balanced proportions',
                'confidence': 97,
                'image': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80'
            },
            {
                'name': 'Textured Quiff',
                'reason': 'Enhances your natural symmetry with modern flair',
                'confidence': 95,
                'image': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80'
            },
            {
                'name': 'Side Part',
                'reason': 'Timeless and elegant for an oval face',
                'confidence': 93,
                'image': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80'
            },
            {
                'name': 'Caesar Cut',
                'reason': 'Clean and structured, highlights your balanced features',
                'confidence': 90,
                'image': 'https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=400&q=80'
            },
            {
                'name': 'Slicked Back',
                'reason': 'Showcases your perfect face proportions',
                'confidence': 88,
                'image': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80'
            },
            {
                'name': 'French Crop',
                'reason': 'Modern and sharp — great for daily wear',
                'confidence': 85,
                'image': 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80'
            },
        ]
    },
    'Round': {
        'description': 'Round faces benefit from styles that add height and angular definition.',
        'tip': 'Go for height on top and keep the sides shorter.',
        'styles': [
            {
                'name': 'High Fade + Volume Top',
                'reason': 'Creates the illusion of a longer face with volume on top',
                'confidence': 96,
                'image': 'https://images.unsplash.com/photo-1520338801623-3f44f1bf3a56?w=400&q=80'
            },
            {
                'name': 'Pompadour',
                'reason': 'Adds significant height to elongate your face',
                'confidence': 94,
                'image': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80'
            },
            {
                'name': 'Mohawk Fade',
                'reason': 'Height in the center visually lengthens a round face',
                'confidence': 91,
                'image': 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=400&q=80'
            },
            {
                'name': 'Quiff',
                'reason': 'Sweeping volume adds the angular look you need',
                'confidence': 89,
                'image': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80'
            },
            {
                'name': 'Textured Spikes',
                'reason': 'Upward styling adds face length',
                'confidence': 86,
                'image': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80'
            },
            {
                'name': 'Undercut with Volume',
                'reason': 'Contrast between short sides and long top works great',
                'confidence': 83,
                'image': 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=400&q=80'
            },
        ]
    },
    'Square': {
        'description': 'Square faces have strong jaw lines. Soft, layered styles balance the angles perfectly.',
        'tip': 'Avoid blunt cuts that emphasize the jaw — go for softness.',
        'styles': [
            {
                'name': 'Textured Layers',
                'reason': 'Soft texture reduces the strong angular appearance',
                'confidence': 95,
                'image': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80'
            },
            {
                'name': 'Side Swept Fringe',
                'reason': 'Diagonal lines soften a square jaw beautifully',
                'confidence': 93,
                'image': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80'
            },
            {
                'name': 'Curly Top Fade',
                'reason': 'Natural curls add softness and visual height',
                'confidence': 90,
                'image': 'https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400&q=80'
            },
            {
                'name': 'Messy Textured Cut',
                'reason': 'Relaxed texture contrasts with the strong jaw',
                'confidence': 88,
                'image': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80'
            },
            {
                'name': 'Long Layered Cut',
                'reason': 'Length past the jaw softens square features',
                'confidence': 85,
                'image': 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80'
            },
            {
                'name': 'Taper Fade with Fringe',
                'reason': 'Clean sides with a soft fringe balances the structure',
                'confidence': 82,
                'image': 'https://images.unsplash.com/photo-1520338801623-3f44f1bf3a56?w=400&q=80'
            },
        ]
    },
    'Heart': {
        'description': 'Heart-shaped faces have a wider forehead and narrower chin. Add fullness near the chin.',
        'tip': 'Add width at the chin level and minimize forehead width.',
        'styles': [
            {
                'name': 'Medium Length Side Part',
                'reason': 'Adds width at the chin level to balance the face',
                'confidence': 96,
                'image': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80'
            },
            {
                'name': 'Textured Fringe',
                'reason': 'Breaks up forehead width naturally',
                'confidence': 93,
                'image': 'https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=400&q=80'
            },
            {
                'name': 'Low Fade with Length on Top',
                'reason': 'Keeps width low on the face, balancing your shape',
                'confidence': 91,
                'image': 'https://images.unsplash.com/photo-1520338801623-3f44f1bf3a56?w=400&q=80'
            },
            {
                'name': 'Wavy Medium Length',
                'reason': 'Waves below the ear add chin-level fullness',
                'confidence': 88,
                'image': 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80'
            },
            {
                'name': 'Curtain Bangs',
                'reason': 'Narrows a wide forehead with center-parted style',
                'confidence': 85,
                'image': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80'
            },
            {
                'name': 'Layered Bob',
                'reason': 'Builds volume near the chin to balance heart shape',
                'confidence': 83,
                'image': 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=400&q=80'
            },
        ]
    },
    'Oblong': {
        'description': 'Oblong faces are longer than wide. Add width and avoid styles that add height.',
        'tip': 'Add volume on the sides — avoid tall, narrow styles.',
        'styles': [
            {
                'name': 'Medium Textured Cut',
                'reason': 'Side volume adds width to a longer face',
                'confidence': 95,
                'image': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80'
            },
            {
                'name': 'Crew Cut with Fringe',
                'reason': 'Fringe shortens the appearance of a long face',
                'confidence': 93,
                'image': 'https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=400&q=80'
            },
            {
                'name': 'Wavy Side Part',
                'reason': 'Waves give horizontal emphasis to the sides',
                'confidence': 90,
                'image': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80'
            },
            {
                'name': 'Buzz Cut',
                'reason': 'Uniform length keeps the focus even across the face',
                'confidence': 87,
                'image': 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=400&q=80'
            },
            {
                'name': 'Messy Textured Fringe',
                'reason': 'Fullness in the fringe visually shortens face length',
                'confidence': 84,
                'image': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80'
            },
            {
                'name': 'Side-Swept Bangs',
                'reason': 'Diagonal sweep adds visual width to narrower faces',
                'confidence': 81,
                'image': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80'
            },
        ]
    }
}

# ── Image Transform ──────────────────────────────────────────────────────────

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# ── Flask App ─────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'best_face_model.pth')
device = torch.device('cpu')
model = None

def load_model():
    global model
    print(f'[FaceShapeService] Loading model from {MODEL_PATH}...')
    m = FaceShapeModel(num_classes=5)
    state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=True)
    m.load_state_dict(state_dict)
    m.eval()
    model = m
    print('[FaceShapeService] Model loaded successfully.')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        img_b64 = data['image']
        if ',' in img_b64:
            img_b64 = img_b64.split(',', 1)[1]

        img_bytes = base64.b64decode(img_b64)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')

        tensor = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1)

        probs_list = probs[0].tolist()
        top_idx = int(torch.argmax(probs[0]).item())
        predicted_class = CLASS_NAMES[top_idx]
        confidence = round(probs_list[top_idx] * 100, 1)

        all_probs = {CLASS_NAMES[i]: round(probs_list[i] * 100, 1) for i in range(5)}

        recs = HAIRCUT_RECOMMENDATIONS.get(predicted_class, HAIRCUT_RECOMMENDATIONS['Oval'])

        return jsonify({
            'faceShape': predicted_class,
            'confidence': confidence,
            'allProbabilities': all_probs,
            'description': recs['description'],
            'tip': recs['tip'],
            'recommendations': [
                {
                    'id': i + 1,
                    'name': s['name'],
                    'reason': s['reason'],
                    'confidence': s['confidence'],
                    'category': predicted_class,
                    'image': s['image'],
                }
                for i, s in enumerate(recs['styles'])
            ]
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_model()
    print('[FaceShapeService] Starting on http://localhost:5001')
    app.run(host='0.0.0.0', port=5001, debug=False)