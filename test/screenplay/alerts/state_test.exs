defmodule Screenplay.Alerts.StateTest do
  use ExUnit.Case

  alias Screenplay.Alerts.{Alert, State}

  describe "get_all_alerts/1" do
    test "returns all alerts" do
      {:ok, alerts_server} = start_supervised({State, [name: :get_all_alerts_test]})

      alert = %Alert{
        id: "alert",
        message: %{type: :canned, id: 1},
        stations: ["Back Bay"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      alerts = %{alert.id => alert}
      state = %State{alerts: alerts}

      :sys.replace_state(alerts_server, fn _state -> state end)
      assert State.get_all_alerts(alerts_server) == [alert]
    end
  end

  describe "add_alert/2" do
    test "returns error message when given an alert with id nil" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      alert = %Alert{
        id: nil,
        message: %{type: :canned, id: 1},
        stations: ["South Station"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      assert {:error, _} = State.add_alert(pid, alert)
    end

    test "adds alert" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      alert = %Alert{
        id: "alert",
        message: %{type: :canned, id: 1},
        stations: ["South Station"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      assert :ok == State.add_alert(pid, alert)

      expected_state = %State{
        alerts: %{
          "alert" => %Alert{
            id: "alert",
            message: %{type: :canned, id: 1},
            stations: ["South Station"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            created_by: "user",
            edited_by: "user"
          }
        }
      }

      assert expected_state == :sys.get_state(pid)
    end
  end

  describe "update_alert/3" do
    test "updates existing alert" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      a1 = %Alert{
        id: "a1",
        message: %{type: :canned, id: 1},
        stations: ["Haymarket", "Government Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      a2 = %Alert{
        id: "a2",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["Kendall/MIT"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      alerts = %{"a1" => a1, "a2" => a2}
      state = %State{alerts: alerts}

      :sys.replace_state(pid, fn _state -> state end)

      new_alert = %Alert{
        id: "a2",
        message: %{type: :custom, text: "All clear now"},
        stations: ["Kendall/MIT"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      assert :ok == State.update_alert(pid, "a2", new_alert)

      expected_state = %State{
        alerts: %{
          "a1" => %Alert{
            id: "a1",
            message: %{type: :canned, id: 1},
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            stations: ["Haymarket", "Government Center"],
            created_by: "user",
            edited_by: "user"
          },
          "a2" => %Alert{
            id: "a2",
            message: %{text: "All clear now", type: :custom},
            schedule: %{end: ~U[2021-08-19 17:39:42Z], start: ~U[2021-08-19 17:09:42Z]},
            stations: ["Kendall/MIT"],
            created_by: "user",
            edited_by: "user"
          }
        }
      }

      assert expected_state == :sys.get_state(pid)
    end
  end

  describe "delete_alert/2" do
    test "deletes the indicated alert" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      a1 = %Alert{
        id: "a1",
        message: %{type: :canned, id: 1},
        stations: ["Haymarket", "Government Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      a2 = %Alert{
        id: "a2",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["Kendall/MIT"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      alerts = %{"a1" => a1, "a2" => a2}
      state = %State{alerts: alerts}

      :sys.replace_state(pid, fn _state -> state end)

      assert :ok == State.delete_alert(pid, "a1")

      expected_state = %State{
        alerts: %{
          "a2" => %Alert{
            id: "a2",
            message: %{text: "This is an alert", type: :custom},
            schedule: %{end: ~U[2021-08-19 17:39:42Z], start: ~U[2021-08-19 17:09:42Z]},
            stations: ["Kendall/MIT"],
            created_by: "user",
            edited_by: "user"
          }
        }
      }

      assert expected_state == :sys.get_state(pid)
    end
  end

  describe "remove_overlapping_alerts/2" do
    test "deletes the overlapping alert with one station" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      a1 = %Alert{
        id: "a1",
        message: %{type: :canned, id: 1},
        stations: ["Haymarket", "Government Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      a2 = %Alert{
        id: "a2",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["Kendall/MIT"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      params = %{
        "id" => nil,
        "stations" => ["South Station", "Kendall/MIT"]
      }

      user = "bar"

      alerts = %{"a1" => a1, "a2" => a2}
      state = %State{alerts: alerts}

      :sys.replace_state(pid, fn _state -> state end)

      assert ["Kendall/MIT"] ==
               State.remove_overlapping_alerts(pid, params, user, ~U[2021-08-19 17:19:42Z])

      expected_state = %State{
        alerts: %{
          "a1" => %Alert{
            id: "a1",
            message: %{type: :canned, id: 1},
            stations: ["Haymarket", "Government Center"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            created_by: "user",
            edited_by: "user"
          }
        }
      }

      assert expected_state == :sys.get_state(pid)
    end

    test "deletes the overlapping alert with multiple stations" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      a1 = %Alert{
        id: "a1",
        message: %{type: :canned, id: 1},
        stations: ["Haymarket", "Government Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      a2 = %Alert{
        id: "a2",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["South Station", "Kendall/MIT"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      params = %{
        "id" => nil,
        "stations" => ["South Station", "Kendall/MIT"]
      }

      user = "bar"

      alerts = %{"a1" => a1, "a2" => a2}
      state = %State{alerts: alerts}

      :sys.replace_state(pid, fn _state -> state end)

      assert ["South Station", "Kendall/MIT"] ==
               State.remove_overlapping_alerts(pid, params, user, ~U[2021-08-19 17:19:42Z])

      expected_state = %State{
        alerts: %{
          "a1" => %Alert{
            id: "a1",
            message: %{type: :canned, id: 1},
            stations: ["Haymarket", "Government Center"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            created_by: "user",
            edited_by: "user"
          }
        }
      }

      assert expected_state == :sys.get_state(pid)
    end

    test "does not delete alert if no overlap" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      a1 = %Alert{
        id: "a1",
        message: %{type: :canned, id: 1},
        stations: ["Haymarket", "Government Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      a2 = %Alert{
        id: "a2",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["Kendall/MIT"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      params = %{
        "id" => nil,
        "stations" => ["South Station"]
      }

      user = "bar"

      alerts = %{"a1" => a1, "a2" => a2}
      state = %State{alerts: alerts}

      :sys.replace_state(pid, fn _state -> state end)

      assert [] ==
               State.remove_overlapping_alerts(pid, params, user, ~U[2021-08-19 17:19:42Z])

      expected_state = %State{
        alerts: %{
          "a1" => %Alert{
            id: "a1",
            message: %{type: :canned, id: 1},
            stations: ["Haymarket", "Government Center"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            created_by: "user",
            edited_by: "user"
          },
          "a2" => %Alert{
            id: "a2",
            message: %{type: :custom, text: "This is an alert"},
            stations: ["Kendall/MIT"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            created_by: "user",
            edited_by: "user"
          }
        }
      }

      assert expected_state == :sys.get_state(pid)
    end

    test "does not delete alert if inactive" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      a1 = %Alert{
        id: "a1",
        message: %{type: :canned, id: 1},
        stations: ["Haymarket", "Government Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      a2 = %Alert{
        id: "a2",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["Kendall/MIT"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:10:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      params = %{
        "id" => nil,
        "stations" => ["Kendall/MIT"]
      }

      user = "bar"

      alerts = %{"a1" => a1, "a2" => a2}
      state = %State{alerts: alerts}

      :sys.replace_state(pid, fn _state -> state end)

      assert [] ==
               State.remove_overlapping_alerts(pid, params, user, ~U[2021-08-19 17:19:42Z])

      expected_state = %State{
        alerts: %{
          "a1" => %Alert{
            id: "a1",
            message: %{type: :canned, id: 1},
            stations: ["Haymarket", "Government Center"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            created_by: "user",
            edited_by: "user"
          },
          "a2" => %Alert{
            id: "a2",
            message: %{type: :custom, text: "This is an alert"},
            stations: ["Kendall/MIT"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:10:42Z]},
            created_by: "user",
            edited_by: "user"
          }
        }
      }

      assert expected_state == :sys.get_state(pid)
    end

    test "removes stations from existing alert if another station exists" do
      {:ok, pid} = GenServer.start_link(State, :empty, [])

      a1 = %Alert{
        id: "a1",
        message: %{type: :canned, id: 1},
        stations: ["Haymarket", "Government Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      a2 = %Alert{
        id: "a2",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["South Station", "Kendall/MIT"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user"
      }

      params = %{
        "id" => nil,
        "stations" => ["Kendall/MIT"]
      }

      user = "bar"

      alerts = %{"a1" => a1, "a2" => a2}
      state = %State{alerts: alerts}

      :sys.replace_state(pid, fn _state -> state end)

      assert ["Kendall/MIT"] ==
               State.remove_overlapping_alerts(pid, params, user, ~U[2021-08-19 17:19:42Z])

      expected_state = %State{
        alerts: %{
          "a1" => %Alert{
            id: "a1",
            message: %{type: :canned, id: 1},
            stations: ["Haymarket", "Government Center"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            created_by: "user",
            edited_by: "user"
          },
          "a2" => %Alert{
            id: "a2",
            message: %{type: :custom, text: "This is an alert"},
            stations: ["South Station"],
            schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
            created_by: "user",
            edited_by: "bar"
          }
        }
      }

      assert expected_state == :sys.get_state(pid)
    end
  end

  describe "to_json/1" do
    a1 = %Alert{
      id: "a1",
      message: %{type: :canned, id: 1},
      stations: ["Haymarket", "Government Center"],
      schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
      created_by: "user",
      edited_by: "user"
    }

    a2 = %Alert{
      id: "a2",
      message: %{type: :custom, text: "This is an alert"},
      stations: ["Kendall/MIT"],
      schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
      created_by: "user",
      edited_by: "user"
    }

    alerts = %{"a1" => a1, "a2" => a2}
    state = %State{alerts: alerts}

    assert %{
             "alerts" => [
               %{"id" => "a1"},
               %{"id" => "a2"}
             ]
           } = State.to_json(state)
  end

  describe "from_json/1" do
    json = %{
      "alerts" => [
        %{
          "id" => "a1",
          "message" => %{"id" => 1, "type" => "canned"},
          "schedule" => %{"start" => "2021-08-19T17:09:42Z", "end" => "2021-08-19T17:39:42Z"},
          "stations" => ["Haymarket", "Government Center"],
          "created_by" => "user",
          "edited_by" => "user"
        },
        %{
          "id" => "a2",
          "message" => %{"text" => "This is an alert", "type" => "custom"},
          "schedule" => %{"start" => "2021-08-19T17:09:42Z", "end" => "2021-08-19T17:39:42Z"},
          "stations" => ["Kendall/MIT"],
          "created_by" => "user",
          "edited_by" => "user"
        }
      ]
    }

    assert %State{
             alerts: %{
               "a1" => %Alert{id: "a1"},
               "a2" => %Alert{id: "a2"}
             }
           } = State.from_json(json)
  end
end
