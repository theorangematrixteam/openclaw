import json
import subprocess
import sys

SPREADSHEET_ID = "1ILrr0xFBmm5G2tzdn_6Yh9XyF-IdmsAmRQNd6Tdq1Gg"
GOG = r"C:\Users\openclaw.BILLION-DOLLAR-\go\bin\gog.exe"

rows = [
    ["Notch India","2026-04","2026-04-15","Instagram","reel","Product Showcase","a woman walking with a text of coming soon for soft launch","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-16","Instagram","carousel","Product Showcase","photo of design on ipad put in aesthetic way, to show the glimpse","Planned","","","Pending","","",""] ,
    ["Notch India","2026-04","2026-04-17","Instagram","post","Product Showcase","labels photo like the one shared on whatsapp","Planned","","","Pending","","",""] ,
    ["Notch India","2026-04","2026-04-18","Instagram","reel","Trends","soft launch of the bag","Planned","","","Pending","","",""] ,
    ["Notch India","2026-04","2026-04-20","Instagram","carousel","Product Showcase","grid 1 photo 1","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-21","Instagram","post","Product Showcase","grid 1 photo 2","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-22","Instagram","reel","Trends","new reel","Planned","","","Pending","","",""] ,
    ["Notch India","2026-04","2026-04-23","Instagram","carousel","Product Showcase","grid 1 photo 3","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-24","Instagram","post","Product Showcase","grid 1 photo 4","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-25","Instagram","reel","Trends","Why Notch India","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-27","Instagram","carousel","Product Showcase","grid 1 photo 5","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-28","Instagram","post","Product Showcase","grid 1 photo 6","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-29","Instagram","reel","Trends","first collection in a reel","Approved","","","Approved","","",""] ,
    ["Notch India","2026-04","2026-04-30","Instagram","carousel","Product Showcase","grid 1 photo 7","Approved","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-01","Instagram","post","Product Showcase","grid 1 photo 8","Approved","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-02","Instagram","reel","Trends","product featured reel with just one product multi shots","Approved","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-04","Instagram","carousel","Product Showcase","grid 1 photo 9","Approved","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-05","Instagram","carousel","Product Showcase","grid 2 photo 1","Approved","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-06","Instagram","reel","Ugc/ reality","reel of a real person wearing it with good vibe and happiness","Planned","","","Pending","","",""] ,
    ["Notch India","2026-05","2026-05-07","Instagram","post","Product Showcase","grid 2 photo 2","Approved","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-08","Instagram","carousel","Product Showcase","grid 2 photo 3","Approved","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-09","Instagram","reel","Trends","new collection glimpse","Approved","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-11","Instagram","post","Product Showcase","grid 2 photo 4","In Creation","","","Approved","","",""] ,
    ["Notch India","2026-05","2026-05-13","Instagram","carousel","Product Showcase","grid 2 photo 5","In Creation","","","Approved","","",""] ,
    ["Proofit","2026-04","2026-04-15","Instagram","reel","Proof","Reel Idea: Don’t Buy Before This Check","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-16","Instagram","carousel","Fear","Carousel Idea: 5 Warning Signs Your New Flat Has Hidden Leakage","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-17","Instagram","post","Education","Post Idea: Why a Fresh Coat of Paint Can Hide Expensive Problems","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-18","Instagram","reel","Proof","Reel Idea: Heritage Buildings Need Inspection Too","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-20","Instagram","carousel","Fear","Carousel Idea: 4 Mistakes Buyers Make Before Possession Day","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-21","Instagram","post","Proof","Post Idea: What a Proofit Report Actually Gives You","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-22","Instagram","reel","Fear","Reel Idea: Summer Heat Can Make Hidden Damage Worse","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-23","Instagram","carousel","Proof","Carousel Idea: Inside a Real Dampness Detection Case","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-24","Instagram","post","Education","Post Idea: 3 Questions to Ask Before Buying a Resale Flat","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-25","Instagram","reel","Fear","Reel Idea: Would You Notice This Defect Before It Costs You?","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-27","Instagram","carousel","Proof","Carousel Idea: Why Summer Is the Best Time to Inspect Before Monsoon","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-28","Instagram","post","Fear","Post Idea: Hidden Water Damage Is Cheaper to Detect Than to Repair","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-29","Instagram","reel","Proof","Reel Idea: What Proofit Engineers Check in the First 10 Minutes","Planned","","","Pending","","",""] ,
    ["Proofit","2026-04","2026-04-30","Instagram","carousel","Fear","Carousel Idea: 5 Hidden Issues That Show Up Before Monsoon","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-01","Instagram","post","Education","Post Idea: Labour Day Reminder — Poor Workmanship Shows Up Later","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-02","Instagram","reel","Proof","Reel Idea: A Beautiful Flat Can Still Fail a Real Inspection","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-04","Instagram","carousel","Fear","Carousel Idea: Fire Risks You Cannot See in a New Home","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-05","Instagram","post","Proof","Post Idea: Real Confidence Comes from Knowing, Not Guessing","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-06","Instagram","reel","Fear","Reel Idea: 3 Hidden Defects That Buyers Usually Miss","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-07","Instagram","carousel","Proof","Carousel Idea: How Inspection Protects Indoor Air and Family Health","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-08","Instagram","post","Education","Post Idea: A Red Flag Ignored Today Becomes a Repair Bill Tomorrow","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-09","Instagram","reel","Fear","Reel Idea: Pre-Monsoon Is When Smart Homeowners Take Action","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-11","Instagram","carousel","Proof","Carousel Idea: Monsoon Readiness Checklist for Your Home","Planned","","","Pending","","",""] ,
    ["Proofit","2026-05","2026-05-13","Instagram","post","Fear","Post Idea: If Your Home Smells Damp, It Is Already Telling You Something","Planned","","","Pending","","",""]
]

payload = json.dumps(rows, ensure_ascii=False)
cmd = [
    GOG,
    "sheets", "append",
    SPREADSHEET_ID,
    "'content tracker'!A:N",
    "--values-json", payload,
]
res = subprocess.run(cmd, capture_output=True, text=True)
print(res.stdout)
print(res.stderr, file=sys.stderr)
sys.exit(res.returncode)
