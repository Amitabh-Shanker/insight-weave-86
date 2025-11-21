# BioBERT Medical NER Model

## Model Information
- **Base Model**: dmis-lab/biobert-base-cased-v1.1
- **Task**: Named Entity Recognition (NER) for Medical Text
- **Entity Types**: B-DISEASE, B-TREATMENT, I-DISEASE, I-TREATMENT, O
- **Training Date**: 2025-11-12 16:40:10

## Performance Metrics
- **F1 Score**: 1.0000
- **Precision**: 1.0000
- **Recall**: 1.0000
- **Accuracy**: 1.0000

## Training Details
- **Training Samples**: 10,709
- **Validation Samples**: 1,890
- **Training Time**: 26.2 minutes
- **Epochs**: 12
- **Batch Size**: 8


## Entity Types
- **B-DISEASE**: 12,852 occurrences
- **B-TREATMENT**: 2,603 occurrences
- **I-DISEASE**: 8,541 occurrences
- **I-TREATMENT**: 1,997 occurrences
- **O**: 81,745 occurrences

## Quick Start
```python
from transformers import pipeline

# Load model
ner = pipeline("ner", model="biobert_medical_ner", aggregation_strategy="simple")

# Extract entities
text = "Patient diagnosed with diabetes and prescribed metformin"
entities = ner(text)

for entity in entities:
    print(f"{entity['word']}: {entity['entity_group']} ({entity['score']:.3f})")
