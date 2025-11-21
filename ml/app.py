# app.py - Enhanced Medical Prediction API with Hybrid Extraction
import os
import json
import re
import numpy as np
import torch
from io import BytesIO
from PIL import Image
from typing import Dict, List, Set, Tuple
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForTokenClassification
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess

# ---------------- MODEL PATHS ---------------- #
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEXT_MODEL_DIR = os.path.join(BASE_DIR, "text_model")
IMAGE_MODEL_DIR = os.path.join(BASE_DIR, "image_model")
IMAGE_MODEL_PATH = os.path.join(IMAGE_MODEL_DIR, "skin_disease_model_rgb.h5")
CLASS_NAMES_PATH = os.path.join(IMAGE_MODEL_DIR, "class_names_new.json")

# ---------------- FASTAPI APP ---------------- #
app = FastAPI(title="Medical Symptom & Disease Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOAD MODELS ---------------- #
# Load text model (required)
try:
    print("Loading text model from:", TEXT_MODEL_DIR)
    tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_DIR, use_fast=True, local_files_only=True)
    text_model = AutoModelForTokenClassification.from_pretrained(TEXT_MODEL_DIR, local_files_only=True)
    text_model.eval()
    print("✅ Text model loaded")
except Exception as e:
    print(f"❌ Failed to load text model: {e}")
    raise RuntimeError("Text model is required. Fix text model loading before continuing.")

# Image model is optional
# ---------------- LOAD MODELS ---------------- #
# ... (keep existing text model loading code) ...

# Image model loading - UPDATED
image_model = None
class_names = []
IMG_SIZE = 256  # Your model's input size


if os.path.exists(CLASS_NAMES_PATH) and os.path.exists(IMAGE_MODEL_PATH):
    try:
        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
            class_names = json.load(f)
        class_names = [c.strip().replace("_", " ") for c in class_names]
        
        print(f"Loading image model from: {IMAGE_MODEL_PATH}")
        image_model = load_model(IMAGE_MODEL_PATH, compile=False)
        print(f"✅ Image model loaded - Input shape: {image_model.input_shape}")
        print(f"✅ Loaded {len(class_names)} skin disease classes")
    except Exception as e:
        print(f"⚠ Image model load failed: {e}")
        image_model = None
        class_names = []
else:
    print("⚠ Image model files not found — image endpoints will be disabled.")
# ---------------- PYDANTIC MODELS ---------------- #
class InputText(BaseModel):
    text: str

# ---------------- HELPER FUNCTIONS ---------------- #
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess

def preprocess_pil_image(pil_img: Image.Image, target_size=(256, 256)):
    """Preprocess image for EfficientNet model"""
    # Convert to RGB (your model expects 3 channels)
    img = pil_img.convert("RGB")
    
    # Resize to model's expected input size
    img = img.resize(target_size, Image.BILINEAR)
    
    # Convert to numpy array
    img_array = np.array(img)
    
    # Apply EfficientNet preprocessing
    img_array = efficientnet_preprocess(img_array)
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

