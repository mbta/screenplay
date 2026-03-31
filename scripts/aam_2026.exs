# Script for processing Autism Acceptance Month 2026 PSAs

Mix.install([{:jason, "~> 1.4.0"}])

pcm_filename = fn str ->
  str
  |> String.replace(" merged", "")
  |> String.replace("2026", "")
  |> String.replace(" ", "")
  |> String.replace("_", "")
  |> String.replace(".wav", ".pcm")
  |> then(&("psa_aam_2026_" <> &1))
end

format_text = fn str ->
  new_str = str |> String.replace("\u2019", "'") |> String.replace("\u00a0", "")
  [] = String.to_charlist(new_str) |> Enum.filter(&(&1 > 128))
  new_str
end

templates_file = "assets/static/static_templates.json"

data = File.stream!("data.txt") |> Enum.map(&String.trim/1) |> Enum.chunk_every(3)

json = File.read!(templates_file) |> Jason.decode!(objects: :ordered_objects)

new_json =
  Enum.with_index(data, 21)
  |> Enum.map(fn {[title, text, file], id} ->
    Jason.OrderedObject.new(
      id: id,
      title: title,
      visual_text: format_text.(text),
      audio_url:
        "https://mbta-screens.s3.us-east-1.amazonaws.com/screens-prod/audio/#{pcm_filename.(file)}",
      type: "psa",
      archived: false
    )
  end)

(json ++ new_json)
|> Jason.encode!(pretty: true)
|> then(&File.write!(templates_file, &1 <> "\n"))

File.ls!("audios")
|> Enum.each(fn file ->
  System.cmd("ffmpeg", [
    "-i",
    "audios/#{file}",
    "-f",
    "s16le",
    "-acodec",
    "pcm_s16le",
    "-ar",
    "16000",
    "-ac",
    "1",
    "pcm_audios/#{pcm_filename.(file)}"
  ])
end)
