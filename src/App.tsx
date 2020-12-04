import React from 'react';

import { Switch, Route, HashRouter, Link } from 'react-router-dom';
import { FormatErrorParams } from 'yup';
import * as yup from 'yup';

import { Alert } from '@erkenningen/ui/components/alert';
import { GrowlProvider } from '@erkenningen/ui/components/growl';
import { ThemeKC } from '@erkenningen/ui/layout/theme';
import { ThemeContext } from '@erkenningen/ui/layout/theme';

import { UserContext, useAuth, Roles, hasOneOfRoles } from './shared/Auth';
import PlanningSelection from './components/PlanningSelection';
import './App.css';

// @TODO Move to lib?
yup.setLocale({
  mixed: {
    default: 'Ongeldig',
    required: 'Verplicht',
    notType: (params: FormatErrorParams) => {
      if (!params.value) {
        return 'Verplicht';
      }

      switch (params.type) {
        case 'number':
          return 'Moet een getal zijn';
        case 'date':
          return 'Verplicht';
        default:
          return 'Ongeldige waarde';
      }
    },
  },
  string: {
    email: 'Ongeldig e-mailadres',
    min: 'Minimaal ${min} karakters', // eslint-disable-line no-template-curly-in-string
    max: 'Maximaal ${max} karakters', // eslint-disable-line no-template-curly-in-string
  },
});

const App: React.FC<{}> = () => {
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
    <HashRouter>
      <UserContext.Provider value={auth.my}>
        <ThemeContext.Provider value={{ mode: 'admin' }}>
          <GrowlProvider>
            <ThemeKC>
              <Switch>
                <Route exact path="/" component={PlanningSelection} />
                {/* <Route
                  exact
                  path="/examen-resultaten-registreren/:id"
                  component={ResultRegistration}
                />
                <Route exact path="/gereed/:id" component={RegistrationComplete} /> */}
                <Route>
                  <p>Pagina niet gevonden (probeer /) </p>
                  <Link to="/">Ga naar het begin</Link>
                </Route>
              </Switch>
            </ThemeKC>
          </GrowlProvider>
        </ThemeContext.Provider>
      </UserContext.Provider>
    </HashRouter>
  );
};

export default App;
