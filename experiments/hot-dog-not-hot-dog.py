import base64

import cv2
import gradio as gr
import numpy as np
import requests

MARKDOWN = """
# 🌭 Hot Dog / Not Hot Dog (with OpenAI Vision API)

<p align="center">
    <img width="600" src="https://miro.medium.com/v2/resize:fit:650/1*VrpXE1hE4rO1roK0laOd7g.png" alt="hotdog">
</p>

Visit [awesome-openai-vision-api-experiments](https://github.com/roboflow/awesome-openai-vision-api-experiments) 
repository to find more OpenAI Vision API experiments or contribute your own.
"""
API_URL = "https://api.openai.com/v1/chat/completions"
CLASSES = ["🌭 Hot Dog", "❌ Not Hot Dog"]


def preprocess_image(image: np.ndarray) -> np.ndarray:
    image = np.fliplr(image)
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)


def encode_image_to_base64(image: np.ndarray) -> str:
    success, buffer = cv2.imencode('.jpg', image)
    if not success:
        raise ValueError("Could not encode image to JPEG format.")

    encoded_image = base64.b64encode(buffer).decode('utf-8')
    return encoded_image


def compose_payload(image: np.ndarray, prompt: str) -> dict:
    base64_image = encode_image_to_base64(image)
    return {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }


def compose_classification_prompt(classes: list) -> str:
    return (f"What is in the image? Return the class of the object in the image. Here "
            f"are the classes: {', '.join(classes)}. You can only return one class "
            f"from that list.")


def compose_headers(api_key: str) -> dict:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }


def prompt_image(api_key: str, image: np.ndarray, prompt: str) -> str:
    headers = compose_headers(api_key=api_key)
    payload = compose_payload(image=image, prompt=prompt)
    response = requests.post(url=API_URL, headers=headers, json=payload).json()

    if 'error' in response:
        raise ValueError(response['error']['message'])
    return response['choices'][0]['message']['content']


def classify_image(api_key: str, image: np.ndarray) -> str:
    if not api_key:
        raise ValueError(
            "API_KEY is not set. "
            "Please follow the instructions in the README to set it up.")
    image = preprocess_image(image=image)
    prompt = compose_classification_prompt(classes=CLASSES)
    response = prompt_image(api_key=api_key, image=image, prompt=prompt)
    return response


with gr.Blocks() as demo:
    gr.Markdown(MARKDOWN)
    api_key_textbox = gr.Textbox(
        label="🔑 OpenAI API", type="password")

    with gr.TabItem("Basic"):
        with gr.Column():
            input_image = gr.Image(
                image_mode='RGB', type='numpy', height=500)
            output_text = gr.Textbox(
                label="Output")
            submit_button = gr.Button("Submit")

        submit_button.click(
            fn=classify_image,
            inputs=[api_key_textbox, input_image],
            outputs=output_text)

    # with gr.TabItem("Advanced"):
    #     with gr.Column():
    #         advanced_clss_list = gr.Textbox(
    #             label="Comma-separated list of classes")
    #         advanced_input_image = gr.Image(
    #             image_mode='RGB', type='numpy', height=500)
    #         advanced_output_text = gr.Textbox(
    #             label="Output")
    #         advanced_submit_button = gr.Button("Submit")

demo.launch(debug=False, show_error=True)
