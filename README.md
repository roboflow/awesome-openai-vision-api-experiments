<h1 align="center">openai vision api experiments 🧪</h1>

## 👋 Hello

The must-have resource for anyone who wants to experiment with and build on the [OpenAI
Vision API](https://platform.openai.com/docs/guides/vision). This repository serves as
a hub for innovative experiments, showcasing a variety of applications ranging from
simple image classifications to advanced zero-shot learning models. It's a space for
both beginners and experts to explore the capabilities of the Vision API, share their
findings, and collaborate on pushing the boundaries of visual AI.

Experimenting with the OpenAI API requires an API 🔑. You can get one
[here](https://platform.openai.com/api-keys).

## ⚠️ Limitations

- 100 API requests per single API key per day.
- Can't be used for object detection or image segmentation. We can solve this problem by combining GPT-4V with foundational models like GroundingDINO or Segment Anything (SAM). Please take a look at the [example](https://github.com/roboflow/awesome-openai-vision-api-experiments/tree/main/experiments/gpt4v-grounding-dino-detection) and read our [blog post](https://blog.roboflow.com/dino-gpt-4v).

## 🧪 Experiments

| **experiment** | **complementary materials** | **authors** |
|:--------------:|:---------------------------:|:-----------:|
| WebcamGPT - chat with video stream | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/blob/main/experiments/webcam-gpt) [![Gradio](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/Roboflow/webcamGPT)  | @SkalskiP |
| HotDogGPT - simple image classification application | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/blob/main/experiments/hot-dog-not-hot-dog) [![Gradio](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/Roboflow/HotDogGPT)  | @SkalskiP |
| zero-shot image classifier with GPT-4V | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/tree/main/experiments/gpt4v-classification)   | @capjamesg |
| zero-shot object detection with GroundingDINO + GPT-4V | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/tree/main/experiments/gpt4v-grounding-dino-detection) [![Gradio](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/Roboflow/DINO-GPT4V)  | @capjamesg |
| GPT-4V vs. CLIP | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/tree/main/experiments/gpt4v-vs-clip)   | @capjamesg |
| GPT-4V with Set-of-Mark (SoM) | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/microsoft/SoM)   | Jianwei Yang, Hao Zhang, Feng Li, Xueyan Zou, Chunyuan Li, Jianfeng Gao |
| GPT-4V on Web | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/Jiayi-Pan/GPT-V-on-Web)   | @Jiayi-Pan |
| automated voiceover of NBA game | [![GitHub](https://badges.aleen42.com/src/github.svg)](https://github.com/roboflow/awesome-openai-vision-api-experiments/tree/main/experiments/automated-voiceover-of-nba-game)  [![Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/roboflow/awesome-openai-vision-api-experiments/blob/main/experiments/automated-voiceover-of-nba-game/notebook.ipynb) | @SkalskiP |

https://github.com/roboflow/awesome-openai-vision-api-experiments/assets/26109316/c63fa3c0-4564-49ee-8982-a9e6a23dae9b

## 🗞️ Must Read Papers

- [Set-of-Mark Prompting Unleashes Extraordinary Visual Grounding in GPT-4V](https://arxiv.org/abs/2310.11441)
by Jianwei Yang, Hao Zhang, Feng Li, Xueyan Zou, Chunyuan Li, Jianfeng Gao
- [The Dawn of LMMs: Preliminary Explorations with GPT-4V(ision)](https://arxiv.org/abs/2309.17421)
by Zhengyuan Yang, Linjie Li, Kevin Lin, Jianfeng Wang, Chung-Ching Lin, Zicheng Liu, Lijuan Wang
- [GPT-4 System Card](https://cdn.openai.com/papers/gpt-4-system-card.pdf) by OpenAI

## 🖊️ Blogs

- [How CLIP and GPT-4V Compare for Classification](https://blog.roboflow.com/clip-vs-gpt-4v/)
- [Experiments with GPT-4V for Object Detection](https://blog.roboflow.com/gpt-4v-object-detection/)
- [Distilling GPT-4 for Classification with an API](https://blog.roboflow.com/gpt-4-image-classification/)
- [DINO-GPT4-V: Use GPT-4V in a Two-Stage Detection Model](https://blog.roboflow.com/dino-gpt-4v/)
- [First Impressions with GPT-4V(ision)](https://blog.roboflow.com/gpt-4-vision/)

## 🦸 Contribution

We would love your help in making this repository even better! Whether you want to
add a new experiment or have any suggestions for improvement,
feel free to open an [issue](https://github.com/roboflow/awesome-openai-vision-api-experiments/issues)
or [pull request](https://github.com/roboflow/awesome-openai-vision-api-experiments/pulls).
