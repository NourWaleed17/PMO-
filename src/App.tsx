import Layouts from "./screens/Layouts";
import Overview from "./screens/Overview";
import { useRoute } from "./routing/router";

function App() {
  const [path] = useRoute();
  if (path === "/layouts") return <Layouts />;
  return <Overview />;
}

export default App;
