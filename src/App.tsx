import Activities from "./screens/Activities";
import Layouts from "./screens/Layouts";
import Overview from "./screens/Overview";
import { useRoute } from "./routing/router";

function App() {
  const { pathname } = useRoute();
  if (pathname === "/layouts") return <Layouts />;
  if (pathname === "/activities") return <Activities />;
  return <Overview />;
}

export default App;
