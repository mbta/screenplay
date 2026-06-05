import React, { useState } from "react";
import fp from "lodash/fp";
import { Button } from "react-bootstrap";
import { parse } from "csv-parse/browser/esm/sync";
import { createNewPaMessage } from "Utils/api";
import { useScreenplayState } from "Hooks/useScreenplayContext";
import { signDirection } from "../../util";
import Toast from "Components/Toast";

const gameDates = [
  {
    id: "6/13",
    start: new Date("2026-06-13T04:00:00"),
    end: new Date("2026-06-13T18:00:00"),
  },
  {
    id: "6/16",
    start: new Date("2026-06-16T04:00:00"),
    end: new Date("2026-06-16T15:00:00"),
  },
  {
    id: "6/19",
    start: new Date("2026-06-19T04:00:00"),
    end: new Date("2026-06-19T15:00:00"),
  },
  {
    id: "6/23",
    start: new Date("2026-06-23T04:00:00"),
    end: new Date("2026-06-23T13:00:00"),
  },
  {
    id: "6/26",
    start: new Date("2026-06-26T04:00:00"),
    end: new Date("2026-06-26T12:00:00"),
  },
  {
    id: "6/29",
    start: new Date("2026-06-29T04:00:00"),
    end: new Date("2026-06-29T13:30:00"),
  },
  {
    id: "7/09",
    start: new Date("2026-07-09T04:00:00"),
    end: new Date("2026-07-09T13:00:00"),
  },
];

const UploadPaMessages = () => {
  const [file, setFile] = useState<File>();
  const [dateId, setDateId] = useState(gameDates[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { places } = useScreenplayState();

  const submit = async () => {
    try {
      setLoading(true);
      const { start, end } = gameDates.find((item) => item.id === dateId)!;
      const contents = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(file!);
      });

      const placesLookup = fp.indexBy("name", places);
      const lookupSigns = (line: string, station: string, where: string) => {
        const place = placesLookup[station];
        if (!place) {
          throw new Error(`Couldn't find place named ${station}`);
        }
        return place.screens
          .filter(
            (screen) =>
              screen.type === "pa_ess" &&
              signDirection(screen) === where &&
              screen.routes![0].id.startsWith(line),
          )
          .map((screen) => screen.id);
      };
      const items = parse(contents).flatMap(
        ([line, station, left, middle, right]) => [
          { message: left, signIds: lookupSigns(line, station, "left") },
          { message: middle, signIds: lookupSigns(line, station, "middle") },
          { message: right, signIds: lookupSigns(line, station, "right") },
        ],
      );
      const groupedItems = Object.entries(
        fp.groupBy((item) => item.message, items),
      )
        .map(([message, items]) => ({
          message,
          signIds: items.flatMap((item) => item.signIds),
        }))
        .filter(({ message, signIds }) => message && signIds.length);

      await Promise.all(
        groupedItems.map(async ({ message, signIds }) => {
          const res = await createNewPaMessage({
            alert_id: null,
            start_datetime: start.toISOString(),
            end_datetime: end.toISOString(),
            days_of_week: [1, 2, 3, 4, 5, 6, 7],
            sign_ids: signIds,
            priority: 5,
            interval_in_minutes: 4,
            visual_text: message,
            audio_text: message,
            audio_url: "",
            message_type: null,
            template_id: null,
          });
          if (res.status !== 200) {
            throw JSON.stringify(res.errors);
          }
        }),
      );
      setResult("success");
      setFile(undefined);
    } catch (e) {
      setResult(e ? e.toString() : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-4">
      <h1 className="mb-5">Upload FIFA Messages</h1>
      <label htmlFor="csv-file" className="d-block">
        CSV file
      </label>
      <input
        id="csv-file"
        type="file"
        onChange={(e) => setFile(e.target.files?.[0])}
      />
      <label htmlFor="game-date" className="mt-4 d-block">
        Game date
      </label>
      <select
        id="game-date"
        value={dateId}
        onChange={(e) => setDateId(e.target.value)}
      >
        {gameDates.map(({ id }) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <div className="mt-4">
        <Button
          disabled={!file || loading}
          type="submit"
          className="button-primary"
          onClick={submit}
        >
          {loading ? "Loading..." : "Upload"}
        </Button>
      </div>
      <Toast message={result} variant="info" onClose={() => setResult(null)} />
    </div>
  );
};

export default UploadPaMessages;
