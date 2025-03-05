Faker.start()

alias Screenplay.Repo
alias Screenplay.PaMessages.PaMessage

all_sign_ids = ~w[
  park_st_eastbound park_st_winter_st_concourse park_st_westbound_wall_track park_st_westbound_fence_track
  hynes_eastbound hynes_westbound hynes_mezzanine amory_st_eastbound amory_st_westbound arlington_eastbound
  arlington_westbound arlington_mezzanine boylston_eastbound boylston_westbound green_government_center_eastbound
  green_government_center_westbound green_government_center_mezzanine copley_eastbound copley_westbound
  babcock_st_eastbound babcock_st_westbound kenmore_b_eastbound kenmore_b_westbound kenmore_c_d_eastbound
  kenmore_c_d_westbound kenmore_mezzanine newton_highlands_eastbound newton_highlands_westbound
  green_haymarket_eastbound green_haymarket_westbound chestnut_hill_eastbound chestnut_hill_westbound waban_eastbound
  waban_westbound beaconsfield_eastbound beaconsfield_westbound green_north_station_eastbound green_north_station_westbound
  green_north_station_commuter_rail_exit brookline_village_eastbound brookline_village_westbound fenway_eastbound
  fenway_westbound longwood_eastbound longwood_westbound union_sq_track_one union_sq_track_two union_sq_mezzanine
  riverside_entire_station lechmere_green_line_eastbound lechmere_green_line_westbound lechmere_green_line_mezzanine
  reservoir_eastbound reservoir_westbound woodland_eastbound woodland_westbound eliot_eastbound eliot_westbound
  science_park_eastbound science_park_westbound science_park_mezzanine brookline_hills_eastbound brookline_hills_westbound
  newton_centre_eastbound newton_centre_westbound ball_square_eastbound ball_square_westbound ball_square_mezzanine
  college_ave_eastbound college_ave_westbound college_ave_mezzanine gilman_square_eastbound gilman_square_westbound
  gilman_square_mezzanine magoun_square_eastbound magoun_square_westbound magoun_square_mezzanine prudential_eastbound
  prudential_westbound prudential_mezzanine east_somerville_eastbound east_somerville_westbound east_somerville_mezzanine
  symphony_eastbound symphony_westbound broadway_mezzanine broadway_northbound broadway_southbound
  red_downtown_crossing_northbound red_downtown_crossing_southbound andrew_mezzanine andrew_northbound andrew_southbound
  red_park_st_northbound red_park_st_southbound red_park_st_center charles_mgh_northbound charles_mgh_southbound
  braintree_center_northbound braintree_mezzanine_northbound central_northbound central_southbound
  jfk_umass_ashmont_platform_southbound jfk_umass_braintree_platform_southbound jfk_umass_ashmont_platform_northbound
  jfk_umass_braintree_platform_northbound jfk_umass_mezzanine wollaston_mezzanine wollaston_northbound wollaston_southbound
  davis_mezzanine davis_northbound davis_southbound north_quincy_mezzanine north_quincy_northbound north_quincy_southbound
  red_south_station_mezzanine red_south_station_northbound red_south_station_southbound
  south_station_silver_line_arrival_platform porter_mezzanine porter_northbound porter_southbound shawmut_mezzanine
  shawmut_northbound shawmut_southbound quincy_adams_mezzanine quincy_adams_northbound quincy_adams_southbound
  ashmont_mezzanine red_ashmont_northbound harvard_mezzanine harvard_northbound harvard_southbound savin_hill_mezzanine
  savin_hill_northbound savin_hill_southbound kendall_mit_northbound kendall_mit_southbound alewife_center_southbound
  alewife_mezzanine_southbound fields_corner_mezzanine fields_corner_northbound fields_corner_southbound
  quincy_center_mezzanine quincy_center_northbound quincy_center_southbound orange_downtown_crossing_northbound
  orange_downtown_crossing_southbound jackson_square_mezzanine jackson_square_northbound jackson_square_southbound
  stony_brook_mezzanine stony_brook_northbound stony_brook_southbound orange_haymarket_mezzanine orange_haymarket_northbound
  orange_haymarket_southbound ruggles_northbound ruggles_southbound ruggles_center ruggles_mezzanine ruggles_upper_busway
  community_college_mezzanine community_college_northbound community_college_southbound tufts_mezzanine tufts_northbound
  tufts_southbound wellington_mezzanine wellington_northbound wellington_southbound sullivan_mezzanine sullivan_northbound
  sullivan_southbound green_street_mezzanine green_street_northbound green_street_southbound orange_north_station_northbound
  orange_north_station_southbound orange_north_station_mezzanine orange_north_station_commuter_rail_exit
  oak_grove_mezzanine_southbound oak_grove_east_busway oak_grove_platform orange_state_mezzanine orange_state_northbound
  orange_state_southbound chinatown_northbound_lobby chinatown_southbound_lobby chinatown_northbound chinatown_southbound
  mass_ave_mezzanine mass_ave_northbound mass_ave_southbound malden_lobby malden_center_platform roxbury_crossing_mezzanine
  roxbury_crossing_northbound roxbury_crossing_southbound assembly_mezzanine assembly_northbound assembly_southbound
  forest_hills_main_lobby forest_hills_platform forest_hills_entrances_from_busways back_bay_mezzanine back_bay_northbound
  back_bay_southbound wood_island_eastbound wood_island_mezzanine wood_island_westbound orient_heights_eastbound
  orient_heights_mezzanine orient_heights_westbound suffolk_downs_eastbound suffolk_downs_westbound airport_eastbound
  airport_westbound aquarium_eastbound aquarium_mezzanine aquarium_westbound government_center_eastbound
  government_center_mezzanine government_center_westbound bowdoin_eastbound bowdoin_drop_off bowdoin_mezzanine
  wonderland_westbound wonderland_mezzanine lab_test state_blue_eastbound state_blue_mezzanine state_blue_westbound
  maverick_eastbound maverick_westbound beachmont_eastbound beachmont_westbound revere_beach_eastbound revere_beach_mezzanine
  revere_beach_westbound milton_outbound milton_inbound central_avenue_outbound central_avenue_inbound capen_street_inbound
  red_ashmont_southbound valley_road_outbound valley_road_inbound butler_center cedar_grove_outbound cedar_grove_inbound
  Silver_Line.Box_District_OB Silver_Line.Box_District_IB Silver_Line.Chelsea_IB Silver_Line.Eastern_Ave_OB
  Silver_Line.Eastern_Ave_IB Silver_Line.South_Station_EB Silver_Line.Courthouse_WB Silver_Line.Courthouse_EB
  Silver_Line.Courthouse_mezz Silver_Line.World_Trade_Ctr_WB Silver_Line.World_Trade_Ctr_EB Silver_Line.World_Trade_Ctr_mezz
  bus.Nubian_Platform_E_east Silver_Line.Bellingham_Square_OB Silver_Line.Bellingham_Square_IB bus.Braintree
  bus.Mattapan_north bus.Mattapan_south bus.Davis bus.Harvard_upper bus.Harvard_lower bus.Lechmere_inner bus.Lechmere_outer
  bus.Nubian_Platform_A bus.Nubian_Platform_C bus.Nubian_Platform_D bus.Nubian_Platform_E_west bus.Nubian_Platform_F
  bus.Forest_Hills_upper_island bus.Forest_Hills_upper_fence
]

