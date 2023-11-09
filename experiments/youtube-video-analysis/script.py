import argparse
import os
import re

from pytube import YouTube


def parse_arguments():
    parser = argparse.ArgumentParser(
        description='Analyse YouTube video with OpenAI Vision API')
    parser.add_argument(
        '--api_key',
        type=str,
        default=os.getenv('OPENAI_API_KEY'),
        help='OpenAI API key')
    parser.add_argument(
        '--youtube_url',
        type=str,
        help='URL of the YouTube video to analyse')
    parser.add_argument(
        '--probing_frequency',
        type=int,
        help='Probing frequency in seconds')
    return parser.parse_args()


def format_video_title(title: str) -> str:
    """
    Formats the video title by replacing spaces with hyphens, converting to lowercase,
    and removing special characters including commas, hash symbols, and hyphens.

    Args:
        title (str): The original video title.

    Returns:
        str: The formatted video title.
    """
    title = title.lower()
    title = re.sub(r'[^\w\s-]', '', title)
    title = re.sub(r'[-\s]+', '-', title)
    return title


def download_youtube_video(url: str, output_path: str = '.'):
    """
    Downloads a YouTube video to a specified output path.

    Args:
        url (str): URL of the YouTube video.
        output_path (str): Path where the video will be saved. Defaults to the current directory.
    """
    try:
        yt = YouTube(url)
        video_stream = yt.streams.filter(
            progressive=True,
            file_extension='mp4').order_by('resolution').desc().first()

        if video_stream:
            formatted_title = format_video_title(yt.title) + '.mp4'
            video_stream.download(output_path=output_path, filename=formatted_title)
            print(f"Video downloaded successfully: {formatted_title}")
            return formatted_title
        else:
            print("No suitable video stream found.")
    except Exception as e:
        print(f"An error occurred: {e}")





def main():
    args = parse_arguments()
    download_youtube_video(url=args.youtube_url)


if __name__ == '__main__':
    main()

