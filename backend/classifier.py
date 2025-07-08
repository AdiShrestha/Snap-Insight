import joblib
from simpletransformers.classification import ClassificationModel
import warnings
import os
import multiprocessing

# Disable warnings and set multiprocessing context
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Set the start method for multiprocessing
try:
    multiprocessing.set_start_method('spawn')
except RuntimeError:
    pass  # Already set

class TextClassifier:
    def __init__(self, 
                 model_path: str = 'models/module/classifier',
                 label_encoder_path: str = 'models/module/label_encoder.pkl'):
        # Configure model to avoid multiprocessing issues
        self.model = ClassificationModel(
            'roberta',
            model_path,
            use_cuda=False,
            args={
                'process_count': 1,  # Disable multiprocessing
                'use_multiprocessing': False,
                'use_multiprocessing_for_evaluation': False
            }
        )
        self.label_encoder = joblib.load(label_encoder_path)

    def classify(self, text: str) -> str:
        """Returns ONLY the predicted category"""
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            predictions, _ = self.model.predict([text])
        return self.label_encoder.inverse_transform([int(predictions[0])])[0]

def classify_user_input(user_text: str) -> str:
    classifier = TextClassifier()
    return classifier.classify(user_text)