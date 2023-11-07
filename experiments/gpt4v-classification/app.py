from autodistill_gpt_4v import GPT4V
from autodistill.detection import CaptionOntology

base_model = GPT4V(
    ontology=CaptionOntology(
        {
            "salmon": "salmon",
            "carp": "carp"
        }
    )
)

result = base_model.predict("fish.jpg", base_model.ontology.prompts())

class_result = base_model.ontology.prompts()[result.get_top_k(1).class_id]
print(class_result)