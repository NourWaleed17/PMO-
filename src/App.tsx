import Activities from "./screens/Activities";
import Buildings from "./screens/Buildings";
import Layouts from "./screens/Layouts";
import Overview from "./screens/Overview";
import { useRoute } from "./routing/router";

function App() {
  const { pathname } = useRoute();
  if (pathname === "/layouts") return <Layouts />;
  if (pathname === "/activities") return <Activities />;
  if (pathname === "/buildings") return <Buildings />;
  return <Overview />;
}

export default App;
