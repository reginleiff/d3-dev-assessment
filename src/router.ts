import express, { Request, Response } from 'express';
// import { RequestHandler } from './types';
// import handlers from './handlers';

class Router {
  private app: any;
  private router: express.Router;

  constructor(port: number) {
    this.app = express();
    this.router = express.Router();
    this.loadRoutes();
    this.serve(port);
  }

  private loadRoutes() {}

  private serve(port: number) {
    this.app.use('/', this.router);
    this.app.listen(port, () => console.log(`Listening on ${port}`));
  }
}

export default Router;
