import { createRoot } from 'react-dom/client';

import { HashRouter } from 'react-router-dom';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';

import { ERKENNINGEN_GRAPHQL_API_URL } from '@erkenningen/config/dist/index';

import App from './App';

const cache = new InMemoryCache();

const client = new ApolloClient({
  link: new HttpLink({
    uri: ERKENNINGEN_GRAPHQL_API_URL,
    credentials: 'include',
  }),
  cache,
});

const container = document.getElementById('erkenningen-module-plan-inspections');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <ApolloProvider client={client}>
    <HashRouter>
      <App />
    </HashRouter>
  </ApolloProvider>,
);
