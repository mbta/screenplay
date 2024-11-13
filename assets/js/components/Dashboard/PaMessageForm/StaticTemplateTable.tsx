import { StaticTemplate } from "Models/static_template";
import React, { useEffect, useState } from "react";
import { fetchStaticTemplates } from "Utils/api";

const StaticTemplateTable = () => {
  const [staticTemplates, setStaticTemplates] = useState<StaticTemplate[]>([]);

  useEffect(() => {
    fetchStaticTemplates().then(({ templates }) =>
      setStaticTemplates(templates),
    );
  }, []);

  return (
    <div>
      {staticTemplates.map((template) => (
        <div key={template.title}>{template.audio_text}</div>
      ))}
    </div>
  );
};

export default StaticTemplateTable;
