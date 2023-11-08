<div align="center">
    <h1>awesome-openai-vision-api-experiments</h1>
</div>

https://github.com/roboflow/awesome-openai-vision-api-experiments/assets/26109316/8ae5d246-81dd-4c87-babd-5b7e48e1d2d0

## 👋 hello

A set of examples showing how to use the OpenAI vision API to run inference on images, 
video files and webcam streams.

## 💻 Install

```bash
# create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# install dependencies
pip install -r requirements.txt
```

## 🔑 Keys

Experimenting with the OpenAI API requires an API key. You can get one [here](https://platform.openai.com/api-keys).

## 🧪 Experiments

|       Experiment        |                   Description                    |                                                                                     Code                                                                                     |                                                                  HF Space                                                                  |
|:-----------------------:|:------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------:|
|        WebcamGPT        |              chat with video stream              |        [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/blob/main/experiments/webcam-gpt.py)         | [![HuggingFace](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/Roboflow/webcamGPT) |
| Grounding DINO + GPT-4V |   label images with Grounding DINO and GPT-4V    |      [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/tree/main/experiments/dino-gpt4v/app.py)       |                                                                                                                                            |
|  GPT-4V Classification  |           classify images with GPT-4V            | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/tree/main/experiments/gpt4v-classification/app.py)  |                                                                                                                                            |
|     GPT-4V vs. CLIP     | label images with Grounding DINO and Autodistill |      [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/tree/main/experiments/gpt4v-clip/app.py)       |                                                                                                                                            |
| Hot Dog or not Hot Dog  |           simple image classification            |    [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/blob/main/experiments/hot-dog-not-hot-dog.py)    | [![HuggingFace](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/Roboflow/HotDogGPT) |

## 🦸 Contribution
I would love your help in making this repository even better! Whether you want to 
correct a typo, add some new experiment, or if you have any suggestions for improvement,
feel free to open an [issue](https://github.com/roboflow/awesome-openai-vision-api-experiments/issues) 
or [pull request](https://github.com/roboflow/awesome-openai-vision-api-experiments/pulls).
