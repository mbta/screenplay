defimpl Jason.Encoder, for: [ScreensConfig.Screen] do
  alias ScreensConfig.Screen

  def encode(data, opts) do
    data
    |> Screen.to_json()
    |> Jason.Encoder.Map.encode(opts)
  end
end
