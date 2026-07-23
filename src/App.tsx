import Activities from "./screens/Activities";
import Buildings from "./screens/Buildings";
import Layouts from "./screens/Layouts";
import Overview from "./screens/Overview";
import Rates from "./screens/Rates";
import { ModelProvider } from "./data/ModelContext";
import { RouteProvider, useRoute } from "./routing/router";

function App() {
  return (
    <RouteProvider>
      <ModelProvider>
        <Screen />
      </ModelProvider>
    </RouteProvider>
  );
}

function Screen() {
  const { pathname } = useRoute();
  if (pathname === "/layouts") return <Layouts />;
  if (pathname === "/activities") return <Activities />;
  if (pathname === "/buildings") return <Buildings />;
  if (pathname === "/rates") return <Rates />;
  return <Overview />;
}

export default App;
