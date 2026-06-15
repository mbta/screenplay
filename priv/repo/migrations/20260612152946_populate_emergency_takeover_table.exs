defmodule Screenplay.Repo.Migrations.PopulateEmergencyTakeover do
  use Ecto.Migration

  def up do
    execute """
    INSERT INTO emergency_takeover (
      created_by, edited_by, cleared_by, cleared_at, start_time, end_time, stations, message, inserted_at, updated_at
    ) VALUES
    (
      'fake_uid',
      'fake_uid',
      NULL,
      NULL,
      '2026-05-26 14:21:59.524280+00',
      '2026-05-26 15:21:59.524280+00',
      ARRAY['Wonderland', 'Revere Beach'],
      '{"type": "custom", "text": {"indoor": "adfadf", "outdoor": "axxax"}}'::jsonb,
      NOW(),
      NOW()
    ),
    (
      'fake_uid',
      'fake_uid',
      'fake_uid',
      '2026-05-13 21:34:35.626410+00',
      '2026-05-12 19:38:15.548239+00',
      '2026-05-12 20:38:15.548239+00',
      ARRAY['Alewife', 'Broadway', 'Central', 'Charles/MGH', 'Davis', 'Harvard', 'JFK/UMass', 'Kendall/MIT', 'Porter', 'Quincy Center', 'South Station'],
      '{"id": 2, "type": "canned"}'::jsonb,
      NOW(),
      NOW()
    );
    """
  end

  # We specify `version: 1` in `down`, ensuring that we'll roll all the way back down if
  # necessary, regardless of which version we've migrated `up` to.
  def down do
    execute "TRUNCATE TABLE emergency_takeover;"
  end
end