# ---------------- ENHANCED MEDICAL KNOWLEDGE BASE ---------------- #
symptom_to_disease = {
    "skin rash": ["eczema", "allergic reaction", "psoriasis", "dermatitis"],
    "itching": ["allergic reaction", "scabies", "eczema", "fungal infection"],
    "burning sensation": ["infection", "dermatitis", "neuropathy", "UTI"],
    "fever": ["flu", "dengue", "malaria", "COVID-19", "bacterial infection"],
    "headache": ["migraine", "flu", "sinusitis", "tension headache", "cluster headache"],
    "cough": ["common cold", "bronchitis", "pneumonia", "asthma", "COVID-19"],
    "chest pain": ["angina", "heart attack", "acid reflux", "pneumonia", "anxiety"],
    "bloated": ["indigestion", "IBS", "gastric issue", "food intolerance"],
    "stomach pain": ["ulcer", "food poisoning", "gastritis", "appendicitis", "IBS"],
    "dizziness": ["low blood pressure", "vertigo", "dehydration", "anemia", "inner ear problem"],
    "fatigue": ["anemia", "thyroid issue", "chronic fatigue syndrome", "depression", "sleep apnea"],
    "sore throat": ["pharyngitis", "tonsillitis", "common cold", "strep throat"],
    "back pain": ["muscle strain", "sciatica", "kidney stone", "herniated disc"],
    "joint pain": ["arthritis", "gout", "injury", "lupus", "fibromyalgia"],
    "difficulty breathing": ["asthma", "pneumonia", "anxiety", "COPD", "heart failure"],
    "nausea": ["food poisoning", "pregnancy", "migraine", "gastritis", "motion sickness"],
    "vomiting": ["food poisoning", "gastroenteritis", "migraine", "appendicitis"],
    "diarrhea": ["food poisoning", "gastroenteritis", "IBS", "infection"],
    "constipation": ["IBS", "dehydration", "medication side effect", "thyroid disorder"],
    "runny nose": ["common cold", "allergic rhinitis", "sinusitis", "flu"],
    "congestion": ["sinusitis", "common cold", "allergies", "deviated septum"],
    "muscle pain": ["flu", "fibromyalgia", "overexertion", "vitamin D deficiency"],
    "weakness": ["anemia", "thyroid disorder", "vitamin deficiency", "chronic illness"],
    "chills": ["fever", "infection", "hypothermia", "sepsis"],
    "sweating": ["fever", "hyperthyroidism", "menopause", "anxiety"],
    "weight loss": ["diabetes", "hyperthyroidism", "cancer", "depression", "malabsorption"],
    "weight gain": ["hypothyroidism", "PCOS", "cushing syndrome", "medication side effect"],
    "loss of appetite": ["liver disease", "stomach infection", "stress", "depression", "cancer"],
    "heart attack": ["coronary artery disease", "cardiac arrest", "myocardial infarction"],
    "fainting": ["low blood pressure", "dehydration", "heart condition", "vasovagal syncope"],
    "confusion": ["dementia", "delirium", "infection", "stroke", "medication side effect"],
    "bleeding": ["injury", "hemorrhoids", "ulcer", "clotting disorder"],
    "swelling": ["injury", "infection", "heart failure", "kidney disease", "allergic reaction"],
}

fallback_rules = {
    "night sweats": ["tuberculosis", "lymphoma", "infection", "menopause"],
    "rapid heartbeat": ["anxiety", "hyperthyroidism", "arrhythmia", "anemia"],
    "pale skin": ["anemia", "shock", "poor circulation"],
    "ear pain": ["ear infection", "sinus infection", "TMJ disorder"],
    "eye pain": ["glaucoma", "eye infection", "migraine", "eye strain"],
}

# Severity assessment rules
severity_rules = {
    "emergency": [
        "chest pain", "heart attack", "stroke", "seizure", "unconscious", 
        "difficulty breathing", "severe bleeding", "severe allergic reaction",
        "sudden severe headache", "loss of consciousness", "confusion with fever",
        "inability to speak", "sudden vision loss", "severe abdominal pain",
    ],
    "urgent": [
        "high fever", "persistent vomiting", "severe dehydration", "severe pain",
        "blood in urine", "blood in stool", "severe diarrhea",
        "fainting", "suspected appendicitis", "infected wound"
    ],
    "moderate": [
        "fever", "headache", "stomach pain", "nausea", 
        "vomiting", "dizziness", "rash", "persistent cough",
        "sore throat", "ear pain", "back pain"
    ],
    "mild": [
        "cold", "cough", "tired", "fatigue", "mild joint pain",
        "runny nose", "congestion", "mild headache"
    ]
}

# Recommendations based on severity
recommendations = {
    "emergency": [
        "🚨 SEEK IMMEDIATE EMERGENCY CARE",
        "Call 911 or go to the nearest emergency room",
        "Do NOT drive yourself - call an ambulance",
        "Do not delay - this could be life-threatening",
        "Have someone stay with you until help arrives"
    ],
    "urgent": [
        "⚠️ Seek medical attention within 24 hours",
        "Contact your healthcare provider immediately",
        "Consider going to urgent care if doctor unavailable",
        "Monitor symptoms closely and seek emergency care if they worsen",
        "Do not ignore these symptoms"
    ],
    "moderate": [
        "📅 Schedule an appointment with your healthcare provider",
        "Monitor symptoms and seek immediate care if they worsen",
        "Stay hydrated and get adequate rest",
        "Keep track of symptom progression",
        "Consider over-the-counter remedies if appropriate"
    ],
    "mild": [
        "👀 Monitor symptoms for changes",
        "Ensure adequate rest and hydration",
        "Consider over-the-counter remedies if appropriate",
        "Consult healthcare provider if symptoms persist beyond 7-10 days",
        "Practice good self-care and hygiene"
    ]
}

