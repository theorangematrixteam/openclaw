# Row by row approach - cleaner
$rows = @(
  @("2026-04-07","Monday","","carousel","Case Study","Planned","How we took Proofit from scattered to systemised content","","Concept: Show the before vs after. Prove we build systems.","DM us to build your content system","Instagram, LinkedIn"),
  @("2026-04-08","Tuesday","","reel","BTS","Planned","What goes into one carousel for Notch India","","Concept: BTS showing process. Prove execution depth.","Let us handle your content","Instagram, X"),
  @("2026-04-09","Wednesday","","post","Education","Planned","3 tools we use to create high-end visuals","","Concept: Share tools but gatekeep enough.","We use these so you dont have to","Instagram, LinkedIn, X"),
  @("2026-04-10","Thursday","","carousel","Case Study","Planned","The difference between good and great content","","Concept: Side-by-side basic vs styled. Show creative direction.","Your brand deserves better content","Instagram, LinkedIn"),
  @("2026-04-11","Friday","","reel","BTS","Planned","A day in the life of a creative director","","Concept: Real work footage. Humanise the agency.","Work with us","Instagram, YouTube Shorts"),
  @("2026-04-12","Saturday","","post","Proof","Planned","This month we shipped 39 posts across 2 clients","","Concept: Simple stats graphic. Prove output.","We ship. You grow.","Instagram, LinkedIn, X"),
  @("2026-04-13","Sunday","","carousel","Education","Planned","Why most brand content fails","","Concept: 5 common mistakes and solutions.","Stop wasting content budget","Instagram, LinkedIn"),
  @("2026-04-14","Monday","","reel","Case Study","Planned","From brief to delivered: Notch India breakdown","","Concept: Journey from brief to final.","We do the work you approve","Instagram, X, YouTube Shorts"),
  @("2026-04-15","Tuesday","","post","BTS","Planned","What creative direction actually means","","Concept: Explain full scope. Elevate value.","We direct. We produce. We manage.","Instagram, LinkedIn"),
  @("2026-04-16","Wednesday","","carousel","Case Study","Planned","Proofit content plan: why each post exists","","Concept: Strategic reasons behind posts.","Your content should have reasons","Instagram, LinkedIn"),
  @("2026-04-17","Thursday","","reel","Education","Planned","The one thing that fixes 80 percent of problems","","Concept: Consistency plus strategy.","DM us if tired of random posting","Instagram, X, YouTube Shorts"),
  @("2026-04-18","Friday","","post","Proof","Planned","We manage platforms so you dont have to","","Concept: List platforms managed.","You focus on business. We focus on brand.","Instagram, LinkedIn, X"),
  @("2026-04-19","Saturday","","carousel","BTS","Planned","How we plan a month of content","","Concept: Step-by-step process.","Let us build your content system","Instagram, LinkedIn"),
  @("2026-04-20","Sunday","","reel","Case Study","Planned","Notch India soft launch: how we built hype","","Concept: Visuals built anticipation.","Launching a brand? Lets talk.","Instagram, YouTube Shorts"),
  @("2026-04-21","Monday","","post","Education","Planned","The difference between content and strategy","","Concept: Content is what. Strategy is why.","Strategy first. Content second.","Instagram, LinkedIn, X"),
  @("2026-04-22","Tuesday","","carousel","Proof","Planned","Whats in an Orange Matrix content plan","","Concept: Show structure and columns.","We dont do random content.","Instagram, LinkedIn"),
  @("2026-04-23","Wednesday","","reel","BTS","Planned","How we edit a reel from start to finish","","Concept: Speed-run editing process.","We create. We edit. We ship.","Instagram, X, YouTube Shorts"),
  @("2026-04-24","Thursday","","post","Case Study","Planned","How we helped a brand clarify positioning","","Concept: Real anonymised story.","Book a strategy session","Instagram, LinkedIn, X"),
  @("2026-04-25","Friday","","carousel","Education","Planned","5 signs your brand needs a content partner","","Concept: Signs and solution framing.","Check these signs? Lets talk.","Instagram, LinkedIn"),
  @("2026-04-26","Saturday","","reel","Proof","Planned","This is what 1 month of Orange Matrix looks like","","Concept: Montage of output.","Ready to grow?","Instagram, YouTube Shorts"),
  @("2026-04-27","Sunday","","post","BTS","Planned","Why we keep client knowledge files","","Concept: Stored positioning and tone.","We study before we create.","Instagram, LinkedIn, X"),
  @("2026-04-28","Monday","","carousel","Case Study","Planned","What changed when we took over Notch India","","Concept: Before vs after visually.","Your brand can look this intentional","Instagram, LinkedIn"),
  @("2026-04-29","Tuesday","","reel","Education","Planned","The one mistake founders make with content","","Concept: Content as afterthought mistake.","Fix your content system","Instagram, X, YouTube Shorts"),
  @("2026-04-30","Wednesday","","post","Proof","Planned","We dont just plan. We produce. We manage.","","","Concept: Reinforce full-service position.","One partner. Full creative direction.","Instagram, LinkedIn, X")
)

# Build proper JSON array
$jsonArray = [System.Collections.ArrayList]::new()
foreach ($row in $rows) {
  $jsonArray.Add($row) | Out-Null
}

# Convert to JSON
$jsonBody = $jsonArray | ConvertTo-Json -Depth 10 -Compress

# Write to file
$jsonBody | Out-File -FilePath "C:\Users\openclaw.BILLION-DOLLAR-\.openclaw\workspace\temp-rows.json" -Encoding utf8NoBOM

Write-Host $jsonBody