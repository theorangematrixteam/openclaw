# Sarah's Private Learnings

- **Scope**: private
- **Agent**: sarah
- **Created**: 2026-04-26
- **Updated**: 2026-04-26
- **Status**: draft

## LTX Video Lessons
- Manual sigmas (9 steps) are for REFINE pass only — never use for full generation
- CLIPLoader with type "ltxv" doesn't work — must use LTXAVTextEncoderLoader
- 2-stage upscale amplifies artifacts — skip for now
- Distilled LoRA at 0.5 gives speed but grainy results; at 0.3 slightly better
- Without distilled LoRA, results are hazy/foggy
- Best T2V so far: v11 (7/10) but still not great
- LTX 2.3 is fundamentally better at i2v than t2v
- Always QC generated video with gemma4 vision before sharing

## Jinay Preferences
- Wants me to check outputs myself (using vision model)
- Gets frustrated when results are bad — always QC before sharing
- Prefers I just fix things rather than explain what went wrong
- Values speed — don't spend too long on one approach before trying another