# Additional care tips
general_care_tips = {
    "hydration": "Drink plenty of fluids (water, clear broths, herbal tea)",
    "rest": "Get adequate sleep and rest to help your body recover",
    "nutrition": "Eat nutritious, balanced meals to support your immune system",
    "hygiene": "Practice good hygiene to prevent spread of infection",
    "monitoring": "Keep a symptom diary to track changes and patterns",
}

# ---------------- HYBRID EXTRACTION FUNCTIONS ---------------- #

def extract_symptoms_from_model(text: str, tokenizer, model) -> Tuple[List[str], List[Dict]]:
    """Extract symptoms using your trained NER model"""
    
    enc = tokenizer(text, return_tensors="pt", truncation=True, return_offsets_mapping=True)
    offsets = enc["offset_mapping"][0].tolist()

    with torch.no_grad():
        outputs = model(**{k: v for k, v in enc.items() if k != "offset_mapping"})
    
    logits = outputs.logits[0]
    preds = torch.argmax(logits, dim=-1).tolist()
    tokens = tokenizer.convert_ids_to_tokens(enc["input_ids"][0])
    
    # Calculate confidence scores
    probs = torch.softmax(logits, dim=-1)
    
    # Extract symptoms using BIO decoding with confidence
    symptoms = []
    symptoms_with_confidence = []
    current_tokens = []
    current_confidences = []
    
    for i, (token, label_id, (start, end)) in enumerate(zip(tokens, preds, offsets)):
        label = model.config.id2label[label_id]
        confidence = float(probs[i, label_id])
        
        if label.startswith("B-"):
            if current_tokens:
                symptom_text = "".join(current_tokens).replace("##", "").strip()
                avg_confidence = sum(current_confidences) / len(current_confidences)
                if symptom_text and avg_confidence > 0.3:
                    symptoms.append(symptom_text)
                    symptoms_with_confidence.append({
                        "symptom": symptom_text,
                        "confidence": avg_confidence,
                        "source": "model"
                    })
            current_tokens = [token]
            current_confidences = [confidence]
            
        elif label.startswith("I-") and current_tokens:
            current_tokens.append(token)
            current_confidences.append(confidence)
            
        else:
            if current_tokens:
                symptom_text = "".join(current_tokens).replace("##", "").strip()
                avg_confidence = sum(current_confidences) / len(current_confidences)
                if symptom_text and avg_confidence > 0.3:
                    symptoms.append(symptom_text)
                    symptoms_with_confidence.append({
                        "symptom": symptom_text,
                        "confidence": avg_confidence,
                        "source": "model"
                    })
                current_tokens = []
                current_confidences = []
    
    if current_tokens:
        symptom_text = "".join(current_tokens).replace("##", "").strip()
        avg_confidence = sum(current_confidences) / len(current_confidences)
        if symptom_text and avg_confidence > 0.3:
            symptoms.append(symptom_text)
            symptoms_with_confidence.append({
                "symptom": symptom_text,
                "confidence": avg_confidence,
                "source": "model"
            })
    
    return symptoms, symptoms_with_confidence


def normalize_symptom(symptom: str) -> str:
    """Normalize symptom text to standard form"""
    
    normalizations = {
        'chestpain': 'chest pain',
        'stomachpain': 'stomach pain',
        'stomachache': 'stomach pain',
        'backpain': 'back pain',
        'throathurts': 'sore throat',
        'throatpain': 'sore throat',
        'earache': 'ear pain',
        'heartattack': 'heart attack',
        'difficultybreathing': 'difficulty breathing',
        'coughing': 'cough',
        'vomiting': 'vomiting',
        'bleeding': 'bleeding',
        'fainting': 'fainting',
        'fainted': 'fainting',
        'dizzy': 'dizziness',
        'nausea': 'nausea',
        'tired': 'fatigue',
        'weak': 'weakness',
        'itching': 'itching',
    }
    
    symptom_lower = symptom.lower().strip()
    return normalizations.get(symptom_lower, symptom)


