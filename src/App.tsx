import React from 'react';

import { Routes, Route, Link } from 'react-router-dom';

import { Alert } from '@erkenningen/ui/components/alert';
import { GrowlProvider } from '@erkenningen/ui/components/growl';
import { ThemeBureauErkenningen } from '@erkenningen/ui/layout/theme';
import { ThemeContext } from '@erkenningen/ui/layout/theme';

import { UserContext, useAuth, Roles, hasOneOfRoles } from './shared/Auth';
import PlanningSelection from './components/PlanningSelection';
import './App.css?url';

const App: React.FC = () => {
  const auth = useAuth();

  if (auth.loading) {
    return <p>Gegevens worden geladen...</p>;
  }

  if (auth.error) {
    return (
      <Alert type="danger">
        Er is een fout opgetreden bij het ophalen van de accountgegevens. Probeer het nog een keer
        of neem contact op met de helpdesk.
      </Alert>
    );
  }

  if (!auth.authenticated) {
    return <Alert type="danger">U moet ingelogd zijn om gegevens te bekijken.</Alert>;
  }

  if (!hasOneOfRoles([Roles.Rector, Roles.Inspecteur], auth.my?.Roles)) {
    return <Alert type="danger">U heeft geen toegang tot deze module.</Alert>;
  }

  return (
    <UserContext.Provider value={auth.my}>
      <ThemeContext.Provider value={{ mode: 'admin' }}>
        <GrowlProvider>
          <ThemeBureauErkenningen>
            <Routes>
              <Route path="/" element={<PlanningSelection />} />
              <Route
                path="*"
                element={
                  <>
                    <p>Pagina niet gevonden (probeer /) </p>
                    <Link to="/">Ga naar het begin</Link>
                  </>
                }
              ></Route>
            </Routes>
          </ThemeBureauErkenningen>
        </GrowlProvider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

export default App;
