from autodistill_gpt_4v import GPT4V
from autodistill.detection import CaptionOntology
from autodistill_clip import CLIP

prompts = ["chicago deep dish pizza", "pizza"]

ontology = CaptionOntology(
    {k: k for k in prompts}
)

clip_model = CLIP(ontology=ontology)

clip_result = clip_model.predict("deep-dish.jpg")

class_result = prompts[clip_result.class_id[0]]

print("CLIP result: ", class_result)

gpt_4v_model = GPT4V(ontology=ontology)

gpt_result = gpt_4v_model.predict("deep-dish.jpg", gpt_4v_model.ontology.prompts())

class_result = prompts[gpt_result.class_id[0]]
print("GPT-4-V result: ", class_result)