def enhance_with_rules(text: str, model_symptoms: List[str], symptoms_with_conf: List[Dict]) -> Tuple[List[str], List[Dict]]:
    """Enhance model predictions with rule-based extraction"""
    
    text_lower = text.lower()
    model_found = set(normalize_symptom(s).lower() for s in model_symptoms)
    
    enhancement_patterns = {
        r'\bsevere\s+chest\s+pain\b': 'chest pain',
        r'\bchest\s+pain\b': 'chest pain',
        r'\bdifficulty\s+breathing\b': 'difficulty breathing',
        r'\bcan\'?t\s+breathe\b': 'difficulty breathing',
        r'\bshortness\s+of\s+breath\b': 'difficulty breathing',
        r'\bsore\s+throat\b': 'sore throat',
        r'\bthroat\s+hurts?\b': 'sore throat',
        r'\bhigh\s+fever\b': 'fever',
        r'\bfever\s+of\s+\d+': 'fever',
        r'\bsevere\s+bleeding\b': 'bleeding',
        r'\bheart\s+attack\b': 'heart attack',
        r'\bpassed\s+out\b': 'fainting',
        r'\bconfus(ed|ion)\b': 'confusion',
        r'\bstomach\s+pain\b': 'stomach pain',
        r'\bback\s+pain\b': 'back pain',
        r'\bfever\b': 'fever',
        r'\bcough\b': 'cough',
        r'\bbleeding\b': 'bleeding',
        r'\bfaint(ed|ing)?\b': 'fainting',
        r'\bdizz(y|iness)\b': 'dizziness',
        r'\bnausea\b': 'nausea',
        r'\bvomit(ing)?\b': 'vomiting',
        r'\bdiarr?h?oea\b': 'diarrhea',
        r'\brash\b': 'rash',
        r'\bswell(ing)?\b': 'swelling',
        r'\bfatigue\b': 'fatigue',
        r'\bweak(ness)?\b': 'weakness',
    }
    
    non_medical = {
        'cricket', 'football', 'basketball', 'ice cream', 'pizza', 'food', 
        'ate', 'playing', 'game', 'working'
    }
    
    additional_symptoms = []
    additional_with_conf = []
    for pattern, symptom_name in enhancement_patterns.items():
            if symptom_name.lower() in model_found:
                continue
        
            if symptom_name.lower() in non_medical:
                continue
        
            if re.search(pattern, text_lower):
                additional_symptoms.append(symptom_name)
                additional_with_conf.append({
                    "symptom": symptom_name,
                    "confidence": 0.75,
                    "source": "rule"
                })
                model_found.add(symptom_name.lower())
    
    all_symptoms = model_symptoms + additional_symptoms
    all_with_conf = symptoms_with_conf + additional_with_conf
    
    return all_symptoms, all_with_conf


def assess_severity(text: str, symptoms: List[str], diseases: List[Dict]) -> str:
    """Enhanced severity assessment"""
    text_lower = text.lower()
    
    # Emergency keywords
    emergency_keywords = [
        'heart attack', 'heartattack', 'cardiac arrest',
        'chest pain', 'severe chest pain',
        "can't breathe", "difficulty breathing", "can't speak",
        'stroke', 'seizure', 'unconscious', 'passed out',
        'severe bleeding', 'loss of consciousness'
    ]
    
    for keyword in emergency_keywords:
        if keyword in text_lower:
            return "emergency"
    
    emergency_symptoms = ['heart attack', 'stroke', 'difficulty breathing', 'severe bleeding', 'fainting', 'seizure']
    for symptom in symptoms:
        if any(es in symptom.lower() for es in emergency_symptoms):
            return "emergency"
    
    # Urgent keywords
    urgent_keywords = [
        'high fever', 'fever 103', 'fever 104',
        'severe pain', 'blood in urine', 'blood in stool',
        'severe vomiting', 'severe headache'
    ]
    
    for keyword in urgent_keywords:
        if keyword in text_lower:
            return "urgent"
    
    # Check diseases
    emergency_diseases = ['heart attack', 'stroke', 'sepsis', 'anaphylaxis']
    urgent_diseases = ['appendicitis', 'pneumonia', 'kidney stone']
    
    for disease in diseases:
        disease_name = disease["name"].lower()
        if any(ed in disease_name for ed in emergency_diseases):
            return "emergency"
        if any(ud in disease_name for ud in urgent_diseases):
            return "urgent"
    
    # Moderate keywords
    moderate_keywords = [
        'fever', 'cough', 'sore throat', 'headache',
        'stomach pain', 'nausea', 'vomiting', 'diarrhea'
    ]
    
    for keyword in moderate_keywords:
        if keyword in text_lower:
            return "moderate"
    
    if len(symptoms) > 0:
        return "moderate"
    
    return "mild"


