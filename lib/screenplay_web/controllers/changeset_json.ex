defmodule ScreenplayWeb.ChangesetJSON do
  import ScreenplayWeb.ErrorHelpers, only: [translate_error: 1]

  @doc """
  Renders changeset errors.
  """
  def error(%{changeset: changeset}) do
    # When encoded, the changeset returns its errors
    # as a JSON object. So we just pass it forward.
    %{errors: Ecto.Changeset.traverse_errors(changeset, &translate_error/1)}
  end
end
