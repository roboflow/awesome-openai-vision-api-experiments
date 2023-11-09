from autodistill_gpt_4v import GPT4V
from autodistill.detection import CaptionOntology
from autodistill_grounding_dino import GroundingDINO
from autodistill.utils import plot

from autodistill.core.custom_detection_model import CustomDetectionModel
import cv2

classes = ["mercedes", "toyota"]


DINOGPT = CustomDetectionModel(
    detection_model=GroundingDINO(
        CaptionOntology({"car": "car"})
    ),
    classification_model=GPT4V(
        CaptionOntology({k: k for k in classes})
    )
)

IMAGE = "mercedes.jpeg"

results = DINOGPT.predict(IMAGE)

plot(
    image=cv2.imread(IMAGE),
    detections=results,
    classes=["mercedes", "toyota", "car"]
)