defmodule Random do
  @all_sign_ids all_sign_ids

  def sign_ids(n \\ Enum.random(1..24)) do
    Faker.Util.sample_uniq(n, fn -> Enum.random(@all_sign_ids) end)
  end

  def priority do
    Enum.random([1, 3, 4, 5])
  end

  def text do
    Faker.Lorem.paragraph()
  end

  def start_and_end_datetimes(window \\ 7) do
    start_datetime = window |> Faker.DateTime.backward() |> DateTime.truncate(:second)
    end_datetime = window |> Faker.DateTime.forward() |> DateTime.truncate(:second)

    {start_datetime, end_datetime}
  end

  def past_start_and_end_datetimes(window \\ 7) do
    {start_datetime, end_datetime} = start_and_end_datetimes(window)

    {DateTime.add(start_datetime, -window, :day), DateTime.add(end_datetime, -window, :day)}
  end

  def future_start_and_end_datetimes(window \\ 7) do
    {start_datetime, end_datetime} = start_and_end_datetimes(window)

    {DateTime.add(start_datetime, window, :day), DateTime.add(end_datetime, window, :day)}
  end

  def days_of_week do
    weekdays = [1, 2, 3, 4, 5]
    weekends = [6, 7]
    all_days = weekdays ++ weekends
    select_days = Faker.Util.sample_uniq(Faker.random_between(1, 7), fn -> Enum.random(1..7) end)

    Enum.random([weekdays, weekends, all_days, select_days])
  end
end

# Past PaMessages
for _ <- 1..100 do
  {start_datetime, end_datetime} = Random.past_start_and_end_datetimes()
  text = Random.text()

  Repo.insert!(%PaMessage{
    start_datetime: start_datetime,
    end_datetime: end_datetime,
    sign_ids: Random.sign_ids(),
    priority: Random.priority(),
    days_of_week: Random.days_of_week(),
    interval_in_minutes: 4,
    visual_text: text,
    audio_text: text
  })
end

# Current PaMessages
for _ <- 1..100 do
  {start_datetime, end_datetime} = Random.start_and_end_datetimes()
  text = Random.text()

  Repo.insert!(%PaMessage{
    start_datetime: start_datetime,
    end_datetime: end_datetime,
    sign_ids: Random.sign_ids(),
    priority: Random.priority(),
    days_of_week: Random.days_of_week(),
    interval_in_minutes: 4,
    visual_text: text,
    audio_text: text
  })
end

# Future PaMessages
for _ <- 1..100 do
  {start_datetime, end_datetime} = Random.future_start_and_end_datetimes()
  text = Random.text()

  Repo.insert!(%PaMessage{
    start_datetime: start_datetime,
    end_datetime: end_datetime,
    sign_ids: Random.sign_ids(),
    priority: Random.priority(),
    days_of_week: Random.days_of_week(),
    interval_in_minutes: 4,
    visual_text: text,
    audio_text: text
  })
end
