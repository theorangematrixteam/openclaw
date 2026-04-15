# Whisper Audio Transcription Skill

Provides local audio transcription using whisper.cpp.

## Location
- **Binary**: `tools/whisper/Release/whisper-cli.exe`
- **Model**: `tools/whisper/ggml-base.en.bin` (English base model, ~147MB)
- **Script**: `scripts/transcribe-audio.ps1`

## Usage

### Quick Transcription
```powershell
.\scripts\transcribe-audio.ps1 -AudioFile "path\to\audio.ogg"
```

### Supported Formats
- OGG (Discord voice messages)
- WAV
- MP3
- M4A
- FLAC
- Any format FFmpeg supports

### Model Options
- `ggml-tiny.en.bin` - Fastest, lowest accuracy (~39MB)
- `ggml-base.en.bin` - Good balance, current default (~147MB)
- `ggml-small.en.bin` - Better accuracy (~466MB)
- `ggml-medium.en.bin` - High accuracy (~1.5GB)
- `ggml-large-v3.bin` - Best accuracy, multilingual (~2.9GB)

Download models from: https://huggingface.co/ggerganov/whisper.cpp

### GPU Acceleration
Current build is CPU-only. For GPU support (CUDA/ROCm), download the appropriate build:
- `whisper-cublas-12.4.0-bin-x64.zip` - NVIDIA CUDA 12.4
- `whisper-cublas-11.8.0-bin-x64.zip` - NVIDIA CUDA 11.8

## Workflow for Voice Messages

1. Receive audio file (Discord saves to `media/inbound/`)
2. Convert to WAV using FFmpeg (16kHz mono)
3. Run whisper-cli with base.en model
4. Return transcription text

## Performance
- **CPU**: ~1 second for 2-second audio (base model)
- **GPU**: ~100ms for same audio (with CUDA)

## Notes
- First run loads model (~100ms overhead)
- Model stays in memory for subsequent transcriptions
- English-only model is faster and more accurate for English
- Use multilingual models for other languages