import React from "react";
import SimpleForm from "./SimpleForm";

interface AppProps {
  name: string;
}

const App = (props: AppProps): JSX.Element => {
  return (
    <section>
      <SimpleForm />
    </section>
  );
};

export default App;