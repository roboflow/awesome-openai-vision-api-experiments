import cv2
import base64
import subprocess
import tempfile
import os
from elevenlabs import generate, set_api_key
from openai import OpenAI

# API Keys and File Paths
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
ELEVENLABS_API_KEY = os.environ["ELEVENLABS_API_KEY"]
VIDEO_FILE_PATH = 'wearable.mp4'
OUTPUT_FILE_PATH = 'output_with_audio.mp4'

# Set API keys
set_api_key(ELEVENLABS_API_KEY)
client = OpenAI(
    api_key=OPENAI_API_KEY,
)

def read_video_frames(video_path, skip_frames=10):
    video = cv2.VideoCapture(video_path)
    base64_frames = []
    frame_count = 0
    while video.isOpened():
        success, frame = video.read()
        if not success:
            break
        if frame_count % skip_frames == 0:
            _, buffer = cv2.imencode(".jpg", frame)
            base64_frames.append(base64.b64encode(buffer).decode("utf-8"))
        frame_count += 1
    video.release()
    return base64_frames

def generate_script(frames):
    prompt_messages = [
        {
            "role": "user",
            "content": [
                "These are frames of a video recorded from a person's point of view going through mundane life tasks. Create a short voiceover script in the style of a super excited sports narrator...",
                *map(lambda x: {"image": x, "resize": 768}, frames[0::10]),
            ],
        },
    ]
    result = client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=prompt_messages,
        max_tokens=500,
    )
    return result.choices[0].message.content

def shorten_script(script):
    prompt_messages = [
        {
            "role": "user",
            "content": f"Shorten this script so it can be read in about 30 seconds: {script}",
        }
    ]
    result = client.chat.completions.create(
        model="gpt-4",
        messages=prompt_messages,
        max_tokens=500,
    )
    return result.choices[0].message.content

def generate_audio(text):
    return generate(
        text=text,
        voice="Oliver",
        model='eleven_multilingual_v2'
    )

def merge_audio_with_video(audio, video_path, output_path):
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as audio_file:
        audio_file.write(audio)
        audio_filename = audio_file.name

    ffmpeg_command = [
        'ffmpeg', '-y', '-i', video_path, '-i', audio_filename,
        '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', output_path
    ]

    subprocess.run(ffmpeg_command)

# Main Process
frames = read_video_frames(VIDEO_FILE_PATH)
script = generate_script(frames)
short_script = shorten_script(script)
audio = generate_audio(short_script)
merge_audio_with_video(audio, VIDEO_FILE_PATH, OUTPUT_FILE_PATH)