def get_care_tips(symptoms: List[str], diseases: List[Dict]) -> List[str]:
    """Generate care tips based on symptoms"""
    tips = []
    
    if any(s in ["fever", "cough", "sore throat"] for s in symptoms):
        tips.append(general_care_tips["hydration"])
        tips.append(general_care_tips["rest"])
    
    if any(s in ["stomach pain", "nausea", "vomiting"] for s in symptoms):
        tips.append("Eat bland foods (BRAT diet: bananas, rice, applesauce, toast)")
        tips.append("Avoid spicy, fatty, or heavy foods")
    
    if any(s in ["headache", "migraine"] for s in symptoms):
        tips.append("Rest in a quiet, dark room")
        tips.append("Apply cold or warm compress to head or neck")
    
    if any(s in ["cough", "congestion"] for s in symptoms):
        tips.append("Use a humidifier to add moisture to the air")
    
    tips.append(general_care_tips["monitoring"])
    
    return tips[:5]


# ---------------- API ENDPOINTS ---------------- #

@app.post("/predict_text")
def predict_text(input: InputText):
    """Hybrid symptom extraction: Model + Rule-based enhancement"""
    text = input.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")

    print(f"\n{'='*70}")
    print(f"📝 Input: {text}")
    print(f"{'='*70}")

    # Step 1: Extract using model
    model_symptoms, symptoms_with_conf = extract_symptoms_from_model(text, tokenizer, text_model)
    
    # Normalize
    model_symptoms = [normalize_symptom(s) for s in model_symptoms]
    for item in symptoms_with_conf:
        item["symptom"] = normalize_symptom(item["symptom"])
    
    print(f"🤖 Model extracted: {model_symptoms}")
    if symptoms_with_conf:
        conf_list = [f"{s['symptom']}={s['confidence']:.2f}" for s in symptoms_with_conf]
        print(f"   Confidences: {conf_list}")

    # Step 2: Enhance with rules
    all_symptoms, all_with_conf = enhance_with_rules(text, model_symptoms, symptoms_with_conf)
    
    rule_added = [s for s in all_symptoms if s not in model_symptoms]
    if rule_added:
        print(f"📋 Rules added: {rule_added}")
    
    # Remove duplicates
    seen = set()
    unique_symptoms = []
    unique_with_conf = []
    
    for symptom, conf_item in zip(all_symptoms, all_with_conf):
        symptom_lower = symptom.lower()
        if symptom_lower not in seen:
            seen.add(symptom_lower)
            unique_symptoms.append(symptom)
            unique_with_conf.append(conf_item)
    
    symptoms = unique_symptoms
    symptoms_with_confidence = unique_with_conf
    
    print(f"✅ Final symptoms: {symptoms}")
    print(f"{'='*70}\n")

    # Map to diseases
    disease_counts: Dict[str, int] = {}
    for s in symptoms:
        matched = False
        for sym, diseases_list in symptom_to_disease.items():
            if sym in s.lower() or s.lower() in sym:
                for d in diseases_list:
                    disease_counts[d] = disease_counts.get(d, 0) + 1
                matched = True
        if not matched:
            for sym, diseases_list in fallback_rules.items():
                if sym in s.lower() or s.lower() in sym:
                    for d in diseases_list:
                        disease_counts[d] = disease_counts.get(d, 0) + 1

    if not disease_counts:
        disease_counts["General check-up recommended"] = 1

    diseases = [
        {"name": k, "score": v}
        for k, v in sorted(disease_counts.items(), key=lambda x: -x[1])
    ]

    severity = assess_severity(text, symptoms, diseases)
    care_tips = get_care_tips(symptoms, diseases)

    return {
        "symptoms": symptoms,
        "symptoms_with_confidence": symptoms_with_confidence,
        "diseases": diseases,
        "severity": severity,
        "recommendations": recommendations[severity],
        "care_tips": care_tips,
        "extraction_stats": {
            "total_symptoms": len(symptoms),
            "model_extracted": len(model_symptoms),
            "rule_enhanced": len(rule_added) if rule_added else 0
        },
        "disclaimer": "This is an AI-based assessment and not a substitute for professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment."
    }


