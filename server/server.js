const express = require('express');
const path = require('path');
const db = require('./config/connection');
const {ApolloServer} = require('apollo-server-express');
const {typeDefs, resolvers} = require('./schema');
const {authMiddleware} = require('./utils/auth');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
  
});
// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

const startServer = async () => {
  await server.start();   
  server.applyMiddleware({app});
  db.once('open', () => {
      db.on('error', err => {
          console.error('MongoDB connection error: ', err);
      });
      app.listen(PORT, () => {
          console.log(`API server running on port ${PORT}!`);
          console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
      });
  }
  );
};

startServer();
