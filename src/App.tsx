import { AppShell } from "./components/AppShell";
import Activities from "./screens/Activities";
import Buildings from "./screens/Buildings";
import Layouts from "./screens/Layouts";
import Overview from "./screens/Overview";
import Rates from "./screens/Rates";
import { ModelProvider } from "./data/ModelContext";
import { AuthProvider } from "./data/AuthContext";
import { LiveModelGate } from "./data/LiveModelGate";
import { RouteProvider, useRoute } from "./routing/router";

function App() {
  return (
    <AuthProvider>
      <LiveModelGate>
        {(liveModel) => (
          <RouteProvider>
            <ModelProvider initialModel={liveModel}>
              <AppShell>
                <Screen />
              </AppShell>
            </ModelProvider>
          </RouteProvider>
        )}
      </LiveModelGate>
    </AuthProvider>
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