@app.post("/predict_image")
async def predict_image(file: UploadFile = File(...)):
    """Predict skin disease from uploaded medical image"""
    if image_model is None:
        raise HTTPException(status_code=503, detail="Image model not available")

    try:
        contents = await file.read()
        pil_img = Image.open(BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot process image: {str(e)}")

    try:
        # Preprocess image
        pre = preprocess_pil_image(pil_img, target_size=(IMG_SIZE, IMG_SIZE))
        
        # Predict
        preds = image_model.predict(pre)
        probs = np.squeeze(preds)
        
        # Get top 5 predictions
        top_k = min(5, len(probs))
        top_idx = np.argsort(probs)[-top_k:][::-1]

        diseases = []
        for idx in top_idx:
            if int(idx) < len(class_names):
                disease_name = class_names[int(idx)]
                confidence = float(probs[int(idx)])
                
                diseases.append({
                    "name": disease_name,
                    "confidence": confidence,
                    "confidence_percentage": f"{round(confidence * 100, 2)}%"
                })
        
        # Get top prediction for severity assessment
        top_disease = diseases[0]["name"].lower() if diseases else ""
        
        # Assess severity based on disease type
        severity = "moderate"  # Default
        if any(term in top_disease for term in ["melanoma", "carcinoma", "cancer"]):
            severity = "urgent"
        elif any(term in top_disease for term in ["eczema", "dermatitis", "psoriasis", "fungal"]):
            severity = "moderate"
        else:
            severity = "mild"
        
        # Generate recommendations
        image_recommendations = []
        if severity == "urgent":
            image_recommendations = [
                "⚠️ Consult a dermatologist immediately",
                "This condition requires professional medical evaluation",
                "Do not delay seeking medical care",
                "Bring this image to your appointment"
            ]
        elif severity == "moderate":
            image_recommendations = [
                "📅 Schedule an appointment with a dermatologist",
                "Monitor the affected area for changes",
                "Avoid scratching or irritating the area",
                "Take photos to track progression"
            ]
        else:
            image_recommendations = [
                "👀 Monitor the condition",
                "Consult a dermatologist if symptoms worsen",
                "Keep the area clean and moisturized",
                "Document any changes with photos"
            ]
        
        # Generate care tips based on disease
        care_tips = []
        if "eczema" in top_disease or "dermatitis" in top_disease:
            care_tips = [
                "Keep skin moisturized with fragrance-free lotions",
                "Avoid known triggers (soaps, detergents, allergens)",
                "Use lukewarm water for bathing",
                "Wear soft, breathable fabrics"
            ]
        elif "psoriasis" in top_disease:
            care_tips = [
                "Moisturize regularly to prevent dryness",
                "Avoid stress which can trigger flare-ups",
                "Limit alcohol consumption",
                "Get adequate sunlight (but avoid sunburn)"
            ]
        elif "fungal" in top_disease or "ringworm" in top_disease:
            care_tips = [
                "Keep affected area clean and dry",
                "Use antifungal cream as directed",
                "Wash clothing and bedding in hot water",
                "Avoid sharing personal items"
            ]
        else:
            care_tips = [
                "Keep the area clean",
                "Avoid excessive sun exposure",
                "Monitor for changes in size, color, or texture",
                "Consult a dermatologist for proper diagnosis"
            ]

        return {
            "symptoms": [],  # Images show conditions, not symptoms
            "diseases": diseases,
            "severity": severity,
            "recommendations": image_recommendations,
            "care_tips": care_tips[:5],
            "analysis_type": "image_based",
            "disclaimer": "This is an AI-based screening tool. Always consult a qualified dermatologist for accurate diagnosis and treatment."
        }

    except Exception as e:
        print(f"Image prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict_combined")
async def predict_combined(text: str = None, file: UploadFile = File(None)):
    """Combined prediction using both text and image"""
    if not text and not file:
        raise HTTPException(status_code=400, detail="Provide either text or image or both")
    
    text_result = None
    image_result = None
    
    if text and text.strip():
        try:
            text_result = predict_text(InputText(text=text))
        except Exception as e:
            print(f"Text prediction error: {e}")
    
    if file and image_model is not None:
        try:
            image_result = await predict_image(file)
        except Exception as e:
            print(f"Image prediction error: {e}")
    
    combined_symptoms = []
    combined_diseases = {}
    
    if text_result:
        combined_symptoms.extend(text_result["symptoms"])
        for disease in text_result["diseases"]:
            name = disease["name"]
            combined_diseases[name] = combined_diseases.get(name, 0) + disease["score"]
    
    if image_result:
        for disease in image_result["diseases"]:
            name = disease["name"]
            combined_diseases[name] = combined_diseases.get(name, 0) + (disease["score"] * 2)
    
    diseases = [
        {"name": k, "score": v}
        for k, v in sorted(combined_diseases.items(), key=lambda x: -x[1])
    ]
    
    if text_result:
        severity = text_result["severity"]
        recs = text_result["recommendations"]
        care_tips = text_result.get("care_tips", [])
    else:
        severity = "moderate"
        recs = recommendations["moderate"]
        care_tips = []
    
    return {
        "symptoms": combined_symptoms,
        "diseases": diseases[:10],
        "severity": severity,
        "recommendations": recs,
        "care_tips": care_tips,
        "analysis_sources": {
            "text_analysis": text_result is not None,
            "image_analysis": image_result is not None
        },
        "disclaimer": "This combined analysis uses both text and image inputs. Always consult with a healthcare provider."
    }


@app.get("/")
def root():
    """API health check"""
    return {
        "status": "healthy",
        "service": "Medical Symptom & Disease Predictor API",
        "version": "2.1 - Hybrid Extraction",
        "models": {
            "text": "loaded ✓" if text_model is not None else "not loaded ✗",
            "image": "loaded ✓" if image_model is not None else "not loaded ✗"
        },
        "endpoints": {
            "text_prediction": "/predict_text",
            "image_prediction": "/predict_image",
            "combined_prediction": "/predict_combined",
            "health_check": "/"
        },
        "features": [
            "Hybrid symptom extraction (Model + Rules)",
            "Disease prediction with confidence scores",
            "Severity assessment",
            "Care recommendations",
            "Image-based diagnosis",
            "Combined text + image analysis"
        ]
    }


@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models": {
            "text_model": {
                "loaded": text_model is not None,
                "path": TEXT_MODEL_DIR,
                "type": "Token Classification (NER)"
            },
            "image_model": {
                "loaded": image_model is not None,
                "path": IMAGE_MODEL_PATH if image_model else None,
                "input_shape": f"{H}x{W}x{C}" if image_model else None,
                "classes": len(class_names) if class_names else 0
            }
        },
        "knowledge_base": {
            "primary_symptoms": len(symptom_to_disease),
            "fallback_rules": len(fallback_rules),
            "severity_levels": len(severity_rules),
            "total_disease_mappings": sum(len(v) for v in symptom_to_disease.values())
        }
    }


@app.get("/symptoms")
def list_symptoms():
    """List all recognized symptoms"""
    all_symptoms = list(symptom_to_disease.keys()) + list(fallback_rules.keys())
    return {
        "count": len(all_symptoms),
        "symptoms": sorted(all_symptoms)
    }


@app.get("/diseases")
def list_diseases():
    """List all diseases in knowledge base"""
    all_diseases = set()
    for diseases_list in symptom_to_disease.values():
        all_diseases.update(diseases_list)
    for diseases_list in fallback_rules.values():
        all_diseases.update(diseases_list)
    
    return {
        "count": len(all_diseases),
        "diseases": sorted(list(all_diseases))
    }


@app.get("/severity_levels")
def severity_info():
    """Get information about severity levels"""
    return {
        "levels": list(severity_rules.keys()),
        "descriptions": {
            "emergency": "Life-threatening conditions requiring immediate emergency care",
            "urgent": "Serious conditions requiring medical attention within 24 hours",
            "moderate": "Conditions that should be evaluated by a healthcare provider soon",
            "mild": "Minor conditions that can be monitored at home"
        },
        "keywords_per_level": {
            level: len(keywords) for level, keywords in severity_rules.items()
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)